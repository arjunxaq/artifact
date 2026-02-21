import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import {
    getInviteDetails,
    signContract,
    rejectContract,
} from "../api/backend/invite.api";

export default function Invite() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [inviteData, setInviteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        async function loadInvite() {
            try {
                const data = await getInviteDetails(token);
                setInviteData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadInvite();
    }, [token]);

    const handleSign = async () => {
        try {
            setActionLoading(true);

            const { data: { session } } =
                await supabase.auth.getSession();

            if (!session) {
                navigate("/login");
                return;
            }

            await signContract(token, session.access_token);
            alert("Contract signed successfully!");
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);

            const { data: { session } } =
                await supabase.auth.getSession();

            if (!session) {
                navigate("/login");
                return;
            }

            await rejectContract(token, session.access_token);
            alert("Contract rejected.");
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <p>Loading invite...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (!inviteData) return null;

    const contract = inviteData.contracts;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">
                Contract Invitation
            </h1>

            <div className="bg-white p-6 rounded shadow space-y-4">
                <h2 className="text-lg font-semibold">
                    {contract.title}
                </h2>

                <p className="text-sm text-slate-500">
                    Created on{" "}
                    {new Date(contract.created_at).toLocaleDateString()}
                </p>

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={handleSign}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Sign Contract
                    </button>

                    <button
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Reject Contract
                    </button>
                </div>
            </div>
        </div>
    );
}