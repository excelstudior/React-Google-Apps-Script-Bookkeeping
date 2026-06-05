export interface ColumnSchema {
  name: string;
  type: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'CHECKBOX';
  required?: boolean;
  validationRegex?: string; // 🌟 FIXED: Changed from RegExp to string for safe serialization
  validationErrorMessage?: string;
}

export interface TableProps {
  title: string;
  colorClass: string;
  data: any[];
  emptyMessage: string;
  renderRow: (item: any) => React.ReactNode;
}

export interface LoggerConsoleProps {
  logs: string[];
  onClear: () => void;
}

export interface HeaderProps {
  onRefresh: () => void;
}

export interface SidebarProps {
  isLoading: boolean;
  formName: string;
  formEmail: string;
  formCompanyId: string;
  companies: any[];
  setFormName: (val: string) => void;
  setFormEmail: (val: string) => void;
  setFormCompanyId: (val: string) => void;
  onInitializeSchema: () => void;
  onSingleInsert: (e: React.FormEvent) => void;
  onSeedBatch: (triggerFailure: boolean) => void;
  onTestRollback: () => void;
}

export interface DataGridProps {
  sheetsSummary: any[];
  companies: any[];
  employees: any[];
  onCascadeDeleteCompany: (id: any) => void;
}
