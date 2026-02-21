import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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

    const renderManaged = () => (
        managedContracts.length === 0 ? (
            <p>No managed contracts.</p>
        ) : (
            managedContracts.map((contract) => (
                <ContractCard
                    key={contract.id}
                    contract={contract}
                    onView={() => setSelectedContract(contract)}
                />
            ))
        )
    );

    const renderAssigned = () => (
        assignedContracts.length === 0 ? (
            <p>No contracts to sign.</p>
        ) : (
            assignedContracts.map((item) => (
                <ContractCard
                    key={item.contracts.id}
                    contract={item.contracts}
                    status={item.status}
                    onView={() => setSelectedContract(item.contracts)}
                />
            ))
        )
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

            {/* Content */}
            <div className="space-y-4">
                {activeTab === "managed"
                    ? renderManaged()
                    : renderAssigned()}
            </div>

            {/* Modal */}
            {selectedContract && (
                <ContractModal
                    contract={selectedContract}
                    onClose={() => setSelectedContract(null)}
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
                        Status: {status}
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

function ContractModal({ contract, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white w-3/4 max-w-2xl p-6 rounded shadow relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-xl font-bold mb-4">
                    {contract.title}
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                    Created on{" "}
                    {new Date(contract.created_at).toLocaleDateString()}
                </p>

                <div className="border p-4 text-center text-gray-400">
                    PDF Viewer Coming Soon
                </div>
            </div>
        </div>
    );
}
