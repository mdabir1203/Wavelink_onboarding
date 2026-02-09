
import { createWorker } from 'tesseract.js';

// --- INITIAL STATE ---
const state = {
    view: 'DASHBOARD',
    employee: null,
    isEmployeeView: false,
    auditHistory: JSON.parse(localStorage.getItem('wavelink_onboarding_audit') || '[]'),
    nidStatus: 'NOT_STARTED',
    nidData: null,
    nidImage: null, // Stores base64 of the NID card
    formData: { fullName: '', phone: '', address: '', nidNumber: '' },
    inviteName: '',
    generatedLink: '',
    canvas: { drawing: false, isSigned: false, securedHash: '' }
};

// --- CONSTANTS ---
const CONTRACT_DATA = {
    title: "Sustainability Ambassador",
    salaryStructure: "You get paid for every sale you finish. No fixed hours—work when you want!",
    commissionNfcCards: "Earn more as you sell: 10 cards = 7%, 20 cards = 14%, 30 cards = 20%.",
    commissionNfcStands: "Large Organizations (20%): Includes Gyms, Shops, Schools, SME Enterprises, etc.",
    kycRequirements: "Verify customer ID and collect video reviews for YouTube/TikTok.",
    paymentTerms: "Payment released upon verification and funds receipt.",
    legalClauses: [
        "Follow the Bangladesh Cyber Security Act. Protect customer privacy.",
        "Ensure all KYC documents are authentic. No fake entries allowed.",
        "Payment is strictly milestone-based. No fixed monthly salary.",
        "After-sales support is mandatory for every successful sale.",
        "Travel support provided for distances exceeding 25km (receipts required)."
    ]
};

// --- UTILS ---
const saveAudit = (item) => {
    state.auditHistory = [item, ...state.auditHistory];
    localStorage.setItem('wavelink_onboarding_audit', JSON.stringify(state.auditHistory));
};

const encodeData = (obj) => {
    const jsonString = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(jsonString);
    const binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return encodeURIComponent(btoa(binaryString));
};

const decodeData = (encoded) => {
    const binaryString = atob(decodeURIComponent(encoded).replace(/ /g, '+'));
    const bytes = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
};

// --- OCR SERVICE ---
const verifyNIDLocally = async (imageBase64) => {
    state.nidStatus = 'SCANNING';
    state.nidImage = imageBase64;
    render();
    const worker = await createWorker('eng+ben');
    try {
        const { data: { text } } = await worker.recognize(`data:image/jpeg;base64,${imageBase64}`);
        const nameMatch = text.match(/(?:Name|নাম)\s*[:]?\s*([A-Z\s]+)/i);
        const nidMatch = text.match(/\d{10,17}/);
        await worker.terminate();
        return {
            extractedName: nameMatch ? nameMatch[1].trim() : "NAME NOT FOUND",
            extractedId: nidMatch ? nidMatch[0] : "",
            matchConfidence: nidMatch ? 0.85 : 0.4
        };
    } catch (e) {
        await worker.terminate();
        throw e;
    }
};

// --- RENDER ENGINE ---
const render = () => {
    const root = document.getElementById('root');
    let html = `
        <header class="no-print bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
            <div class="max-w-5xl mx-auto flex justify-between items-center">
                <div id="btn-logo" class="flex items-center gap-2 ${state.isEmployeeView ? '' : 'cursor-pointer hover:opacity-80'}">
                    <div class="w-8 h-8 wavelink-gradient rounded-lg flex items-center justify-center text-white text-[10px] font-black italic">W</div>
                    <span class="text-xl font-black tracking-tighter text-[#0f2d4d]">wavelink</span>
                </div>
                ${!state.isEmployeeView ? `
                    <button id="btn-records" class="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Records
                    </button>
                ` : ''}
            </div>
        </header>
        <main class="max-w-5xl w-full mx-auto p-4 md:p-8">
    `;

    if (state.view === 'DASHBOARD') html += renderDashboard();
    else if (state.view === 'EDITOR') html += renderEditor();
    else if (state.view === 'SIGN') html += renderSignView();
    else if (state.view === 'AUDIT') html += renderAudit();

    html += `</main>`;
    root.innerHTML = html;
    attachListeners();
};

const renderDashboard = () => `
    <div class="space-y-8 animate-fadeIn">
        <div class="wavelink-gradient rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <h2 class="text-3xl md:text-5xl font-black mb-4 tracking-tight">Expand the Wave.</h2>
            <p class="text-blue-100 text-lg opacity-90">Generate secure direct links or scan NID to onboard ambassadors.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                <h3 class="text-xl font-bold text-[#0f2d4d] mb-8 flex items-center gap-2">Ambassador Registration</h3>
                
                <div id="nid-zone" class="mb-8 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center cursor-pointer relative group overflow-hidden">
                    ${state.nidStatus === 'NOT_STARTED' ? `
                        <div class="flex flex-col items-center gap-3">
                            <div class="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">📷</div>
                            <p class="text-[#0f2d4d] font-bold">Scan NID for Auto-Fill</p>
                            <p class="text-xs text-slate-400">Click to upload or take a photo</p>
                        </div>
                    ` : state.nidStatus === 'SCANNING' ? `
                        <div class="py-6 flex flex-col items-center gap-4">
                            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <div class="text-blue-600 font-black uppercase tracking-widest text-xs">Processing Document...</div>
                        </div>
                    ` : `
                        <div class="flex flex-col items-center gap-3">
                            <img src="data:image/jpeg;base64,${state.nidImage}" class="w-32 h-20 object-cover rounded-lg shadow-md mb-2" />
                            <div class="text-green-600 font-black text-xs uppercase">Document Captured</div>
                            <button class="text-[10px] font-black text-blue-500 uppercase">Change Photo</button>
                        </div>
                    `}
                    <input type="file" id="nid-file" class="hidden" accept="image/*" />
                </div>

                <form id="onboard-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                            <input required class="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" value="${state.formData.fullName}" id="in-name" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                            <input required class="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:border-blue-500 transition-colors" placeholder="+880..." value="${state.formData.phone}" id="in-phone" />
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent Address</label>
                        <textarea required class="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:border-blue-500 transition-colors h-24 resize-none" placeholder="Enter full address" id="in-address">${state.formData.address}</textarea>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">NID Number</label>
                        <input required class="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:border-blue-500 transition-colors" placeholder="Ex: 1990123456789" value="${state.formData.nidNumber}" id="in-nid-number" />
                        ${state.nidStatus === 'VERIFIED' ? '<p class="text-[10px] text-green-500 font-bold">Auto-extracted from document</p>' : '<p class="text-[10px] text-slate-400">Enter manually if scan was not performed</p>'}
                    </div>

                    <button type="submit" class="w-full bg-[#0f2d4d] text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]">Proceed to Contract</button>
                </form>
            </div>

            <div class="space-y-6">
                <div class="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
                    <h4 class="font-black text-[#0f2d4d] mb-4">System Health</h4>
                    <div class="p-4 bg-blue-50/50 rounded-2xl border mb-4">
                        <div class="text-[10px] font-black text-blue-400 uppercase mb-2">Alert Endpoint</div>
                        <div class="flex justify-between items-center"><span class="text-sm font-bold">waavelink@gmail.com</span> <span class="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full">READY</span></div>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-2xl text-[11px] font-semibold text-slate-500 leading-relaxed">Notifications active for successful signatures and legal verification.</div>
                </div>

                <div class="bg-[#0f2d4d] rounded-3xl p-8 text-white space-y-4 shadow-xl">
                    <h4 class="font-black text-blue-300 text-sm uppercase tracking-widest">Direct Link Tool</h4>
                    <p class="text-[11px] text-blue-100 opacity-60">Instantly generate a personalized signing URL for remote ambassadors.</p>
                    <input id="in-invite-name" class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none" placeholder="Ambassador Name" value="${state.inviteName}" />
                    <button id="btn-gen-link" class="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-xl text-xs transition-colors">
                        ${state.generatedLink ? 'Link Copied!' : 'Generate Invite Link'}
                    </button>
                    ${state.generatedLink ? `<p class="text-[9px] font-mono text-blue-300 opacity-50 break-all leading-tight">Link is on your clipboard.</p>` : ''}
                </div>
            </div>
        </div>
    </div>
`;

const renderEditor = () => `
    <div class="animate-fadeIn space-y-6 relative pb-24">
        <div class="contract-container bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
            <div class="wavelink-gradient p-10 text-white text-center">
                <h2 class="text-3xl md:text-5xl font-black uppercase tracking-tighter">Ambassador Agreement</h2>
                <p class="text-blue-100 font-bold text-sm tracking-widest uppercase opacity-80">Wavelink Digital BD</p>
            </div>
            <div class="p-8 md:p-16 space-y-12">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="p-6 bg-slate-50 rounded-[2rem]"><p class="text-[10px] font-black text-blue-500 uppercase">Role</p><p class="text-xl font-black text-[#0f2d4d]">${CONTRACT_DATA.title}</p></div>
                    <div class="p-6 bg-slate-50 rounded-[2rem]"><p class="text-[10px] font-black text-blue-500 uppercase">Ambassador</p><p class="text-xl font-black text-[#0f2d4d]">${state.employee.fullName}</p></div>
                </div>
                <div class="space-y-6">
                    <h4 class="text-2xl font-black text-[#0f2d4d]">Compensation & Milestones</h4>
                    <p class="text-slate-600 font-medium">${CONTRACT_DATA.salaryStructure}</p>
                    <div class="grid grid-cols-3 gap-4">
                        <div class="p-4 bg-blue-50 border rounded-2xl text-center shadow-sm"><p class="text-[10px] font-bold text-slate-400">10 Cards</p><p class="text-2xl font-black text-blue-600">7%</p></div>
                        <div class="p-4 bg-blue-50 border rounded-2xl text-center shadow-sm"><p class="text-[10px] font-bold text-slate-400">20 Cards</p><p class="text-2xl font-black text-blue-600">14%</p></div>
                        <div class="p-4 bg-blue-50 border rounded-2xl text-center shadow-sm"><p class="text-[10px] font-bold text-slate-400">30 Cards</p><p class="text-2xl font-black text-blue-600">20%</p></div>
                    </div>
                </div>
                <div class="space-y-4">
                    <h4 class="text-2xl font-black text-[#0f2d4d]">Bangladesh Legal Compliance</h4>
                    ${CONTRACT_DATA.legalClauses.map((c, i) => `<div class="p-5 bg-slate-50 rounded-2xl border-l-4 border-blue-500 text-sm font-semibold text-slate-700 leading-relaxed shadow-sm">${c}</div>`).join('')}
                </div>
            </div>
        </div>
        <div class="no-print fixed bottom-6 left-6 right-6 md:relative">
            <button id="btn-proceed-sign" class="w-full wavelink-gradient text-white font-black py-5 rounded-[2.5rem] shadow-2xl text-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Sign Securely</button>
        </div>
    </div>
`;

const renderSignView = () => `
    <div class="animate-fadeIn space-y-6 max-w-xl mx-auto">
        <div class="text-center mb-8"><h2 class="text-3xl font-black text-[#0f2d4d]">Identity Confirmation</h2><p class="text-slate-500">Provide digital signature to finalize legally.</p></div>
        <div class="bg-white rounded-[2rem] p-8 shadow-2xl border">
            <div class="flex justify-between mb-4"><span class="text-xs font-black uppercase tracking-widest text-slate-400">Digital Pad</span> <button id="btn-clear-canvas" class="text-xs text-rose-500 font-bold uppercase tracking-widest">Clear</button></div>
            <div class="border-4 border-slate-100 rounded-3xl bg-slate-50 overflow-hidden relative">
                <canvas id="sign-canvas" width="500" height="300" class="w-full h-[300px] cursor-crosshair"></canvas>
            </div>
            <div class="mt-8 space-y-4">
                <div class="p-4 bg-[#0f2d4d] rounded-2xl text-white text-[10px] font-mono flex justify-between"><span>SECURE HASH:</span> <span class="text-blue-400">${state.canvas.securedHash}</span></div>
                <button id="btn-finalize" class="w-full py-5 rounded-3xl font-black text-white ${state.canvas.isSigned ? 'wavelink-gradient shadow-xl' : 'bg-slate-200 cursor-not-allowed'}" ${!state.canvas.isSigned ? 'disabled' : ''}>Complete Registration</button>
            </div>
        </div>
    </div>
`;

const renderAudit = () => `
    <div class="animate-fadeIn space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-black text-[#0f2d4d]">Compliance Tracker</h2>
                <p class="text-xs text-slate-500">Real-time audit records for Wavelink Digital.</p>
            </div>
            <button id="btn-back-home" class="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg">Back to Admin</button>
        </div>
        <div class="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-200">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b">
                        <tr class="text-[10px] uppercase font-black text-slate-400">
                            <th class="px-6 py-4">Ambassador</th>
                            <th class="px-6 py-4">Verification</th>
                            <th class="px-6 py-4">Address</th>
                            <th class="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.auditHistory.map(item => `
                            <tr class="border-b hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        ${item.nidImage ? `<img src="data:image/jpeg;base64,${item.nidImage}" class="w-10 h-7 object-cover rounded shadow-sm border" />` : `<div class="w-10 h-7 bg-slate-100 rounded border flex items-center justify-center text-[8px] text-slate-300">NO DOC</div>`}
                                        <div>
                                            <p class="font-bold text-[#0f2d4d] leading-tight">${item.fullName}</p>
                                            <p class="text-[10px] font-mono text-slate-400">${item.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <p class="text-[10px] font-bold text-[#0f2d4d]">${item.nidNumber || 'N/A'}</p>
                                    <span class="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-black rounded-full uppercase border border-green-100">${item.onboardingStatus}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <p class="text-[10px] font-medium text-slate-500 line-clamp-1 max-w-[200px]">${item.address || 'No address provided'}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <button data-id="${item.id}" class="btn-copy-link text-[10px] font-black text-blue-600 border border-blue-100 px-3 py-2 rounded-xl bg-white hover:bg-blue-50 transition-colors shadow-sm">Copy Link</button>
                                </td>
                            </tr>
                        `).join('')}
                        ${state.auditHistory.length === 0 ? '<tr><td colspan="4" class="p-20 text-center text-slate-400 italic font-medium">Database is currently empty. Start onboarding to see records.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;

// --- EVENT HANDLERS ---
const attachListeners = () => {
    // Nav
    document.getElementById('btn-logo')?.addEventListener('click', () => { if(!state.isEmployeeView) { state.view = 'DASHBOARD'; render(); } });
    document.getElementById('btn-records')?.addEventListener('click', () => { state.view = 'AUDIT'; render(); });

    // Dashboard
    document.getElementById('nid-zone')?.addEventListener('click', () => document.getElementById('nid-file').click());
    document.getElementById('nid-file')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result.split(',')[1];
                const data = await verifyNIDLocally(base64);
                state.nidData = data;
                state.nidStatus = 'VERIFIED';
                state.formData.fullName = data.extractedName !== 'NAME NOT FOUND' ? data.extractedName : state.formData.fullName;
                state.formData.nidNumber = data.extractedId;
                render();
            };
            reader.readAsDataURL(file);
        }
    });

    // Form inputs state syncing
    document.getElementById('in-name')?.addEventListener('input', (e) => state.formData.fullName = e.target.value);
    document.getElementById('in-phone')?.addEventListener('input', (e) => state.formData.phone = e.target.value);
    document.getElementById('in-address')?.addEventListener('input', (e) => state.formData.address = e.target.value);
    document.getElementById('in-nid-number')?.addEventListener('input', (e) => state.formData.nidNumber = e.target.value);

    document.getElementById('onboard-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        state.employee = { 
            id: crypto.randomUUID(), 
            fullName: state.formData.fullName, 
            phone: state.formData.phone,
            address: state.formData.address,
            nidNumber: state.formData.nidNumber,
            nidImage: state.nidImage,
            onboardingStatus: 'Pending'
        };
        state.view = 'EDITOR';
        render();
    });

    document.getElementById('in-invite-name')?.addEventListener('input', (e) => state.inviteName = e.target.value);
    document.getElementById('btn-gen-link')?.addEventListener('click', () => {
        const mock = { 
            id: crypto.randomUUID(), 
            fullName: state.inviteName || "Ambassador", 
            onboardingStatus: 'Pending', 
            phone: '', 
            address: '', 
            nidNumber: '' 
        };
        const baseUrl = window.location.href.split('?')[0];
        const url = `${baseUrl}?data=${encodeData(mock)}`;
        navigator.clipboard.writeText(url);
        state.generatedLink = url;
        render();
    });

    // Editor
    document.getElementById('btn-proceed-sign')?.addEventListener('click', () => {
        const timestamp = Date.now().toString(36);
        state.canvas.securedHash = `WAVE-BD-${timestamp}`.toUpperCase();
        state.view = 'SIGN';
        render();
    });

    // Sign View
    if (state.view === 'SIGN') {
        const canvas = document.getElementById('sign-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#0f2d4d';

            const startDraw = (e) => {
                state.canvas.drawing = true;
                const rect = canvas.getBoundingClientRect();
                const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * (canvas.width / rect.width);
                const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * (canvas.height / rect.height);
                ctx.beginPath();
                ctx.moveTo(x, y);
            };
            const drawing = (e) => {
                if (!state.canvas.drawing) return;
                const rect = canvas.getBoundingClientRect();
                const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * (canvas.width / rect.width);
                const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * (canvas.height / rect.height);
                ctx.lineTo(x, y);
                ctx.stroke();
                state.canvas.isSigned = true;
            };
            const stopDraw = () => {
                state.canvas.drawing = false;
                if (state.canvas.isSigned) {
                    // Update button UI without full re-render to avoid flashing
                    const btn = document.getElementById('btn-finalize');
                    if (btn) {
                        btn.disabled = false;
                        btn.classList.remove('bg-slate-200', 'cursor-not-allowed');
                        btn.classList.add('wavelink-gradient', 'shadow-xl');
                    }
                }
            };
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', drawing);
            canvas.addEventListener('mouseup', stopDraw);
            canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); });
            canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawing(e); });
            canvas.addEventListener('touchend', stopDraw);
        }
        document.getElementById('btn-clear-canvas')?.addEventListener('click', () => {
            state.canvas.isSigned = false;
            render();
        });
        document.getElementById('btn-finalize')?.addEventListener('click', () => {
            const final = { 
                ...state.employee, 
                onboardingStatus: 'Completed', 
                signedAt: new Date().toISOString(),
                secureHash: state.canvas.securedHash
            };
            saveAudit(final);
            state.employee = null;
            state.isEmployeeView = false;
            state.view = 'DASHBOARD';
            // Clear temp form data
            state.formData = { fullName: '', phone: '', address: '', nidNumber: '' };
            state.nidImage = null;
            state.nidStatus = 'NOT_STARTED';
            render();
        });
    }

    // Audit
    document.getElementById('btn-back-home')?.addEventListener('click', () => { state.view = 'DASHBOARD'; render(); });
    document.querySelectorAll('.btn-copy-link').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = state.auditHistory.find(i => i.id === id);
            const baseUrl = window.location.href.split('?')[0];
            const url = `${baseUrl}?data=${encodeData(item)}`;
            navigator.clipboard.writeText(url);
            btn.textContent = 'COPIED!';
            setTimeout(() => btn.textContent = 'Copy Link', 2000);
        });
    });
};

// --- BOOTSTRAP ---
const init = () => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
        try {
            state.employee = decodeData(data);
            state.isEmployeeView = true;
            state.view = 'EDITOR';
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) { console.error("URL Corruption", e); }
    }
    render();
};

init();
