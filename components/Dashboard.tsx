import React, { useState, useRef, useEffect } from 'react';
import { Employee } from '../types';
import { verifyNIDLocally } from '../services/verificationService';

interface DashboardProps {
  onStart: (employee: Employee) => void;
  onGoToAudit: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStart, onGoToAudit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    nidNumber: ''
  });

  const [nidStatus, setNidStatus] = useState<'NOT_STARTED' | 'SCANNING' | 'VERIFIED' | 'REJECTED'>('NOT_STARTED');
  const [nidData, setNidData] = useState<any>(null);
  const [inviteName, setInviteName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNIDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNidStatus('SCANNING');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await verifyNIDLocally(base64);
        setNidData(result);
        setNidStatus(result.matchConfidence > 0.6 ? 'VERIFIED' : 'REJECTED');
        if (result.matchConfidence > 0.6) {
          setFormData(prev => ({
            ...prev,
            fullName: result.extractedName !== "NAME NOT FOUND" ? result.extractedName : prev.fullName,
            nidNumber: result.extractedId !== "ID NOT FOUND" ? result.extractedId : prev.nidNumber,
          }));
        }
      } catch (err) { setNidStatus('REJECTED'); }
    };
    reader.readAsDataURL(file);
  };

  const generateInvite = () => {
    const mockEmployee: Partial<Employee> = {
      id: crypto.randomUUID(),
      fullName: inviteName || "Ambassador",
      email: "",
      phone: "",
      address: "Direct Link Invite",
      nidNumber: "PENDING_INPUT",
      onboardingStatus: 'Pending',
      nidStatus: 'NOT_STARTED'
    };
    
    // Robust encoding for Unicode characters
    const jsonString = JSON.stringify(mockEmployee);
    const bytes = new TextEncoder().encode(jsonString);
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    const encoded = btoa(binaryString);
    
    // Use robust base URL to avoid "googhttps" concatenation issues
    const baseUrl = window.location.href.split('?')[0];
    const url = `${baseUrl}?data=${encodeURIComponent(encoded)}`;
    
    setGeneratedLink(url);
    navigator.clipboard.writeText(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      ...formData,
      id: crypto.randomUUID(),
      onboardingStatus: 'Pending',
      nidStatus: nidStatus,
      nidData: nidData
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="wavelink-gradient rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Expand the Wave.</h2>
          <p className="text-blue-100 text-lg leading-relaxed opacity-90">
            Local NID OCR is active. Generate secure direct links to onboard your team instantly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button onClick={onGoToAudit} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Admin Tracker
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-[#0f2d4d] mb-8 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            Manual Onboarding
          </h3>
          <div className="mb-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleNIDUpload} />
            {nidStatus === 'NOT_STARTED' && (
              <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                </div>
                <p className="text-[#0f2d4d] font-bold">Quick Scan NID</p>
              </div>
            )}
            {nidStatus === 'SCANNING' && <div className="py-4 animate-pulse text-blue-600 font-black">SCANNING...</div>}
            {nidStatus === 'VERIFIED' && <div className="text-green-600 font-black">NID DETECTED: {nidData?.extractedId}</div>}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none" placeholder="Legal Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone</label>
              <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none" placeholder="+880" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <button type="submit" className="md:col-span-2 bg-[#0f2d4d] text-white font-black py-4 rounded-xl shadow-xl">Start Onboarding Process</button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
            <h4 className="font-black text-[#0f2d4d] flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              System Health
            </h4>
            <div className="space-y-4">
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Alert Endpoint</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0f2d4d] tracking-tight">waavelink@gmail.com</span>
                  <span className="text-[10px] bg-[#22c55e] text-white px-2.5 py-1 rounded-full font-black">READY</span>
                </div>
              </div>
              <div className="p-5 bg-[#f8fafc] rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notification Protocol</div>
                <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                  Admin is notified via automated email upon successful contract signature and encryption.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0f2d4d] rounded-3xl p-8 text-white space-y-4 shadow-xl">
             <h4 className="font-black text-blue-300 text-sm uppercase tracking-widest">Direct Link Tool</h4>
             <p className="text-xs text-blue-100/70 font-medium">Bypass NID scan. Employee sees signature pad immediately.</p>
             <input 
               className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-blue-200/40"
               placeholder="Employee Name"
               value={inviteName}
               onChange={(e) => setInviteName(e.target.value)}
             />
             <button 
               onClick={generateInvite}
               className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-3 rounded-xl text-xs transition-colors"
             >
               {generatedLink ? 'Link Copied!' : 'Generate Invite Link'}
             </button>
             {generatedLink && <p className="text-[9px] text-blue-300 font-mono break-all opacity-50">Link is on your clipboard.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;