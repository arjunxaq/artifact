import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyContracts } from "../api/contracts.api";

export default function Contracts() {
    const { user } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadContracts() {
            try {
                const data = await getMyContracts(user.id);
                setContracts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadContracts();
    }, [user.id]);

    if (loading) {
        return <p>Loading contracts...</p>;
    }

    if (error) {
        return <p className="text-red-600">{error}</p>;
    }

    if (contracts.length === 0) {
        return (
            <p className="text-slate-600">
                You haven’t created any contracts yet.
            </p>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">
                Contracts
            </h1>

            <div className="space-y-4">
                {contracts.map((contract) => {
                    const signees = contract.contract_signees;
                    const allSigned =
                        signees.length > 0 &&
                        signees.every((s) => s.status === "signed");

                    return (
                        <div
                            key={contract.id}
                            className="bg-white p-4 rounded shadow flex justify-between items-center"
                        >
                            <div>
                                <h2 className="font-semibold text-lg">
                                    {contract.title}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Created on{" "}
                                    {new Date(contract.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {signees.length} signee(s)
                                </p>
                            </div>

                            <div>
                                {allSigned ? (
                                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
                                        Signed
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded">
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
