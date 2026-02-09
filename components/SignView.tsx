
import React, { useState, useRef, useEffect } from 'react';
import { Employee, ContractDetails } from '../types';
import { notifyAdminByEmail } from '../services/verificationService';

interface SignViewProps {
  employee: Employee;
  contract: ContractDetails;
  onFinish: (employee: Employee) => void;
  onBack: () => void;
}

const SignView: React.FC<SignViewProps> = ({ employee, contract, onFinish, onBack }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [securedHash, setSecuredHash] = useState('');

  useEffect(() => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const fingerprint = `WAVE-BD-${timestamp}-${random}`.toUpperCase();
    setSecuredHash(fingerprint);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.type.includes('touch') ? (e as any).touches[0].clientX : (e as any).clientX) - rect.left;
    const y = (e.type.includes('touch') ? (e as any).touches[0].clientY : (e as any).clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const endDrawing = () => {
    setDrawing(false);
    setIsSigned(true);
  };

  const draw = (e: any) => {
    if (!drawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f2d4d';

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsSigned(false);
      }
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    
    const finalizedEmployee: Employee = {
      ...employee,
      onboardingStatus: 'Completed',
      signedAt: new Date().toISOString(),
      trackingId: securedHash,
      signatureFingerprint: securedHash
    };

    // Trigger Admin Notification
    try {
      await notifyAdminByEmail(finalizedEmployee);
      
      if (Notification.permission === 'granted') {
        new Notification("HQ Notified", {
          body: "Success! Notification sent to waavelink@gmail.com",
          icon: "/favicon.ico"
        });
      }
    } catch (e) {
      console.error("Failed to notify admin", e);
    }

    onFinish(finalizedEmployee);
  };

  return (
    <div className="animate-slideUp space-y-6 max-w-xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-black text-[#0f2d4d]">Identity Confirmation</h2>
        <p className="text-slate-500 font-medium">Provide your secure digital signature to authenticate this document.</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-xs font-black text-[#0f2d4d] uppercase tracking-widest">Digital Pad Ready</span>
          </div>
          <button 
            disabled={isFinalizing}
            onClick={clearCanvas}
            className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            Reset Pad
          </button>
        </div>

        <div className="border-4 border-slate-100 rounded-3xl bg-slate-50 overflow-hidden touch-none relative shadow-inner">
          <canvas 
            ref={canvasRef}
            width={500}
            height={250}
            className="w-full h-[250px] cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
          {!isSigned && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 font-bold uppercase tracking-widest opacity-50">
              Sign inside this area
            </div>
          )}
        </div>

        <div className="mt-8 space-y-6">
          <div className="p-5 bg-[#0f2d4d] rounded-2xl text-white flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Secured Tracking Algo</p>
              <code className="text-sm font-mono tracking-tighter">{securedHash}</code>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Email Alert Target</p>
              <p className="text-[10px] font-mono text-blue-300">waavelink@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
            <input 
              type="checkbox" 
              id="confirm" 
              className="mt-1 w-6 h-6 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={isSigned}
              onChange={() => setIsSigned(!isSigned)}
              disabled={isFinalizing}
            />
            <label htmlFor="confirm" className="text-xs text-[#0f2d4d] font-bold leading-relaxed cursor-pointer select-none">
              I certify that this digital signature belongs to me, <strong>{employee.fullName}</strong>, and I accept accountability. HQ will be alerted at waavelink@gmail.com.
            </label>
          </div>

          <button 
            disabled={!isSigned || isFinalizing}
            onClick={handleFinalize}
            className={`w-full py-5 rounded-[1.5rem] font-black transition-all shadow-2xl flex items-center justify-center gap-3 ${
              isSigned 
              ? 'wavelink-gradient text-white hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            } ${isFinalizing ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isFinalizing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Notifying HQ...
              </>
            ) : (
              isSigned ? 'Finalize & Alert HQ' : 'Please Sign Above'
            )}
          </button>
          
          {!isFinalizing && (
            <button 
              onClick={onBack}
              className="w-full py-3 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Review Document Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignView;
