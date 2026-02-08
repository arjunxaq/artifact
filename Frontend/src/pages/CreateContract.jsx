import { useState } from "react";
import { createContract } from "../api/contracts.api";
import { useAuth } from "../context/AuthContext";

export default function CreateContract() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [emails, setEmails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await createContract({
                title,
                file,
                ownerId: user.id,
                emails: emails.split(",").map((e) => e.trim()),
            });

            setSuccess("Contract created successfully!");
            setTitle("");
            setFile(null);
            setEmails("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">
                Create Contract
            </h1>

            <form
                onSubmit={handleSubmit}
                className="max-w-xl bg-white p-6 rounded shadow space-y-4"
            >
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <input
                    type="text"
                    placeholder="Contract Title"
                    className="w-full border p-2 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                />

                <textarea
                    placeholder="Signee emails (comma separated)"
                    className="w-full border p-2 rounded"
                    rows="3"
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    required
                />

                <button
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Sending..." : "Send Contract"}
                </button>
            </form>
        </div>
    );
}
