import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import { getMyContracts } from "../api/backend/contracts.api";
import { getAssignedContracts } from "../api/backend/assigned.api";
import { signContract, rejectContract } from "../api/backend/signing.api";

export default function Contracts() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("managed");
    const [managedContracts, setManagedContracts] = useState([]);
    const [assignedContracts, setAssignedContracts] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [selectedSignees, setSelectedSignees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { session } } =
                    await supabase.auth.getSession();

                const token = session?.access_token;
                if (!token) throw new Error("Not authenticated");

                const managed = await getMyContracts(token);
                const assigned = await getAssignedContracts(token);

                setManagedContracts(managed);
                setAssignedContracts(assigned);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (user) loadData();
    }, [user]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const handleAssignedView = async (item) => {
        const { data: { session } } =
            await supabase.auth.getSession();

        const token = session?.access_token;

        const res = await fetch(
            `http://localhost:8000/api/contracts/${item.contracts_with_creator.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await res.json();

        setSelectedContract({
            ...data.contract,
            signee_id: item.id,
            my_status: item.status,
            current_user_id: session.user.id
        });

        setSelectedSignees(data.signees);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Contracts</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab("managed")}
                    className={`px-4 py-2 rounded ${
                        activeTab === "managed"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200"
                    }`}
                >
                    Managed Contracts
                </button>

                <button
                    onClick={() => setActiveTab("assigned")}
                    className={`px-4 py-2 rounded ${
                        activeTab === "assigned"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200"
                    }`}
                >
                    For Signing
                </button>
            </div>

            {activeTab === "managed" &&
                managedContracts.map((contract) => (
                    <ContractCard
                        key={contract.id}
                        contract={contract}
                        onView={() => {
                            setSelectedContract(contract);
                            setSelectedSignees(contract.contract_signees || []);
                        }}
                    />
                ))
            }

            {activeTab === "assigned" &&
                assignedContracts.map((item) => (
                    <ContractCard
                        key={item.id}
                        contract={item.contracts_with_creator}
                        status={item.status}
                        onView={() => handleAssignedView(item)}
                    />
                ))
            }

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

function ContractCard({ contract, status, onView }) {
    return (
        <div className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
                <h2 className="font-semibold text-lg">
                    {contract.title}
                </h2>

                <p className="text-sm text-gray-500">
                    {new Date(contract.created_at).toLocaleDateString()}
                </p>

                {status && (
                    <p className="text-sm mt-1">
                        Your Status: {status}
                    </p>
                )}
            </div>

            <button
                onClick={onView}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
            >
                View
            </button>
        </div>
    );
}

function ContractModal({
    contract,
    signees,
    onClose,
    onStatusUpdate
}) {
    const [loading, setLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const isOwner =
        contract.owner_id === contract.current_user_id;

    const isSignee = !!contract.signee_id;

    const getToken = async () => {
        const { data: { session } } =
            await supabase.auth.getSession();
        return session?.access_token;
    };

    const handleConfirmSign = async () => {
        if (!password) {
            setError("Password is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const { data: { user } } =
                await supabase.auth.getUser();

            const { error: authError } =
                await supabase.auth.signInWithPassword({
                    email: user.email,
                    password,
                });

            if (authError) {
                setError("Incorrect password.");
                return;
            }

            const token = await getToken();
            await signContract(contract.signee_id, token);

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
            const token = await getToken();

            await rejectContract(contract.signee_id, token);

            onStatusUpdate(contract.signee_id, "rejected");
            onClose();

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const token = await getToken();

        const res = await fetch(
            `http://localhost:8000/api/contracts/${contract.id}/download`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            alert("Download failed.");
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "contract.pdf";
        a.click();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-11/12 max-w-3xl p-6 rounded shadow-lg relative max-h-[90vh] overflow-y-auto">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-2">
                    {contract.title}
                </h2>

                <p className="mb-4">
                    Status:
                    <span className={`ml-2 font-semibold ${
                        contract.status === "SIGNED"
                            ? "text-green-600"
                            : contract.status === "REJECTED"
                            ? "text-red-600"
                            : "text-yellow-600"
                    }`}>
                        {contract.status}
                    </span>
                </p>

                <button
                    onClick={handleDownload}
                    className="bg-gray-700 text-white px-4 py-2 rounded mb-6"
                >
                    Download PDF
                </button>

                <h3 className="text-lg font-semibold mb-3">
                    Signees
                </h3>

                <div className="space-y-3 mb-6">
                    {signees.map((s) => (
                        <div
                            key={s.id}
                            className="border p-3 rounded"
                        >
                            <div>Email: {s.email}</div>
                            <div>Status: {s.status}</div>
                        </div>
                    ))}
                </div>

                {isSignee &&
                 contract.my_status === "pending" &&
                 !showPasswordSection && (
                    <div className="flex gap-4">
                        <button
                            onClick={() =>
                                setShowPasswordSection(true)
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Sign
                        </button>

                        <button
                            onClick={handleReject}
                            className="bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Reject
                        </button>
                    </div>
                )}

                {showPasswordSection && (
                    <div className="mt-6">
                        {error && (
                            <p className="text-red-600 mb-3">
                                {error}
                            </p>
                        )}

                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full border p-2 rounded mb-4"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setPassword("");
                                    setError("");
                                }}
                                className="px-4 py-2 bg-gray-200 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirmSign}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Confirm & Sign
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}