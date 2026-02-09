import React, { useState } from 'react';
import { Employee } from '../types';

interface AuditLogProps {
  history: Employee[];
  onBack: () => void;
}

const AuditLog: React.FC<AuditLogProps> = ({ history, onBack }) => {
  const [copyId, setCopyId] = useState<string | null>(null);

  const copyInviteLink = (item: Employee) => {
    // Robust encoding for Unicode characters
    const jsonString = JSON.stringify(item);
    const bytes = new TextEncoder().encode(jsonString);
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    const encoded = btoa(binaryString);
    
    // Robust base URL logic
    const baseUrl = window.location.href.split('?')[0];
    const url = `${baseUrl}?data=${encodeURIComponent(encoded)}`;
    
    navigator.clipboard.writeText(url);
    setCopyId(item.id);
    setTimeout(() => setCopyId(null), 2000);
  };

  const downloadCSV = () => {
    if (history.length === 0) return;
    const headers = ["ID", "Full Name", "Email", "Phone", "NID", "NID Status", "Status", "Signed At", "Fingerprint"];
    const rows = history.map(item => [
      item.id, item.fullName, item.email, item.phone, item.nidNumber, item.nidStatus, item.onboardingStatus, item.signedAt || "N/A", item.signatureFingerprint || "N/A"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wavelink_audit_${new Date().toISOString().split('T')[0]}.csv`);
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
          <button onClick={downloadCSV} className="flex-1 md:flex-none bg-white border border-slate-200 text-[#0f2d4d] px-6 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2">
            Export Records
          </button>
          <button onClick={onBack} className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm">
            Back to Home
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
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium italic">Database empty.</td></tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0f2d4d]">{item.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.phone || 'NO PHONE'}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                         item.nidStatus === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                       }`}>
                         {item.nidStatus}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black text-slate-400">{( (item.nidData?.matchConfidence || 0) * 100 ).toFixed(0)}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {item.onboardingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => copyInviteLink(item)}
                         className={`text-[10px] font-black px-4 py-2 rounded-xl border transition-all ${
                           copyId === item.id ? 'bg-green-500 text-white border-green-500' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'
                         }`}
                       >
                         {copyId === item.id ? 'COPIED' : 'COPY INVITE LINK'}
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f2d4d] rounded-3xl p-8 text-white shadow-lg">
          <div className="text-xs font-black text-blue-300 uppercase tracking-widest mb-2">Authenticated Entries</div>
          <div className="text-4xl font-black">{history.filter(h => h.nidStatus === 'VERIFIED').length}</div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pending signatures</div>
          <div className="text-4xl font-black text-[#0f2d4d]">
             {history.filter(h => h.onboardingStatus !== 'Completed').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;