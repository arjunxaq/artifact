import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import { getMyContracts } from "../api/backend/contracts.api";
import { getAssignedContracts } from "../api/backend/assigned.api";
import { signContract, rejectContract } from "../api/backend/signing.api";
import {
    FileText,
    Search,
    Filter,
    Download,
    MoreVertical,
    X,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Key
} from "lucide-react";

export default function Contracts() {
    const { user, session } = useAuth();
    const [activeTab, setActiveTab] = useState("managed");
    const [managedContracts, setManagedContracts] = useState([]);
    const [assignedContracts, setAssignedContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [selectedSignees, setSelectedSignees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const token = session?.access_token;
                if (!token) return;

                const managed = await getMyContracts(token);
                const assigned = await getAssignedContracts(token);

                setManagedContracts(managed);
                setAssignedContracts(assigned);
                setError("");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (session) loadData();
    }, [session]);

    const handleAssignedView = async (item) => {
        const token = session?.access_token;
        const res = await fetch(`${(import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.startsWith('http') ? import.meta.env.VITE_API_URL : 'https://' + import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') + '/api' : 'http://localhost:8000/api')}/contracts/${item.contracts_with_creator.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setSelectedContract({
            ...data.contract,
            signee_id: item.id,
            my_status: item.status,
            current_user_id: session.user.id
        });
        setSelectedSignees(data.signees);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    const filteredContracts = (activeTab === "managed" ? managedContracts : assignedContracts.map(a => ({ ...a.contracts_with_creator, my_status: a.status, signee_row_id: a.id }))).filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 py-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Repository</h1>
                    <p className="text-zinc-500 mt-1">Manage all your digital agreements in one place.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600/50 outline-none transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab("managed")}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "managed" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    Managed
                </button>
                <button
                    onClick={() => setActiveTab("assigned")}
                    className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === "assigned" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    Assigned to me
                </button>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/50 bg-zinc-900/20">
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contract Name</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {filteredContracts.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-20 text-center text-zinc-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No contracts found.
                                </td>
                            </tr>
                        ) : (
                            filteredContracts.map((contract) => (
                                <tr key={contract.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20 transition-all">
                                                <FileText className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                                            </div>
                                            <span className="font-medium">{contract.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={contract.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-500">
                                        {new Date(contract.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={activeTab === "managed" ? () => {
                                                setSelectedContract(contract);
                                                setSelectedSignees(contract.contract_signees || []);
                                            } : () => handleAssignedView({
                                                id: contract.signee_row_id,
                                                status: contract.my_status,
                                                contracts_with_creator: contract
                                            })}
                                            className="p-2 hover:bg-zinc-800 rounded-xl transition-all"
                                        >
                                            <Eye className="w-5 h-5 text-zinc-500 hover:text-white" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedContract && (
                <ContractModal
                    contract={selectedContract}
                    signees={selectedSignees}
                    onClose={() => {
                        setSelectedContract(null);
                        setSelectedSignees([]);
                    }}
                    onStatusUpdate={(signeeId, newStatus) => {
                        setAssignedContracts((prev) =>
                            prev.map((item) =>
                                item.id === signeeId
                                    ? { ...item, status: newStatus }
                                    : item
                            )
                        );
                    }}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        SIGNED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        PARTIALLY_SIGNED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        REJECTED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        EXPIRED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.PENDING}`}>
            {status}
        </span>
    );
}

function ContractModal({ contract, signees, onClose, onStatusUpdate }) {
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const isSignee = !!contract.signee_id;

    const handleConfirmSign = async () => {
        if (!password) return setError("Password is required.");
        try {
            setLoading(true);
            setError("");
            const { data: { user } } = await supabase.auth.getUser();
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password,
            });
            if (authError) return setError("Incorrect password.");

            await signContract(contract.signee_id, session.access_token);
            onStatusUpdate(contract.signee_id, "signed");
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            await rejectContract(contract.signee_id, session.access_token);
            onStatusUpdate(contract.signee_id, "rejected");
            onClose();
        } catch (err) { alert(err.message); } finally { setLoading(false); }
    };

    const handleDownload = async () => {
        const res = await fetch(`${(import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.startsWith('http') ? import.meta.env.VITE_API_URL : 'https://' + import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') + '/api' : 'http://localhost:8000/api')}/contracts/${contract.id}/download`, {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (!res.ok) return alert("Download failed.");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${contract.title}.pdf`;
        a.click();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-zinc-950 w-full max-w-2xl border border-zinc-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-zinc-900 bg-zinc-900/10">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800 transition-colors">
                        <X className="w-5 h-5 text-zinc-500" />
                    </button>
                    <StatusBadge status={contract.status} />
                    <h2 className="text-2xl font-bold mt-4 mb-1">{contract.title}</h2>
                    <p className="text-zinc-500 text-sm">Created on {new Date(contract.created_at).toLocaleDateString()}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleDownload} className="w-full h-14 glass-card rounded-2xl flex items-center justify-center gap-2 font-medium hover:bg-indigo-600/10 transition-all">
                            <Download className="w-5 h-5" /> Download Document
                        </button>
                        <div className="w-full h-14 bg-zinc-900/50 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 text-sm">
                            SHA256: {contract.pdf_hash?.substring(0, 8)}...
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Signees & Workflow</h3>
                        <div className="space-y-3">
                            {signees.map((s) => (
                                <div key={s.id} className="glass-card rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                            <Key className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <span className="font-medium">{s.email}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${s.status === 'signed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {s.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isSignee && contract.my_status === "pending" && !showPasswordSection && (
                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setShowPasswordSection(true)} className="flex-1 btn-primary flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Complete Signature
                            </button>
                            <button onClick={handleReject} className="flex-1 h-12 rounded-xl bg-rose-600/10 border border-rose-500/20 text-rose-500 font-medium hover:bg-rose-500/20 transition-all">
                                Reject
                            </button>
                        </div>
                    )}

                    {showPasswordSection && (
                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-xs text-amber-500/80 leading-relaxed">
                                    By signing, you agree to the terms listed in the document. This action uses your cryptographic key and is legally binding.
                                </p>
                            </div>
                            {error && <p className="text-rose-500 text-sm">{error}</p>}
                            <input
                                type="password"
                                placeholder="Verify with your password"
                                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-4 outline-none focus:border-indigo-600 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => { setShowPasswordSection(false); setPassword(""); setError(""); }} className="flex-1 h-12 font-medium text-zinc-400 hover:text-white transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleConfirmSign} disabled={loading} className="flex-[2] btn-primary h-12">
                                    {loading ? "Signing..." : "Cryptographically Sign"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}