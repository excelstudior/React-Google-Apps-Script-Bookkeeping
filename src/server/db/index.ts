// 1. Explicitly export your type models using 'export type' (Required for isolatedModules)
export type {
  ColumnSchema,
  SchemaOptions,
  CascadeRelation,
  SheetMetadataRegistry,
  BatchValidationResult,
  SheetMetadata,
  ForeignKeyValidationResult,
  UndoOperation,          
  TransactionSession      
} from "./types";

// 2. Explicitly export your centralized, error-handled singleton service instance
// This is your master transaction and validation gateway controller
export { dbService } from "./dbService";

// 3. Explicitly export your public administrative storage commands
export {
  clearCompleteSchemaRegistry,
  auditSchemaRegistryLayout
} from "./schemaRegistry";

// 4. Explicitly export your tab architecture runtime utilities
export {
  getSheetsData,
  addSheet,
  deleteSheet,
  setActiveSheet
} from "./tabManager";
