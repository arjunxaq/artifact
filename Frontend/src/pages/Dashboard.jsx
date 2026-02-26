import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { getDashboard } from "../api/backend/dashboard.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FileText,
    Users,
    Clock,
    ArrowUpRight,
    ChevronRight,
    Plus,
    Bell,
    BellOff,
    X
} from "lucide-react";
import { deleteNotification } from "../api/backend/notifications.api";

export default function Dashboard() {
    const { session } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function loadDashboard() {
            try {
                const token = session?.access_token;
                if (!token) return;

                const data = await getDashboard(token);
                setStats(data);
                setError("");
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (session) loadDashboard();
    }, [session]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-6 glass-card border-red-500/20 text-red-400 rounded-2xl">
            <p className="font-medium">Error loading dashboard</p>
            <p className="text-sm opacity-80">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10 py-4">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-zinc-500 mt-1">Monitor your contracts and pending actions.</p>
                </div>
                <button
                    onClick={() => navigate("/create")}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Contract</span>
                </button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox
                    title="Managed"
                    value={stats.managed_count}
                    icon={FileText}
                    description="Contracts created by you"
                />
                <StatBox
                    title="Signee"
                    value={stats.assigned_count}
                    icon={Users}
                    description="Assigned for your review"
                />
                <StatBox
                    title="Pending"
                    value={stats.pending_contracts.length}
                    icon={Clock}
                    accent
                    description="Requires your immediate action"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Contracts Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
                        <button
                            onClick={() => navigate("/contracts")}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-all"
                        >
                            View All <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {stats.pending_contracts.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-400">All caught up! No contracts waiting.</p>
                            </div>
                        ) : (
                            stats.pending_contracts.map((item) => (
                                <div
                                    key={item.id}
                                    className="glass-card rounded-2xl p-5 flex items-center justify-between group cursor-pointer"
                                    onClick={() => navigate(`/contracts`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <FileText className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{item.contracts_with_creator.title}</h3>
                                            <p className="text-sm text-zinc-500 mt-0.5">
                                                {item.contracts_with_creator.owner_email} • {new Date(item.contracts_with_creator.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            Pending
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Notifications Panel */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold tracking-tight">Latest Notifications</h2>
                    <div className="space-y-4">
                        {!stats.notifications || stats.notifications.length === 0 ? (
                            <div className="glass-card rounded-2xl p-8 text-center border-dashed border-zinc-800">
                                <BellOff className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                                <p className="text-sm text-zinc-500 font-medium">Clear for now!</p>
                            </div>
                        ) : (
                            stats.notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className="glass-card rounded-2xl p-4 flex items-start gap-4 group relative"
                                >
                                    <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 pr-8">
                                        <p className="text-sm font-medium leading-relaxed">{notif.message}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2">
                                            {new Date(notif.created_at).toLocaleDateString()} • {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await deleteNotification(notif.id, session.access_token);
                                                setStats(prev => ({
                                                    ...prev,
                                                    notifications: prev.notifications.filter(n => n.id !== notif.id)
                                                }));
                                            } catch (err) {
                                                console.error("Failed to delete notification:", err);
                                            }
                                        }}
                                        className="absolute right-3 top-3 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                        title="Dismiss"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ title, value, icon: Icon, description, accent = false }) {
    return (
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full transition-all duration-500 ${accent ? 'bg-indigo-600/10' : 'bg-zinc-800/20'} group-hover:scale-150 opacity-50`}></div>
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${accent ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'} shadow-inner`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
                        <p className="text-4xl font-bold tracking-tight">
                            {value}
                        </p>
                    </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium">{description}</p>
            </div>
        </div>
    );
}

function ActionCard({ title, description, icon: Icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 text-left group"
        >
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-zinc-500 truncate">{description}</p>
            </div>
        </button>
    );
}