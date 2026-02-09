
import React from 'react';
import { Employee } from '../types';

interface AuditLogProps {
  history: Employee[];
  onBack: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({ history, onBack }) => {
  const downloadCSV = () => {
    if (history.length === 0) return;

    const headers = ["ID", "Full Name", "Email", "Phone", "NID", "NID Status", "Status", "Signed At", "Fingerprint"];
    const rows = history.map(item => [
      item.id,
      item.fullName,
      item.email,
      item.phone,
      item.nidNumber,
      item.nidStatus,
      item.onboardingStatus,
      item.signedAt || "N/A",
      item.signatureFingerprint || "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wavelink_onboarding_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#0f2d4d]">Compliance Dashboard</h2>
            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-slate-500 text-sm">NID Verification Tracker & Global Audit Metrics</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadCSV}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-[#0f2d4d] px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Sheets
          </button>
          <button 
            onClick={onBack}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
          >
            New Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Ambassador</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">NID Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">KPI Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Fingerprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-slate-400 font-medium italic">Database empty. Records will appear after onboarding completion.</p>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0f2d4d] group-hover:text-blue-600 transition-colors">{item.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono uppercase">{item.email}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                         item.nidStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-100' :
                         item.nidStatus === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                         'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>
                         {item.nidStatus.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${item.nidStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-rose-500'}`} style={{ width: `${(item.nidData?.matchConfidence || 0) * 100}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{( (item.nidData?.matchConfidence || 0) * 100 ).toFixed(0)}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {item.onboardingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <code className="text-[10px] text-blue-500 font-mono bg-blue-50/50 border border-blue-100 px-2 py-1 rounded-lg">
                          {item.signatureFingerprint || 'PENDING'}
                        </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f2d4d] rounded-3xl p-8 text-white shadow-lg shadow-blue-900/10">
          <div className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2">Authenticated Entries</div>
          <div className="text-4xl font-black">{history.filter(h => h.nidStatus === 'VERIFIED').length}</div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Rejection Rate</div>
          <div className="text-4xl font-black text-rose-600">
             {history.length > 0 ? ((history.filter(h => h.nidStatus === 'REJECTED').length / history.length) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
