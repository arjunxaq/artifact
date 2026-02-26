import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Mail, Lock, FileText, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error } = await login(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/40 mb-6 group hover:scale-110 transition-transform duration-500">
                        <FileText className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 italic">Artifact</h1>
                    <p className="text-zinc-500 font-medium">Secure cryptographic contract management</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="glass-card p-10 rounded-[3rem] border border-zinc-800/50 shadow-2xl space-y-6"
                >
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold">Sign In</h2>
                        <p className="text-sm text-zinc-500">Enter your credentials to access your vault.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-medium animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600/50 outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600/50 outline-none transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full btn-primary h-14 relative group overflow-hidden"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="font-bold">Enter Vault</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </div>
                    </button>

                    <p className="text-center text-sm text-zinc-500 pt-2">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="text-white hover:text-indigo-400 font-bold transition-all underline decoration-zinc-800 underline-offset-4">
                            Create Vault
                        </Link>
                    </p>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">End-to-End Cryptography • Artifact v1.0</p>
                </div>
            </div>
        </div>
    );
}
