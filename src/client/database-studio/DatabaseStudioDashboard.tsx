import { FC, FormEvent, useEffect, useState } from 'react';
import { SCHEMAS, generateMockBatchPayload } from "./mockData";
import { LoggerConsole } from "./BaseWidgets";
import { DashboardHeader } from "./DashboardHeader";
import { ControlSidebar } from "./ControlSidebar";
import { DataGridSection } from "./DataGridSection";
import { serverFunctions } from "../utils/serverFunctions"; 

export const DatabaseStudioDashboard: FC = () => {
  const [sheetsSummary, setSheetsSummary] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["💻 System ready. Awaiting instructions..."]);

  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formCompanyId, setFormCompanyId] = useState<string>("");

  useEffect(() => {
    refreshDataSummary();
  }, []);

  const addLog = (message: string) => {
    setConsoleLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const refreshDataSummary = async () => {
    try {
      const summaries = await serverFunctions.dbGetSheetsSummary();
      setSheetsSummary(summaries);
      if (summaries.some((s: any) => s.name === "Companies")) {
        setCompanies(await serverFunctions.dbFetchAllRecords("Companies"));
      }
      if (summaries.some((s: any) => s.name === "Employees")) {
        setEmployees(await serverFunctions.dbFetchAllRecords("Employees"));
      }
    } catch (err: any) {
      addLog(`⚠️ Update Failure: ${err.message}`);
    }
  };

  const handleInitializeSchema = async () => {
    setIsLoading(true);
    addLog("🛠️ Requesting schema build from spreadsheet kernel...");
    try {
      await serverFunctions.dbInitializeTable("Companies", SCHEMAS.companies);
      await serverFunctions.dbInitializeTable("Employees", SCHEMAS.employees);
      addLog("✅ Schema success! Tables '[Companies]' & '[Employees]' established.");
      await refreshDataSummary();
    } catch (error: any) {
      addLog(`❌ Build aborted: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSingleInsert = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formCompanyId) {
      alert("Please populate all parameters!");
      return;
    }
    setIsLoading(true);
    addLog(`📤 Dispatching mutation payload for worker: "${formName}"`);
    try {
      const savedRecord = await serverFunctions.dbInsertRecord("Employees", {
        "Employer_ID": formCompanyId,
        "Staff Name": formName,
        "Contact Email": formEmail
      });
      if (savedRecord) {
        addLog(`✅ Saved cleanly! System ID: ${savedRecord.ID}`);
        setFormName("");
        setFormEmail("");
        await refreshDataSummary();
      }
    } catch (error: any) {
      addLog(`❌ Gatekeeper Blocked Insert: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedBatchDataset = async (triggerFailure: boolean) => {
    setIsLoading(true);
    addLog(`📦 Preparing batch payload (Simulation Failure Mode: ${triggerFailure})...`);
    try {
      const batchPayload = generateMockBatchPayload(triggerFailure);
      const batchResult = await serverFunctions.dbInsertBatchRecords("Employees", batchPayload, SCHEMAS.employees);
      if (batchResult.isValid) {
        addLog(`✅ Batch complete! ${batchResult.validatedData.length} records written atomically.`);
        await refreshDataSummary();
      } else {
        addLog(`❌ Batch rejected! Changes dropped cleanly. Errors: ${batchResult.errors.join(" | ")}`);
      }
    } catch (error: any) {
      addLog(`❌ Transaction Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRollbackBoundary = async () => {
    setIsLoading(true);
    addLog("🔒 Launching multi-sheet write transaction boundary block...");
    try {
      await serverFunctions.dbBeginTransaction();
      addLog(" -> Session started. Injecting row into '[Companies]'");
      const comp = await serverFunctions.dbInsertRecord("Companies", { "ID": "OSCORP_99", "Company Name": "Oscorp Industries" });
      if (!comp) throw new Error("Company insert returned no result");
      addLog(` -> Company written safely: ${comp.ID}`);

      addLog(" -> Injecting child row into '[Employees]' containing an intentional required-field error...");
      await serverFunctions.dbInsertRecord("Employees", { "Employer_ID": "OSCORP_99", "Staff Name": "", "Contact Email": "norman@oscorp.com" });

      await serverFunctions.dbCommitTransaction();
    } catch (error: any) {
      addLog(`🚨 Step failed inside loop context! Error: "${error.message}"`);
      addLog("🔄 Executing automated WAL undo rollback routine...");
      await serverFunctions.dbRollbackTransaction();
      addLog("⏪ Rollback complete! Oscorp Industries removed safely. Data layer protected.");
      await refreshDataSummary();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCascadeDeleteCompany = async (idValue: any) => {
    if (!confirm(`Trigger cascading delete for Company ID "${idValue}"? This removes the company and all assigned worker rows.`)) return;
    setIsLoading(true);
    addLog(`🗑️ Purging parent node context matching identifier reference: ${idValue}`);
    try {
      const wasPurged = await serverFunctions.dbDeleteRecordCascade("Companies", idValue);
      if (wasPurged) {
        addLog(`✅ Cascade successful. Parent table and child dependencies wiped clean.`);
        await refreshDataSummary();
      }
    } catch (error: any) {
      addLog(`❌ Deletion failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <DashboardHeader onRefresh={refreshDataSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ControlSidebar 
          isLoading={isLoading} formName={formName} formEmail={formEmail} formCompanyId={formCompanyId} companies={companies}
          setFormName={setFormName} setFormEmail={setFormEmail} setFormCompanyId={setFormCompanyId}
          onInitializeSchema={handleInitializeSchema} onSingleInsert={handleSingleInsert}
          onSeedBatch={handleSeedBatchDataset} onTestRollback={handleTestRollbackBoundary}
        />

        <div className="lg:col-span-2 space-y-6">
          <LoggerConsole logs={consoleLogs} onClear={() => setConsoleLogs([])} />
          
          <DataGridSection 
            sheetsSummary={sheetsSummary} companies={companies} employees={employees}
            onCascadeDeleteCompany={handleCascadeDeleteCompany}
          />
        </div>
      </div>
    </div>
  );
};
