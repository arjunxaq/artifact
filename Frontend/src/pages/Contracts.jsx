import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signContract, rejectContract } from "../api/backend/signing.api";
import { supabase } from "../api/supabaseClient";
import { getMyContracts } from "../api/backend/contracts.api";
import { getAssignedContracts } from "../api/backend/assigned.api";

export default function Contracts() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("managed");
    const [managedContracts, setManagedContracts] = useState([]);
    const [assignedContracts, setAssignedContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState(null);
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

    if (loading) return <p>Loading contracts...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    const renderManaged = () =>
        managedContracts.length === 0 ? (
            <p>No managed contracts.</p>
        ) : (
            managedContracts.map((contract) => (
                <ContractCard
                    key={contract.id}
                    contract={contract}
                    creatorEmail={contract.owner_email}
                    signees={contract.contract_signees}
                    onView={() => setSelectedContract(contract)}
                />
            ))
        );

    const renderAssigned = () =>
        assignedContracts.length === 0 ? (
            <p>No contracts to sign.</p>
        ) : (
            assignedContracts.map((item) => (
    <ContractCard
        key={item.id}
        contract={item.contracts_with_creator}
        creatorEmail={item.contracts_with_creator.owner_email}
        status={item.status}
        signeeId={item.id}
        onView={() =>
            setSelectedContract({
                ...item.contracts_with_creator,
                my_status: item.status,
                signee_id: item.id,
            })
        }
    />
))
        );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Contracts</h1>

            {/* Tabs */}
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

            <div className="space-y-4">
                {activeTab === "managed"
                    ? renderManaged()
                    : renderAssigned()}
            </div>

            {selectedContract && (
    <ContractModal
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
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

function ContractCard({ contract, creatorEmail, signees, status, onView }) {
    return (
        <div className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
                <h2 className="font-semibold text-lg">
                    {contract.title}
                </h2>

                <p className="text-sm text-gray-500">
                    Created on{" "}
                    {new Date(contract.created_at).toLocaleDateString()}
                </p>

                <p className="text-sm text-gray-600">
                    Creator: {creatorEmail}
                </p>

                {signees && (
                    <p className="text-sm text-gray-600">
                        {signees.length} signee(s)
                    </p>
                )}

                {status && (
                    <p className="text-sm mt-1">
                        Your Status:{" "}
                        <span className="font-medium">{status}</span>
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

function ContractModal({ contract, onClose, onStatusUpdate }) {
    const [loading, setLoading] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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

            const email = user.email;

            // Re-authenticate
            const { error: authError } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (authError) {
                setError("Incorrect password.");
                return;
            }

            const { data: { session } } =
                await supabase.auth.getSession();

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

            const { data: { session } } =
                await supabase.auth.getSession();

            onStatusUpdate(contract.signee_id, "signed");

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
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

                {!showPasswordSection ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2">
                            {contract.title}
                        </h2>

                        <p className="text-sm text-gray-600 mb-6">
                            Created by: {contract.owner_email}
                        </p>

                        <div className="border p-6 text-center text-gray-400 rounded mb-6">
                            PDF Viewer Coming Next
                        </div>

                        {contract.my_status === "pending" && (
                            <div className="flex gap-4">
                                <button
                                    onClick={() =>
                                        setShowPasswordSection(true)
                                    }
                                    disabled={loading}
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Sign Contract
                                </button>

                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-semibold mb-4">
                            Confirm Signing
                        </h3>

                        <p className="text-sm text-gray-600 mb-4">
                            You are about to sign:
                            <span className="font-medium ml-1">
                                {contract.title}
                            </span>
                        </p>

                        {error && (
                            <p className="text-red-600 text-sm mb-3">
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
                                Back
                            </button>

                            <button
                                onClick={handleConfirmSign}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                Confirm & Sign
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}