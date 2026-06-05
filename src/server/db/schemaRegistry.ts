import { SheetMetadataRegistry, CascadeRelation } from "./types";

const REGISTRY_KEY = "GS_DB_SCHEMA_REGISTRY";

/**
 * Loads the complete database schema architecture map from persistent storage.
 */
export const loadSchemaRegistry = (): Record<string, SheetMetadataRegistry> => {
  const props = PropertiesService.getScriptProperties();
  const rawData = props.getProperty(REGISTRY_KEY);
  return rawData ? JSON.parse(rawData) : {};
};

/**
 * Saves a sheet's structural layout configuration and relations to persistent memory.
 */
export const saveSheetToRegistry = (registryItem: SheetMetadataRegistry): void => {
  const props = PropertiesService.getScriptProperties();
  const currentRegistry = loadSchemaRegistry();
  
  currentRegistry[registryItem.sheetName] = registryItem;
  props.setProperty(REGISTRY_KEY, JSON.stringify(currentRegistry));
};

/**
 * Automatically appends a new downstream cascade dependency to an existing parent sheet definition.
 */
export const registerCascadeRelation = (parentSheetName: string, relation: CascadeRelation): boolean => {
  const props = PropertiesService.getScriptProperties();
  const currentRegistry = loadSchemaRegistry();
  
  if (!currentRegistry[parentSheetName]) {
    console.error(`Cannot assign relation: Parent sheet '${parentSheetName}' does not exist in registry.`);
    return false;
  }
  
  const alreadyExists = currentRegistry[parentSheetName].relations.some(
    rel => rel.childSheetName === relation.childSheetName && rel.foreignKeyColumnName === relation.foreignKeyColumnName
  );
  
  if (!alreadyExists) {
    currentRegistry[parentSheetName].relations.push(relation);
    props.setProperty(REGISTRY_KEY, JSON.stringify(currentRegistry));
    console.log(`Relation linked persistently: ${parentSheetName} -> ${relation.childSheetName}`);
  }
  return true;
};

/**
 * ADMIN: Clears out all database schema maps from the persistent storage properties memory.
 */
export const clearCompleteSchemaRegistry = (): void => {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(REGISTRY_KEY);
  console.log("Database schema registry completely cleared from script properties.");
};

/**
 * ADMIN: Logs an architectural printout of all sheets, schemas, and relationships.
 */
export const auditSchemaRegistryLayout = (): void => {
  const registry = loadSchemaRegistry();
  const keys = Object.keys(registry);
  
  if (keys.length === 0) {
    console.log("The schema registry memory is currently empty.");
    return;
  }
  
  console.log("=== DATABASE ENGINE SCHEMA REGISTRY AUDIT ===");
  keys.forEach(sheetName => {
    const config = registry[sheetName];
    console.log(`[Sheet Tab]: ${sheetName} (Primary Key Column: "${config.idColumnName}")`);
    console.log(` -> Columns registered: ${config.columns.map(c => `${c.name} (${c.type})`).join(', ')}`);
    if (config.relations && config.relations.length > 0) {
      config.relations.forEach(rel => {
        console.log(` -> DOWNSTREAM RELATIONSHIP: Child [${rel.childSheetName}] relies on Foreign Key ["${rel.foreignKeyColumnName}"]`);
      });
    } else {
      console.log(" -> Downstream Relationships: None.");
    }
    console.log("--------------------------------------------");
  });
};
