// src/content/services.js
export const servicesHeader = {
  title: 'Audit, Tax & Advisory — Core Services',
  sub: 'Statutory audit & assurance, taxation & compliance, project-finance documentation, and business & corporate advisory services.',
};

export const services = [
  {
    key: 'audit',
    icon: 'FileText',
    title: 'Audit & Assurance',
    desc: 'Statutory, internal and stock audits conducted as per applicable standards and laws.',
  },
  {
    key: 'tax',
    icon: 'Banknote',
    title: 'Taxation & Compliance',
    desc: 'Direct and indirect tax support including GST, TDS & Income-tax filings, and ROC/secretarial compliance.',
  },
  {
    key: 'corp',
    icon: 'Scale',
    title: 'Business & Corporate Advisory',
    desc: 'Entity incorporation, routine secretarial filings, and advisory across applicable business structures.',
  },
  {
    key: 'cfo',
    icon: 'ShieldCheck',
    title: 'CFO Advisory & Controls',
    desc: 'Support for project-finance documentation, MIS & internal controls, and SOP implementation for MSMEs.',
  },

  // ✅ Additional, ICAI-compliant services
  {
    key: 'projectFinance',
    icon: 'ShieldCheck', // reusing mapped icon
    title: 'Project Finance & Banking Support',
    desc: 'Preparation of CMA data, projections and banking documentation for eligible credit proposals.',
  },
  {
    key: 'certification',
    icon: 'FileText',
    title: 'Certification & Attestation (as permitted)',
    desc: 'Issue of reports/certificates permitted to practicing chartered accountants under applicable statutes.',
  },
  {
    key: 'complianceMgmt',
    icon: 'Scale',
    title: 'Compliance Management',
    desc: 'Periodic compliance calendars, returns tracking and statutory registers maintenance as applicable.',
  },
  {
    key: 'secretarial',
    icon: 'FileText',
    title: 'ROC/Secretarial Support',
    desc: 'Company/LLP filings and event-based forms as per the Companies Act/LLP Act and allied rules.',
  },
  {
    key: 'misControls',
    icon: 'ShieldCheck',
    title: 'MIS, Policies & Internal Controls',
    desc: 'Design and implementation of MIS, process documentation and internal control procedures.',
  },
  {
    key: 'registrations',
    icon: 'Banknote',
    title: 'Registrations & Licences',
    desc: 'Assistance with statutory registrations and amendments with relevant authorities.',
  },
];

export const serviceDetails = {
  audit: [
    'Statutory audit (Companies/LLPs/Trusts as applicable)',
    'Internal audit and reporting',
    'Bank/stock audits as assigned',
    'Compliance with Standards on Auditing',
    'IFC/ICFR documentation (where applicable)',
    'Audit working papers and management letters',
  ],
  tax: [
    'GST registration & returns',
    'TDS/TCS returns',
    'Income-tax returns and submissions',
    'Assessment support as permitted by law',
    'Tax audit report preparation (where applicable)',
    'Form 15CA/CB issuance (as per eligibility)',
  ],
  corp: [
    'Entity selection considerations (Company/LLP/other structures as applicable)',
    'Incorporation documentation and PAN/TAN application',
    'Board/shareholder resolutions and annual filings',
    'Event-based filings (change in capital/office/management etc.)',
  ],
  cfo: [
    'Review of books and monthly closing discipline',
    'Design of SOPs for purchases, sales, inventory and cash/bank',
    'Management reporting (MIS) formats and dashboards',
    'Working capital monitoring and variance analysis',
  ],

  // New sections
  projectFinance: [
    'CMA data preparation and financial projections',
    'Term loan/working capital proposal notes and annexures',
    'Projected balance sheet, P&L and cash-flow statements',
    'Banking compliance packs (as required by lenders)',
  ],
  certification: [
    'Certificates under Income-tax/GST and other statutes (where permitted)',
    'Turnover/net worth/working capital certificates (as applicable)',
    'Utilisation certificates and factual reporting assignments permitted to CAs',
    'Attestation assignments as per ICAI guidance and statute',
  ],
  complianceMgmt: [
    'Entity-wise compliance calendar and due-date tracker',
    'Preparation/maintenance of statutory registers (as applicable)',
    'Reconciliation of returns with books (GST/TDS/other)',
    'Periodic compliance status reports to management',
  ],
  secretarial: [
    'ROC forms (AOC-4, MGT-7 and others as applicable)',
    'DIR/KMP related filings and records',
    'Minutes, notices and statutory registers (as applicable)',
    'LLP annual and event-based filings',
  ],
  misControls: [
    'Design of MIS packs (sales, margins, receivables, payables, inventory)',
    'Policy documentation and delegation matrices',
    'Process risk identification and control activities',
    'SOP drafting and rollout with training sessions',
  ],
  registrations: [
    'GST registration/amendment',
    'PAN/TAN application and changes',
    'Professional Tax/Shop & Establishment (as applicable)',
    'Import-Export Code and other statutory registrations (as applicable)',
  ],
};
