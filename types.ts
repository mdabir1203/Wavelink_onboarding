
export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  nidNumber: string;
  onboardingStatus: 'Pending' | 'In Review' | 'Signed' | 'Completed';
  nidStatus: 'NOT_STARTED' | 'SCANNING' | 'VERIFIED' | 'REJECTED';
  nidData?: {
    extractedName: string;
    extractedId: string;
    extractedAddress: string;
    matchConfidence: number;
  };
  trackingId?: string;
  signedAt?: string;
  signatureFingerprint?: string;
}

export interface ContractDetails {
  title: string;
  salaryStructure: string;
  commissionNfcCards: string;
  commissionNfcStands: string;
  kycRequirements: string;
  paymentTerms: string;
  legalClauses: string[];
}

export enum AppState {
  DASHBOARD = 'DASHBOARD',
  EDITOR = 'EDITOR',
  SIGN_VIEW = 'SIGN_VIEW',
  AUDIT_LOG = 'AUDIT_LOG'
}
