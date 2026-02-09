
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
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

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
            fullName: result.extractedName !== "UNABLE TO DETECT NAME" ? result.extractedName : prev.fullName,
            nidNumber: result.extractedId !== "NOT FOUND" ? result.extractedId : prev.nidNumber,
          }));
          
          if (Notification.permission === "granted") {
            new Notification("Wavelink AI: NID Scanned", {
              body: `Identity verification for ${result.extractedName} is complete.`,
              icon: "/favicon.ico"
            });
          }
        }
      } catch (err) {
        setNidStatus('REJECTED');
      }
    };
    reader.readAsDataURL(file);
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

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') {
      new Notification("Notifications Enabled", {
        body: "You will now receive real-time alerts from Wavelink HQ.",
        icon: "/favicon.ico"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Brand Intro Card */}
      <div className="wavelink-gradient rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Expand the Wave.</h2>
          <p className="text-blue-100 text-lg leading-relaxed opacity-90">
            Local NID OCR is now active. Verify identities securely on-device, compliant with Bangladesh statutory requirements.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button onClick={onGoToAudit} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Admin Tracker
            </button>
            
            <div className="flex items-center gap-3 bg-black/10 px-4 py-2.5 rounded-xl border border-white/10">
              <div className={`w-2.5 h-2.5 rounded-full ${notifPermission === 'granted' ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">
                Push Alerts: {notifPermission.toUpperCase()}
              </span>
              {notifPermission !== 'granted' && (
                <button onClick={requestNotificationPermission} className="text-[10px] font-black underline hover:text-white transition-colors">
                  ENABLE
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full rotate-45">
            <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#0f2d4d] flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              Onboarding Form
            </h3>
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
              nidStatus === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-100' : 
              nidStatus === 'SCANNING' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' :
              nidStatus === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              OCR Status: {nidStatus.replace('_', ' ')}
            </div>
          </div>

          <div className="mb-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleNIDUpload}
            />
            {nidStatus === 'NOT_STARTED' && (
              <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-[#0f2d4d] font-bold">Upload NID (Local OCR Scan)</p>
                <p className="text-slate-400 text-xs">Processing based on Bangladesh NID System logic</p>
              </div>
            )}
            {nidStatus === 'SCANNING' && (
              <div className="py-4">
                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">Local Worker Busy...</p>
              </div>
            )}
            {nidStatus === 'VERIFIED' && (
              <div className="flex flex-col items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <p className="text-green-600 font-black text-sm uppercase">NID Scanned: {nidData?.extractedId}</p>
                 <button onClick={() => fileInputRef.current?.click()} className="text-xs text-slate-400 underline">Rescan Document</button>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Full Legal Name</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="As per NID card"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Contact Email</label>
              <input 
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="ambassador@wavelink.bd"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone Number</label>
              <input 
                required
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="+880 1XXX-XXXXXX"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">NID / Passport Number</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="ID verification required"
                value={formData.nidNumber}
                onChange={e => setFormData({ ...formData, nidNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Present Address</label>
              <textarea 
                required
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Residential details"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button 
                type="submit"
                disabled={nidStatus === 'SCANNING'}
                className="w-full bg-[#0f2d4d] hover:bg-[#1e4b7a] disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
              >
                Create Digital Contract
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h4 className="font-black text-[#0f2d4d] flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            System Health
          </h4>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Alert Endpoint</div>
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f2d4d]">waavelink@gmail.com</span>
                  <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">READY</span>
               </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Notification Protocol</div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">Admin is notified via automated email upon successful contract signature and encryption.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
