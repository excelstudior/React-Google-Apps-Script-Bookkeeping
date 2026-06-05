import { ColumnSchema, BatchValidationResult, ForeignKeyValidationResult } from "./types";
import { loadSchemaRegistry } from "./schemaRegistry";

// ==========================================
// 1. REUSABLE UTILITY HELPERS
// ==========================================

/**
 * Retrieves the header row of a specific sheet as a flat string array.
 */
export const getSheetHeaders = (sheet: GoogleAppsScript.Spreadsheet.Sheet): string[] | null => {
  const lastColumn: number = sheet.getLastColumn();
  if (lastColumn === 0) return null;
  
  return sheet.getRange(1, 1, 1, lastColumn)
    .getValues()
    .map(header => String(header));
};

/**
 * Reconstructs a flat row array back into a key-value object using the headers.
 */
export const mapRowValuesToObject = (headers: string[], rowValues: any[]): Record<string, any> => {
  const resultObject: Record<string, any> = {};
  headers.forEach((header: string, index: number) => {
    resultObject[header] = rowValues[index] !== undefined ? rowValues[index] : "";
  });
  return resultObject;
};

/**
 * Finds the actual row index number based on a unique identifier value.
 * Returns -1 if the ID is not found.
 */
export const findRowIndexById = (sheet: GoogleAppsScript.Spreadsheet.Sheet, idColumnName: string, idValue: any): number => {
  const headers = getSheetHeaders(sheet);
  if (!headers) return -1;

  const idColumnIndex = headers.indexOf(idColumnName);
  if (idColumnIndex === -1) {
    console.error(`ID Column '${idColumnName}' not found in headers.`);
    return -1;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1; 

  const idValues = sheet.getRange(2, idColumnIndex + 1, lastRow - 1, 1).getValues();
  
  for (let i = 0; i < idValues.length; i++) {
    if (String(idValues[i]) === String(idValue)) {
      return i + 2; 
    }
  }
  return -1;
};

/**
 * INTEGRITY CHECK: Verifies if the parent record actually exists 
 * before letting a child sheet insert a matching foreign key.
 */
export const verifyForeignKeyConstraint = (
  childSheetName: string, 
  dataToInsert: Record<string, any>
): ForeignKeyValidationResult => {
  const registry = loadSchemaRegistry();
  const allRegisteredSheets = Object.values(registry);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const parentConfig of allRegisteredSheets) {
    const activeRelations = parentConfig.relations.filter(r => r.childSheetName === childSheetName);

    for (const relation of activeRelations) {
      const foreignKeyValue = dataToInsert[relation.foreignKeyColumnName];

      if (foreignKeyValue !== undefined && foreignKeyValue !== null && String(foreignKeyValue).trim() !== "") {
        const parentSheet = ss.getSheetByName(parentConfig.sheetName);
        if (!parentSheet) continue;

        const parentRowIndex = findRowIndexById(parentSheet, parentConfig.idColumnName, foreignKeyValue);
        
        if (parentRowIndex === -1) {
          return {
            isValid: false,
            errorMessage: `Foreign Key Constraint Violation: Cannot add record to '${childSheetName}'. ` +
                          `The value "${foreignKeyValue}" in column '${relation.foreignKeyColumnName}' ` +
                          `does not exist as a primary key record in parent sheet '${parentConfig.sheetName}'.`
          };
        }
      }
    }
  }

  return { isValid: true };
};

// ==========================================
// 2. CORE CRUD OPERATIONS
// ==========================================

/**
 * CREATE ONE (WITH INTEGRITY): Appends a single row safely. Blocks the insertion
 * if a Foreign Key reference cannot be found in a parent table or generates a secure UUID if needed.
 */
export const addRowWithIntegrity = (
  forSheet: string, 
  withData: Record<string, any>, 
  idColumnName: string = "ID"
): Record<string, any> | null => {
  const integrityCheck = verifyForeignKeyConstraint(forSheet, withData);
  if (!integrityCheck.isValid) {
    console.error(integrityCheck.errorMessage);
    return null; 
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(forSheet);
  if (!sheet) return null;
  
  const headers = getSheetHeaders(sheet);
  if (!headers) return null;

  const dataToInsert = { ...withData };
  if (!dataToInsert[idColumnName] || String(dataToInsert[idColumnName]).trim() === "") {
    dataToInsert[idColumnName] = Utilities.getUuid();
  }
  
  const newRowData: any[] = headers.map((header: string) => {
    return Object.prototype.hasOwnProperty.call(dataToInsert, header) ? dataToInsert[header] : "";
  });
  
  sheet.appendRow(newRowData);
  SpreadsheetApp.flush();
  
  const addedRowNumber: number = sheet.getLastRow();
  const addedRowValues: any[] = sheet.getRange(addedRowNumber, 1, 1, headers.length).getValues();
  
  return mapRowValuesToObject(headers, addedRowValues);
};

/**
 * READ ONE: Finds and returns a single row object by its unique ID.
 */
export const getRowById = (forSheet: string, idColumnName: string, idValue: any): Record<string, any> | null => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(forSheet);
  if (!sheet) return null;

  const rowIndex = findRowIndexById(sheet, idColumnName, idValue);
  if (rowIndex === -1) return null;

  const headers = getSheetHeaders(sheet)!;
  const rowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues();

  return mapRowValuesToObject(headers, rowValues);
};

/**
 * READ ALL: Returns every row in the sheet as an array of structured objects.
 */
export const getAllRows = (forSheet: string): Record<string, any>[] => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(forSheet);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  const headers = getSheetHeaders(sheet);
  if (!headers) return [];

  const allValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  return allValues.map(rowValues => mapRowValuesToObject(headers, rowValues));
};

/**
 * UPDATE: Updates specific column fields for a row matching a unique ID.
 */
export const updateRowById = (
  forSheet: string, 
  idColumnName: string, 
  idValue: any, 
  updateData: Record<string, any>
): Record<string, any> | null => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(forSheet);
  if (!sheet) return null;

  const rowIndex = findRowIndexById(sheet, idColumnName, idValue);
  if (rowIndex === -1) return null;

  const headers = getSheetHeaders(sheet)!;

  headers.forEach((header, index) => {
    if (Object.prototype.hasOwnProperty.call(updateData, header) && header !== idColumnName) {
      sheet.getRange(rowIndex, index + 1).setValue(updateData[header]);
    }
  });

  SpreadsheetApp.flush();
  
  const updatedRowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues();
  return mapRowValuesToObject(headers, updatedRowValues);
};

/**
 * SMART CASCADE DELETE: Looks up a parent's saved structural properties,
 * loops backwards from the bottom up to safely purge child records, and deletes the parent.
 */
export const deleteRowByIdCascadeSmart = (
  parentSheetName: string,
  idValue: any
): boolean => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const parentSheet = ss.getSheetByName(parentSheetName);
  if (!parentSheet) return false;

  const registry = loadSchemaRegistry();
  const sheetConfig = registry[parentSheetName];
  
  if (!sheetConfig) {
    console.error(`Metadata properties missing for sheet layout '${parentSheetName}'.`);
    return false;
  }

  const idColumnName = sheetConfig.idColumnName;
  const parentRowIndex = findRowIndexById(parentSheet, idColumnName, idValue);
  if (parentRowIndex === -1) return false;

  sheetConfig.relations.forEach(relation => {
    const childSheet = ss.getSheetByName(relation.childSheetName);
    if (!childSheet) return;

    const childHeaders = getSheetHeaders(childSheet);
    if (!childHeaders) return;

    const fkIndex = childHeaders.indexOf(relation.foreignKeyColumnName);
    if (fkIndex === -1) return;

    const lastRow = childSheet.getLastRow();
    if (lastRow <= 1) return;

    const fkValues = childSheet.getRange(2, fkIndex + 1, lastRow - 1, 1).getValues();

    for (let i = fkValues.length - 1; i >= 0; i--) {
      if (String(fkValues[i]) === String(idValue)) {
        childSheet.deleteRow(i + 2);
      }
    }
  });

  parentSheet.deleteRow(parentRowIndex);
  SpreadsheetApp.flush();
  return true;
};

// ==========================================
// 3. ATOMIC BATCH VALIDATION & WRITER
// ==========================================

/**
 * BATCH ADD WITH INTEGRITY: Validates types, formats, regex configurations,
 * and foreign keys locally. Commits via a single 2D range matrix chunk ONLY if all pass.
 */
export const addRowsBatch = (
  forSheet: string,
  dataRows: Record<string, any>[],
  schema: ColumnSchema[],
  idColumnName: string = "ID"
): BatchValidationResult => {
  const result: BatchValidationResult = { isValid: true, errors: [], validatedData: [] };
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(forSheet);
  if (!sheet) {
    result.isValid = false;
    result.errors.push(`Target sheet '${forSheet}' does not exist.`);
    return result;
  }

  const headers = getSheetHeaders(sheet);
  if (!headers) {
    result.isValid = false;
    result.errors.push(`Headers not found for sheet '${forSheet}'.`);
    return result;
  }

  const fullSchemaMap = new Map<string, ColumnSchema>();
  fullSchemaMap.set(idColumnName, { name: idColumnName, type: "TEXT", required: false });
  schema.forEach(col => fullSchemaMap.set(col.name, col));

  const dynamicRowsMatrix: any[][] = [];

  dataRows.forEach((row, index) => {
    const rowId = index + 1;
    const workingRowCopy = { ...row };

        // 1. Manage automated UUID mapping criteria upfront
    if (!workingRowCopy[idColumnName] || String(workingRowCopy[idColumnName]).trim() === "") {
      workingRowCopy[idColumnName] = Utilities.getUuid();
    }

    // 2. Run relational foreign key constraint validation
    const integrityCheck = verifyForeignKeyConstraint(forSheet, workingRowCopy);
    if (!integrityCheck.isValid) {
      result.isValid = false;
      result.errors.push(`Row ${rowId}: ${integrityCheck.errorMessage}`);
    }

    // 3. Evaluate normal field schema type constraints and custom regex formats
    headers.forEach(headerName => {
      const fieldSchema = fullSchemaMap.get(headerName);
      const val = workingRowCopy[headerName];

      if (fieldSchema?.required && (val === undefined || val === null || String(val).trim() === "")) {
        result.isValid = false;
        result.errors.push(`Row ${rowId}: Mandatory column field '${headerName}' is missing/empty.`);
      }

      if (val !== undefined && val !== null && String(val).trim() !== "") {
        if (fieldSchema?.type === 'NUMBER' || fieldSchema?.type === 'CURRENCY') {
          if (isNaN(Number(val))) {
            result.isValid = false;
            result.errors.push(`Row ${rowId}: Column '${headerName}' expects a numeric type instead of: "${val}".`);
          }
        }
        if (fieldSchema?.type === 'DATE' && isNaN(Date.parse(String(val)))) {
          result.isValid = false;
          result.errors.push(`Row ${rowId}: Column '${headerName}' requires a valid parseable date structure.`);
        }

        // 🌟 FIXED: Dynamic safe instantiation to prevent property storage corruption
        if (fieldSchema?.validationRegex) {
          try {
            const compiledRegex = new RegExp(fieldSchema.validationRegex);
            const isMatch = compiledRegex.test(String(val));
            if (!isMatch) {
              result.isValid = false;
              const defaultMsg = `Value "${val}" fails custom structure pattern matching requirements.`;
              result.errors.push(`Row ${rowId} [Column '${headerName}']: ${fieldSchema.validationErrorMessage || defaultMsg}`);
            }
          } catch (regError) {
            result.isValid = false;
            result.errors.push(`Row ${rowId}: System error compiling regular expression for '${headerName}'.`);
          }
        }
      }
    });

    // 4. Queue valid elements into the temporary transaction data matrix buffer
    if (result.isValid) {
      const flatRowVector = headers.map(header => {
        return Object.prototype.hasOwnProperty.call(workingRowCopy, header) ? workingRowCopy[header] : "";
      });
      dynamicRowsMatrix.push(flatRowVector);
      result.validatedData.push(workingRowCopy);
    }
  });

  // --- Step 5: Atomic Transaction Verification Flag Gates ---
  if (!result.isValid) {
    console.error("Batch Transaction Aborted due to validation or relationship errors. Sheet unchanged.");
    return result; 
  }

  if (dynamicRowsMatrix.length > 0) {
    const targetRowStartIndex = sheet.getLastRow() + 1;
    const totalInputRows = dynamicRowsMatrix.length;
    const totalInputCols = headers.length;

    const batchTargetRange = sheet.getRange(targetRowStartIndex, 1, totalInputRows, totalInputCols);
    batchTargetRange.setValues(dynamicRowsMatrix);
    
    SpreadsheetApp.flush();
    console.log(`Successfully batch inserted ${totalInputRows} structural relational items.`);
  }

  return result;
};

// ==========================================
// SYSTEM LOG TRANSACTIONS & ROLLBACK UTIL
// ==========================================

/**
 * RAW OVERRIDE UTIL: Forces a hard structural row overwrite or cell insertion 
 * bypassing normal interceptors. Crucial for system log rollbacks.
 * 
 * Note: Append this to the bottom of dbEngine.ts. Do not import dbEngine functions into itself.
 */
export const rawWriteRowAtCoordinates = (
  sheetName: string,
  rowIndex: number,
  rowData: Record<string, any>
): void => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  // Uses the local file's function directly without self-importing
  const headers = getSheetHeaders(sheet);
  if (!headers) return;

  // Maps properties into a flat array structure
  const flatRowVector = headers.map(header => 
    Object.prototype.hasOwnProperty.call(rowData, header) ? rowData[header] : ""
  );

  // FIX: Wraps the flat array inside another array to make it a valid 2D Matrix [[val1, val2]]
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([flatRowVector]);
  SpreadsheetApp.flush();
};
