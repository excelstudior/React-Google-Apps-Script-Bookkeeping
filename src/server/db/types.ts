export interface ColumnSchema {
  name: string;
  type: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'CHECKBOX';
  required?: boolean;
  validationRegex?: string; // 🌟 FIXED: Changed from RegExp to string for Google serialization compatibility
  validationErrorMessage?: string;
}

export interface SchemaOptions {
  idColumnName?: string;
  relations?: CascadeRelation[];
}

export interface CascadeRelation {
  childSheetName: string;
  foreignKeyColumnName: string;
}

export interface SheetMetadataRegistry {
  sheetName: string;
  idColumnName: string;
  columns: { name: string; type: string }[];
  relations: CascadeRelation[];
}

export interface BatchValidationResult {
  isValid: boolean;
  errors: string[];
  validatedData: Record<string, any>[];
}

export interface SheetMetadata {
  name: string;
  index: number;
  isActive: boolean;
}

export interface ForeignKeyValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface InsertUndoOperation {
  type: 'INSERT';
  sheetName: string;
  idValue: string;
  idColumnName: string;
}

export interface UpdateUndoOperation {
  type: 'UPDATE';
  sheetName: string;
  idValue: string;
  idColumnName: string;
  previousRowValues: Record<string, any>;
}

export interface DeleteUndoOperation {
  type: 'DELETE';
  sheetName: string;
  previousRowValues: Record<string, any>;
  targetRowIndex: number;
}

export type UndoOperation = InsertUndoOperation | UpdateUndoOperation | DeleteUndoOperation;

export interface TransactionSession {
  isActive: boolean;
  undoLog: UndoOperation[];
}
