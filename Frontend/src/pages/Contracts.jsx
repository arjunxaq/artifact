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
                    key={item.contracts_with_creator.id}
                    contract={item.contracts_with_creator}
                    creatorEmail={item.contracts_with_creator.owner_email}
                    status={item.status}
                    onView={() =>
                        setSelectedContract({
                            ...item.contracts_with_creator,
                            my_status: item.status,
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

function ContractModal({ contract, onClose }) {
    const signees = contract.contract_signees || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white w-11/12 max-w-3xl p-6 rounded shadow-lg relative max-h-[90vh] overflow-y-auto">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-2">
                    {contract.title}
                </h2>

                <div className="text-sm text-gray-600 mb-6">
                    <p>
                        Created by:{" "}
                        <span className="font-medium">
                            {contract.owner_email}
                        </span>
                    </p>
                    <p>
                        Created on:{" "}
                        {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Signees */}
                {signees.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold mb-3">
                            Signees
                        </h3>

                        <div className="border rounded mb-6">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-2 text-left">Email</th>
                                        <th className="p-2 text-left">Status</th>
                                        <th className="p-2 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {signees.map((signee) => (
                                        <tr key={signee.id} className="border-t">
                                            <td className="p-2">
                                                {signee.email}
                                            </td>
                                            <td className="p-2">
                                                {signee.status}
                                            </td>
                                            <td className="p-2">
                                                {signee.signed_at
                                                    ? new Date(signee.signed_at).toLocaleDateString()
                                                    : signee.rejected_at
                                                    ? new Date(signee.rejected_at).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                <h3 className="text-lg font-semibold mb-3">
                    Contract Document
                </h3>

                <div className="border p-6 text-center text-gray-400 rounded">
                    PDF Viewer Coming Next
                </div>
            </div>
        </div>
    );
}
