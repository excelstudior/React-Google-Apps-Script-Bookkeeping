import type { ColumnSchema } from "./types";

export const SCHEMAS = {
  companies: [
    { name: "Company Name", type: "TEXT" as const, required: true },
    { 
      name: "Corporate Domain", 
      type: "TEXT" as const, 
      required: true,
      validationRegex: "^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", // 🌟 FIXED: Safe string pattern
      validationErrorMessage: "Must be a valid web domain address (e.g. acme-corp.com)."
    },
    { name: "Is Tax Exempt", type: "CHECKBOX" as const }
  ] as ColumnSchema[],
  
  employees: [
    { name: "Employer_ID", type: "TEXT" as const, required: true },
    { name: "Staff Name", type: "TEXT" as const, required: true },
    { 
      name: "Contact Email", 
      type: "TEXT" as const, 
      required: true,
      validationRegex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", // 🌟 FIXED: Safe string pattern
      validationErrorMessage: "Format requirement violation. Must use address: name@domain.com"
    },
    { 
      name: "Department Code", 
      type: "TEXT" as const, 
      required: true,
      validationRegex: "^DEP-\\d{3}$", // 🌟 FIXED: Safe string pattern
      validationErrorMessage: "Department layout mismatch. Must match strict format: DEP-###"
    },
    { name: "Hourly Billing Rate", type: "CURRENCY" as const, required: true },
    { name: "Contract Year Target", type: "NUMBER" as const, required: false },
    { name: "Hired Date", type: "DATE" as const, required: true },
    { name: "Has Admin Clearances", type: "CHECKBOX" as const }
  ] as ColumnSchema[]
};

export const MOCK_COMPANIES_SEED = [
  { "ID": "STARK_01", "Company Name": "Stark Industries", "Corporate Domain": "starkindustries.com", "Is Tax Exempt": false },
  { "ID": "WAYNE_02", "Company Name": "Wayne Enterprises", "Corporate Domain": "waynecorp.org", "Is Tax Exempt": true },
  { "ID": "OSCORP_03", "Company Name": "Oscorp Industries", "Corporate Domain": "oscorp-biotech.com", "Is Tax Exempt": false },
  { "ID": "PIM_04", "Company Name": "Pym Technologies", "Corporate Domain": "pymtech.io", "Is Tax Exempt": true },
  { "ID": "LEX_05", "Company Name": "LexCorp International", "Corporate Domain": "lexcorp.net", "Is Tax Exempt": false },
  { "ID": "SHIELD_06", "Company Name": "S.H.I.E.L.D. Logistical Operations", "Corporate Domain": "shield.gov", "Is Tax Exempt": true }
];

export const generateMockBatchPayload = (triggerFailure: boolean) => [
  {
    "Employer_ID": "STARK_01",
    "Staff Name": "Virginia Pepper Potts",
    "Contact Email": "pepper@starkindustries.com",
    "Department Code": "DEP-101",
    "Hourly Billing Rate": 185.50,
    "Contract Year Target": 12,
    "Hired Date": "2024-03-15",
    "Has Admin Clearances": true
  },
  {
    "Employer_ID": "STARK_01",
    "Staff Name": "Harold Happy Hogan",
    "Contact Email": "happy@starkindustries.com",
    "Department Code": triggerFailure ? "INVALID-DEPT-STRING" : "DEP-202",
    "Hourly Billing Rate": 95.00,
    "Contract Year Target": 6,
    "Hired Date": "2024-06-20",
    "Has Admin Clearances": false
  },
  {
    "Employer_ID": "WAYNE_02",
    "Staff Name": "Alfred Pennyworth",
    "Contact Email": "alfred@waynecorp.org",
    "Department Code": "DEP-707",
    "Hourly Billing Rate": 150.00,
    "Contract Year Target": 20,
    "Hired Date": "2019-01-01",
    "Has Admin Clearances": true
  },
  {
    "Employer_ID": "WAYNE_02",
    "Staff Name": "Lucius Fox",
    "Contact Email": "lucius.fox@waynecorp.org",
    "Department Code": "DEP-808",
    "Hourly Billing Rate": 250.00,
    "Contract Year Target": 15,
    "Hired Date": "2021-11-12",
    "Has Admin Clearances": true
  },
  {
    "Employer_ID": "OSCORP_03",
    "Staff Name": "Dr. Otto Octavius",
    "Contact Email": "o.octavius@oscorp-biotech.com",
    "Department Code": "DEP-303",
    "Hourly Billing Rate": 320.00,
    "Contract Year Target": 5,
    "Hired Date": "2025-05-14",
    "Has Admin Clearances": false
  },
  {
    "Employer_ID": "PIM_04",
    "Staff Name": "Hope van Dyne",
    "Contact Email": "hope.v@pymtech.io",
    "Department Code": "DEP-404",
    "Hourly Billing Rate": 195.00,
    "Contract Year Target": 8,
    "Hired Date": "2023-09-01",
    "Has Admin Clearances": true
  },
  {
    "Employer_ID": "SHIELD_06",
    "Staff Name": "Natasha Romanoff",
    "Contact Email": "n.romanoff@shield.gov",
    "Department Code": "DEP-007",
    "Hourly Billing Rate": 500.00,
    "Contract Year Target": 10,
    "Hired Date": "2020-05-01",
    "Has Admin Clearances": true
  }
];
