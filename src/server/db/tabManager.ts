import { SheetMetadata, ColumnSchema, SchemaOptions, SheetMetadataRegistry } from "./types";
import { saveSheetToRegistry } from "./schemaRegistry";

const getSheets = (): GoogleAppsScript.Spreadsheet.Sheet[] => SpreadsheetApp.getActive().getSheets();

const getActiveSheetName = (): string => SpreadsheetApp.getActive().getSheetName();

/**
 * Returns descriptive tracking metadata maps for every tab inside the file container.
 */
export const getSheetsData = (): SheetMetadata[] => {
  const activeSheetName = getActiveSheetName();
  return getSheets().map((sheet, index) => {
    const name = sheet.getName();
    return {
      name,
      index,
      isActive: name === activeSheetName,
    };
  });
};

/**
 * Adds a basic unformatted layout view sheet tab.
 */
export const addSheet = (sheetTitle: string): SheetMetadata[] => {
  SpreadsheetApp.getActive().insertSheet(sheetTitle);
  return getSheetsData();
};

/**
 * Deletes a targeted sheet tab layer by index tracking flags.
 */
export const deleteSheet = (sheetIndex: number): SheetMetadata[] => {
  const sheets = getSheets();
  if (sheets[sheetIndex]) {
    SpreadsheetApp.getActive().deleteSheet(sheets[sheetIndex]);
  }
  return getSheetsData();
};

/**
 * Shifts the focus viewport window context to highlight a specific target tab.
 */
export const setActiveSheet = (sheetName: string): SheetMetadata[] => {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (sheet) {
    sheet.activate();
  }
  return getSheetsData();
};

/**
 * Creates a brand new database-ready sheet, inserts a primary ID column,
 * builds styled headers, and configures field column tracking validation settings.
 */
export const createSheetWithSchema = (
  sheetName: string, 
  customColumns: ColumnSchema[], 
  options: SchemaOptions = {}
): GoogleAppsScript.Spreadsheet.Sheet | null => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSheetByName(sheetName)) {
    console.warn(`Sheet '${sheetName}' already exists.`);
    return ss.getSheetByName(sheetName);
  }
  
  const sheet = ss.insertSheet(sheetName);
  const idColumnName = options.idColumnName || "ID";
  const idColumn: ColumnSchema = { name: idColumnName, type: "TEXT", required: true };
  const fullColumnsSchema: ColumnSchema[] = [idColumn, ...customColumns];
  
  const headerRowValues = fullColumnsSchema.map(col => col.name);
  sheet.appendRow(headerRowValues);
  
  const headerRange = sheet.getRange(1, 1, 1, fullColumnsSchema.length);
  headerRange.setFontWeight('bold')
             .setBackground('#f3f3f3')
             .setBorder(true, true, true, true, true, true);

  const maxRows = sheet.getMaxRows();
  
  fullColumnsSchema.forEach((column, index) => {
    const columnIndex = index + 1;
    const columnRange = sheet.getRange(2, columnIndex, maxRows - 1, 1);
    
    switch (column.type) {
      case 'TEXT':
        columnRange.setNumberFormat('@'); 
        break;
      case 'NUMBER':
        columnRange.setNumberFormat('#,##0.00');
        break;
      case 'CURRENCY':
        columnRange.setNumberFormat('$#,##0.00');
        break;
      case 'DATE':
        columnRange.setNumberFormat('yyyy-mm-dd');
        break;
      case 'CHECKBOX':
        const checkboxRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
        columnRange.setDataValidation(checkboxRule);
        break;
    }
  });
  
  const registryItem: SheetMetadataRegistry = {
    sheetName,
    idColumnName,
    columns: fullColumnsSchema.map(c => ({ name: c.name, type: c.type })),
    relations: options.relations || []
  };
  
  saveSheetToRegistry(registryItem);
  
  SpreadsheetApp.flush();
  return sheet;
};
