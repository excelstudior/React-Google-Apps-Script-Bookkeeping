// 1. Import your singleton database service and structural tab helpers
import { dbService, getSheetsData } from "./db";

// 2. Import your strict isolatedModules-compliant database types
import type { ColumnSchema, BatchValidationResult } from "./db";

// 3. EXPORT ALL NATIVE UI BOILERPLATE METHODS WITHOUT OMISSIONS
// This maps directly to the UI macros configured in your src/server/ui.js file
export { 
  onOpen,
  openDialogBootstrap,
  openDatabaseStudio,
} from "./ui";

// =========================================================================
// PUBLIC DATABASE ENGINE CONTROLLER ENDPOINTS (EXPOSED TO GAS-CLIENT)
// =========================================================================

/**
 * DATABASE API: Returns a structured summary array of all active layout sheets.
 */
export const dbGetSheetsSummary = (): ReturnType<typeof getSheetsData> => {
  return getSheetsData();
};

/**
 * DATABASE API: Safely initializes a table schema if it doesn't exist yet.
 */
export const dbInitializeTable = (sheetName: string, schema: ColumnSchema[]): boolean => {
  return dbService.initializeTable(sheetName, schema);
};

/**
 * DATABASE API: Fetches all table row data transformed as clean JSON objects.
 */
export const dbFetchAllRecords = (tableName: string): Record<string, any>[] => {
  return dbService.fetchAllRecords(tableName);
};

/**
 * DATABASE API: Fetches a single database record using its primary tracking ID.
 */
export const dbFetchRecordById = (tableName: string, idValue: any, idColumnName: string = "ID"): Record<string, any> | null => {
  return dbService.fetchRecordById(tableName, idValue, idColumnName);
};

/**
 * DATABASE API: Inserts a single record object while running transactional log tracking rules.
 */
export const dbInsertRecord = (tableName: string, rowData: Record<string, any>): Record<string, any> | null => {
  return dbService.insertRecord(tableName, rowData);
};

/**
 * DATABASE API: Commits a high-volume array of rows atomically in a single network block matrix.
 */
export const dbInsertBatchRecords = (tableName: string, rowsArray: Record<string, any>[], schema: ColumnSchema[]): BatchValidationResult => {
  return dbService.insertBatchRecords(tableName, rowsArray, schema);
};

/**
 * DATABASE API: Updates specific columns for a record matching a unique ID while logging snapshots.
 */
export const dbUpdateRecord = (tableName: string, idValue: any, updateData: Record<string, any>, idColumnName: string = "ID"): Record<string, any> | null => {
  return dbService.updateRecord(tableName, idValue, updateData, idColumnName);
};

/**
 * DATABASE API: Deletes a parent record and auto-wipes downstream orphan rows with undo log captures.
 */
export const dbDeleteRecordCascade = (tableName: string, idValue: any): boolean => {
  return dbService.deleteRecordCascade(tableName, idValue);
};

// =========================================================================
// PUBLIC DATABASE TRANSACTION LIFECYCLE HOOKS
// =========================================================================

/**
 * TRANSACTION API: Starts a secure database transaction boundary log.
 */
export const dbBeginTransaction = (): void => {
  dbService.beginTransaction();
};

/**
 * TRANSACTION API: Commits the active transaction, clearing the undo cache log.
 */
export const dbCommitTransaction = (): void => {
  dbService.commitTransaction();
};

/**
 * TRANSACTION API: Reverses all mutations applied during the active session.
 */
export const dbRollbackTransaction = (): void => {
  dbService.rollbackTransaction();
};
