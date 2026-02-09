import React, { useState, useEffect } from 'react';
import { AppState, Employee, ContractDetails } from './types';
import Dashboard from './components/Dashboard';
import ContractEditor from './components/ContractEditor';
import SignView from './components/SignView';
import AuditLog from './components/AuditLog';
import Logo from './components/Logo';
import { getLegalClauses } from './services/verificationService';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.DASHBOARD);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEmployeeView, setIsEmployeeView] = useState(false);
  const [auditHistory, setAuditHistory] = useState<Employee[]>([]);
  const [contractData, setContractData] = useState<ContractDetails>({
    title: "Sustainability Ambassador",
    salaryStructure: "You get paid for every sale you finish. No fixed hours—work when you want!",
    commissionNfcCards: "Earn more as you sell: 10 cards = 7%, 20 cards = 14%, 30 cards = 20%.",
    commissionNfcStands: "Large Organizations (20%): Includes Gyms, Shops, Schools, SME Enterprises, and Online Marketplaces (where they can give loyalty cards to their customers).",
    kycRequirements: "Help customers verify their ID and ask them to post a quick review video on YouTube, TikTok, or FB.",
    paymentTerms: "Pay is released once the customer is verified, the product is delivered, and the money reaches Wavelink.",
    legalClauses: []
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');
    if (encodedData) {
      try {
        // Robust decoding for URL-safe base64 and Unicode
        const decodedParam = decodeURIComponent(encodedData).trim();
        const binaryString = atob(decodedParam.replace(/ /g, '+'));
        const bytes = Uint8Array.from(binaryString, (m) => m.codePointAt(0)!);
        const decodedString = new TextDecoder().decode(bytes);
        const decoded = JSON.parse(decodedString);
        
        setEmployee(decoded);
        setIsEmployeeView(true);
        setView(AppState.EDITOR);
        // Clear URL params but keep the state
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) { 
        console.error("Critical: Invite Link Data is Corrupted", e); 
      }
    }
    const stored = localStorage.getItem('wavelink_onboarding_audit');
    if (stored) setAuditHistory(JSON.parse(stored));
    setContractData(prev => ({ ...prev, legalClauses: getLegalClauses() }));
  }, []);

  const handleStartOnboarding = (newEmployee: Employee) => {
    setEmployee(newEmployee);
    setIsEmployeeView(false); // Admin started this view
    setView(AppState.EDITOR);
  };

  const handleOnboardingComplete = (finalEmployee: Employee) => {
    const updatedHistory = [finalEmployee, ...auditHistory];
    setAuditHistory(updatedHistory);
    localStorage.setItem('wavelink_onboarding_audit', JSON.stringify(updatedHistory));
    setEmployee(null);
    setIsEmployeeView(false);
    setView(AppState.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="no-print bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => !isEmployeeView && setView(AppState.DASHBOARD)} 
            className={`${isEmployeeView ? 'cursor-default' : 'hover:opacity-80'} transition-opacity`}
          >
            <Logo />
          </button>
          <div className="flex gap-2">
            {!isEmployeeView && (
              <button 
                onClick={() => setView(AppState.AUDIT_LOG)}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Records</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto p-4 md:p-8">
        {view === AppState.DASHBOARD && (
          <Dashboard onStart={handleStartOnboarding} onGoToAudit={() => setView(AppState.AUDIT_LOG)} />
        )}
        {view === AppState.EDITOR && employee && (
          <ContractEditor 
            employee={employee} 
            contract={contractData} 
            onProceed={() => setView(AppState.SIGN_VIEW)} 
            onBack={() => !isEmployeeView ? setView(AppState.DASHBOARD) : null}
            hideBack={isEmployeeView}
          />
        )}
        {view === AppState.SIGN_VIEW && employee && (
          <SignView 
            employee={employee} 
            contract={contractData} 
            onFinish={handleOnboardingComplete} 
            onBack={() => setView(AppState.EDITOR)}
          />
        )}
        {view === AppState.AUDIT_LOG && (
          <AuditLog history={auditHistory} onBack={() => setView(AppState.DASHBOARD)} />
        )}
      </main>
    </div>
  );
};

export default App;