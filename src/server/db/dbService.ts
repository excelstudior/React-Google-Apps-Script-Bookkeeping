import { createSheetWithSchema } from "./tabManager";
import {
  getAllRows, 
  getRowById, 
  addRowWithIntegrity, 
  addRowsBatch, 
  updateRowById, 
  deleteRowByIdCascadeSmart,
  findRowIndexById,
  getSheetHeaders,
  rawWriteRowAtCoordinates,
  mapRowValuesToObject
} from "./dbEngine";
import type { ColumnSchema, BatchValidationResult, TransactionSession } from "./types";

export class ServerDbService {
  // Central runtime memory storage tracking active session logs
  private session: TransactionSession = {
    isActive: false,
    undoLog: []
  };

  // ==========================================
  // TRANSACTION SESSION HOOK CONTROL PANE
  // ==========================================

  /**
   * Starts a secure transaction boundary context window block.
   */
  beginTransaction(): void {
    if (this.session.isActive) {
      throw new Error("Transaction Collision: A database transaction session is already active.");
    }
    this.session.isActive = true;
    this.session.undoLog = [];
    console.log("Database transaction boundaries established securely.");
  }

  /**
   * Safely closes the active transaction window and flushes logs on successful completion.
   */
  commitTransaction(): void {
    if (!this.session.isActive) return;
    this.session.isActive = false;
    this.session.undoLog = [];
    console.log("Database transaction committed successfully. All changes saved permanently.");
  }

  /**
   * REVERSAL ENGINE: Iterates backwards through the Undo Log, 
   * undoing spreadsheet changes to guarantee transactional integrity.
   */
  rollbackTransaction(): void {
    if (!this.session.isActive || this.session.undoLog.length === 0) {
      this.session.isActive = false;
      return;
    }

    console.warn(`CRITICAL: Initiating database transaction rollback routine for ${this.session.undoLog.length} mutations...`);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Loop backwards (Last In, First Out) to properly undo nested or ordered writes
    for (let i = this.session.undoLog.length - 1; i >= 0; i--) {
      const op = this.session.undoLog[i];
      const sheet = ss.getSheetByName(op.sheetName);
      if (!sheet) continue;

      try {
        switch (op.type) {
          case 'INSERT': {
            // Undo an insert by completely deleting the newly appended row index
            const targetRow = findRowIndexById(sheet, op.idColumnName, op.idValue);
            if (targetRow !== -1) {
              sheet.deleteRow(targetRow);
              console.log(`Rollback: Removed inserted row ${targetRow} from '${op.sheetName}'`);
            }
            break;
          }

          case 'UPDATE': {
            // Undo an update by rewriting the original record snapshots back to its index
            const targetRow = findRowIndexById(sheet, op.idColumnName, op.idValue);
            if (targetRow !== -1) {
              rawWriteRowAtCoordinates(op.sheetName, targetRow, op.previousRowValues);
              console.log(`Rollback: Restored original row values at index ${targetRow} in '${op.sheetName}'`);
            }
            break;
          }

          case 'DELETE': {
            // Undo a delete by injecting the deleted row snapshot exactly back where it was
            sheet.insertRowBefore(op.targetRowIndex);
            rawWriteRowAtCoordinates(op.sheetName, op.targetRowIndex, op.previousRowValues);
            console.log(`Rollback: Re-inserted deleted row record at coordinates ${op.targetRowIndex} inside '${op.sheetName}'`);
            break;
          }
        }
      } catch (err) {
        console.error(`Fatal Rollback System Error processing operation index ${i}: ${String(err)}`);
      }
    }

    // Reset session boundaries
    this.session.isActive = false;
    this.session.undoLog = [];
    SpreadsheetApp.flush();
    console.log("Database state successfully rolled back and synchronized.");
  }

  // ==========================================
  // CORE CRUD WRAPPERS FEATURING AUTO LOGGING
  // ==========================================

  initializeTable(tableName: string, schema: ColumnSchema[]): boolean {
    try {
      const sheet = createSheetWithSchema(tableName, schema);
      return !!sheet;
    } catch (error) {
      throw new Error(`Database Initialization Error: ${String(error)}`);
    }
  }

  fetchAllRecords<T = Record<string, any>>(tableName: string): T[] {
    return getAllRows(tableName) as T[];
  }

  fetchRecordById<T = Record<string, any>>(tableName: string, idValue: any, idColumnName: string = "ID"): T | null {
    return getRowById(tableName, idColumnName, idValue) as T | null;
  }

  insertRecord<T = Record<string, any>>(tableName: string, rowData: Record<string, any>, idColumnName: string = "ID"): T {
    const result = addRowWithIntegrity(tableName, rowData, idColumnName);
    if (!result) {
      throw new Error(`Transaction Rejected: Validation/Relation Error on table '${tableName}'.`);
    }

    // Capture Undo data if running inside a live transaction block
    if (this.session.isActive) {
      this.session.undoLog.push({
        type: 'INSERT',
        sheetName: tableName,
        idValue: String(result[idColumnName]),
        idColumnName: idColumnName
      });
    }

    return result as T;
  }

  updateRecord<T = Record<string, any>>(tableName: string, idValue: any, updateData: Record<string, any>, idColumnName: string = "ID"): T {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(tableName);
    let originalSnapshot: Record<string, any> = {};

    // Take a point-in-time snapshot before rewriting parameters
    if (this.session.isActive && sheet) {
      const targetRow = findRowIndexById(sheet, idColumnName, idValue);
      if (targetRow !== -1) {
        const headers = getSheetHeaders(sheet)!;
        const currentValues = sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0];
        originalSnapshot = mapRowValuesToObject(headers, currentValues);
      }
    }

    const result = updateRowById(tableName, idColumnName, idValue, updateData);
    if (!result) {
      throw new Error(`Failed to update: Record with ID '${idValue}' not found in table '${tableName}'.`);
    }

    if (this.session.isActive && Object.keys(originalSnapshot).length > 0) {
      this.session.undoLog.push({
        type: 'UPDATE',
        sheetName: tableName,
        idValue: String(idValue),
        idColumnName: idColumnName,
        previousRowValues: originalSnapshot
      });
    }

    return result as T;
  }

  deleteRecordCascade(tableName: string, idValue: any, idColumnName: string = "ID"): boolean {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(tableName);
    let originalSnapshot: Record<string, any> = {};
    let targetRowIndex = -1;

    if (this.session.isActive && sheet) {
      targetRowIndex = findRowIndexById(sheet, idColumnName, idValue);
      if (targetRowIndex !== -1) {
        const headers = getSheetHeaders(sheet)!;
        const currentValues = sheet.getRange(targetRowIndex, 1, 1, headers.length).getValues()[0];
        originalSnapshot = mapRowValuesToObject(headers, currentValues);
      }
    }

    // Execute deletion mutation
    const result = deleteRowByIdCascadeSmart(tableName, idValue);

    if (result && this.session.isActive && targetRowIndex !== -1) {
      this.session.undoLog.push({
        type: 'DELETE',
        sheetName: tableName,
        previousRowValues: originalSnapshot,
        targetRowIndex: targetRowIndex
      });
    }

    return result;
  }

  insertBatchRecords(tableName: string, rowsArray: Record<string, any>[], schema: ColumnSchema[]): BatchValidationResult {
    // For batch inserts, let the native code group operations together in bulk matrices
    return addRowsBatch(tableName, rowsArray, schema);
  }
}

export const dbService = new ServerDbService();
