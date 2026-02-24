import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { getDashboard } from "../api/backend/dashboard.api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function loadDashboard() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Not authenticated");

                const data = await getDashboard(token);
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) return <p className="p-6 text-slate-500">Loading dashboard...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatBox title="Managed Contracts" value={stats.managed_count} />
                <StatBox title="Contracts Assigned as Signee" value={stats.assigned_count} />
                <StatBox title="Pending Signatures" value={stats.pending_contracts.length} accent />
            </div>

            {/* Pending Contracts */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">
                    Pending Contracts
                </h2>

                {stats.pending_contracts.length === 0 ? (
                    <p className="text-slate-500">No contracts waiting for your signature.</p>
                ) : (
                    <div className="space-y-3">
                        {stats.pending_contracts.map((item) => (
                            <div
                                key={item.id}
                                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition"
                            >
                                <div className="font-medium text-slate-800">
                                    {item.contracts_with_creator.title}
                                </div>
                                <div className="text-sm text-slate-500 mt-1">
                                    From: {item.contracts_with_creator.owner_email}
                                </div>
                                <div className="text-sm text-slate-400">
                                    Created:{" "}
                                    {new Date(item.contracts_with_creator.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate("/contracts")}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
                Go to Contracts
            </button>
        </div>
    );
}

function StatBox({ title, value, accent = false }) {
    return (
        <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${accent ? "text-red-500" : "text-slate-800"}`}>
                {value}
            </p>
        </div>
    );
}