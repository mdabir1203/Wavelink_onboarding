import React, { useState } from 'react';
import { Employee, ContractDetails } from '../types';
import Logo from './Logo';

interface ContractEditorProps {
  employee: Employee;
  contract: ContractDetails;
  onProceed: () => void;
  onBack: () => void;
  hideBack?: boolean;
}

const ContractEditor: React.FC<ContractEditorProps> = ({ employee, contract, onProceed, onBack, hideBack = false }) => {
  const [showShareToast, setShowShareToast] = useState(false);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const jsonString = JSON.stringify(employee);
    const bytes = new TextEncoder().encode(jsonString);
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    const encoded = btoa(binaryString);
    
    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?data=${encodeURIComponent(encoded)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wavelink Contract',
          text: `Hi ${employee.fullName}, please sign your Wavelink contract here:`,
          url: shareUrl,
        });
      } catch (err) { console.log(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  const largeOfficeExamples = [
    "Gyms & Fitness Centers",
    "Boutique Shops",
    "Sports Zones",
    "Theme Parks",
    "Educational Institutions (Schools/Colleges)",
    "SME Enterprises (Small/Medium Businesses)",
    "Online Digital Marketplaces (can use loyalty cards)",
    "Consultancy Houses",
    "Coaching Centres",
    "Wellness Centres",
    "High-quality Hair Salons"
  ];

  return (
    <div className="animate-fadeIn space-y-6 relative pb-24">
      {showShareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#0f2d4d] text-white px-6 py-4 rounded-full shadow-2xl z-[100] flex items-center gap-3">
          <span className="font-black text-xs uppercase tracking-widest">Link Copied! Send via WhatsApp.</span>
        </div>
      )}

      <div className="no-print flex items-center justify-between gap-2 px-2">
        {!hideBack ? (
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl text-[#0f2d4d] hover:bg-slate-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        ) : <div />}
        <div className="flex gap-2">
          {!hideBack && (
            <button onClick={handleShare} className="wavelink-gradient text-white font-bold px-6 py-3 rounded-2xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Send Link
            </button>
          )}
          <button onClick={handlePrint} className="hidden sm:flex bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl text-sm items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      <div className="contract-container bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none">
        <div className="wavelink-gradient p-10 md:p-14 text-white text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter uppercase">Ambassador Agreement</h2>
          <p className="text-blue-100 font-bold text-sm tracking-widest uppercase opacity-80">Wavelink Digital BD</p>
        </div>

        <div className="p-8 md:p-16 space-y-12">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Your Role</p>
                  <p className="text-xl font-black text-[#0f2d4d]">{contract.title}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-xl font-black text-[#0f2d4d]">{employee.fullName}</p>
              </div>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-none w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">01</div>
               <div className="space-y-6 flex-grow">
                  <div>
                    <h4 className="text-2xl font-black text-[#0f2d4d] mb-2">How You Earn Money</h4>
                    <p className="text-slate-600 font-medium text-lg">{contract.salaryStructure}</p>
                  </div>

                  <div className="bg-blue-50/50 rounded-[2rem] p-8 border border-blue-100 space-y-8">
                    <div>
                      <h5 className="text-blue-900 font-black text-sm uppercase tracking-widest mb-4">Commission Rates for Cards:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm text-center">
                          <p className="text-xs font-bold text-slate-400 mb-1">Sell 10 Cards</p>
                          <p className="text-2xl font-black text-blue-600">7%</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm text-center">
                          <p className="text-xs font-bold text-slate-400 mb-1">Sell 20 Cards</p>
                          <p className="text-2xl font-black text-blue-600">14%</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm text-center">
                          <p className="text-xs font-bold text-slate-400 mb-1">Sell 30 Cards</p>
                          <p className="text-2xl font-black text-blue-600">20%</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-blue-200/50">
                      <h5 className="text-blue-900 font-black text-sm uppercase tracking-widest mb-4">Review Stands & Partnerships:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-blue-100 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#0f2d4d]">Large Organizations</span>
                            <span className="text-2xl font-black text-blue-600">20%</span>
                          </div>
                          <div className="bg-blue-50/30 p-4 rounded-2xl">
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Qualifying Examples:</p>
                             <ul className="grid grid-cols-1 gap-1">
                               {largeOfficeExamples.map((ex, i) => (
                                 <li key={i} className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                                   <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                   {ex}
                                 </li>
                               ))}
                             </ul>
                          </div>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-blue-100 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-[#0f2d4d]">Single Unit Sales</span>
                            <span className="text-2xl font-black text-blue-600">5%</span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4">
                            Direct sales of individual units to small business owners or individuals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-none w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">02</div>
               <div className="space-y-4">
                  <h4 className="text-2xl font-black text-[#0f2d4d]">Customer Verification & Reviews</h4>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed">{contract.kycRequirements}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Payment is only sent after verification and receipt of funds.
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
               <div className="flex-none w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-sm">03</div>
               <div className="space-y-6">
                  <h4 className="text-2xl font-black text-[#0f2d4d]">Compliance Rules</h4>
                  <div className="grid grid-cols-1 gap-4">
                     {contract.legalClauses.map((clause, idx) => (
                       <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-none mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-slate-600 font-semibold leading-relaxed">{clause}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 flex justify-between items-center opacity-40">
             <Logo className="h-5" />
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Wavelink Digital Secure Protocol
             </div>
          </div>
        </div>
      </div>

      <div className="no-print fixed bottom-6 left-6 right-6 md:relative md:bottom-0 md:left-0 md:right-0">
        <button 
          onClick={onProceed}
          className="w-full wavelink-gradient text-white font-black py-5 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-3 text-xl hover:scale-[1.01] transition-transform active:scale-95"
        >
          Understand & Sign
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ContractEditor;