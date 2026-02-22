import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import { createContract } from "../api/backend/contracts.api";
import { getTemplates } from "../api/backend/template.api";
import { extractPlaceholders } from "../utils/templateParser";

export default function CreateContract() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("templates");
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [templateData, setTemplateData] = useState({});
    const [customFile, setCustomFile] = useState(null);
    const [title, setTitle] = useState("");
    const [emails, setEmails] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadTemplates() {
            const { data: { session } } =
                await supabase.auth.getSession();
            const token = session?.access_token;

            const data = await getTemplates(token);
            setTemplates(data);
        }

        loadTemplates();
    }, []);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        const fields = extractPlaceholders(template.html_content);
        setDynamicFields(fields);
        setTemplateData({});
    };

    const handleFieldChange = (key, value) => {
        setTemplateData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const { data: { session } } =
                await supabase.auth.getSession();
            const token = session?.access_token;

            if (activeTab === "templates") {
                await createContract(token, {
                    templateId: selectedTemplate.id,
                    title,
                    templateData,
                    emails: emails.split(",").map(e => e.trim())
                });
            } else {
                await createContract(token, {
    title,
    emails: emails.split(",").map(e => e.trim()),
    file: customFile
});
            }

            setSuccess("Contract created successfully.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
                Create Contract
            </h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab("templates")}
                    className={`px-4 py-2 rounded ${
                        activeTab === "templates"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200"
                    }`}
                >
                    Templates
                </button>

                <button
                    onClick={() => setActiveTab("upload")}
                    className={`px-4 py-2 rounded ${
                        activeTab === "upload"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200"
                    }`}
                >
                    Upload Custom
                </button>
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            {activeTab === "templates" && (
                <>
                    {!selectedTemplate ? (
                        <div className="grid grid-cols-2 gap-4">
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    className="border p-4 rounded shadow cursor-pointer hover:shadow-md"
                                    onClick={() => handleTemplateSelect(template)}
                                >
                                    <h3 className="font-semibold">
                                        {template.name}
                                    </h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="max-w-xl bg-white p-6 rounded shadow space-y-4"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedTemplate(null)}
                                className="text-sm text-blue-600"
                            >
                                ← Back to templates
                            </button>

                            <input
                                type="text"
                                placeholder="Contract Title"
                                className="w-full border p-2 rounded"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />

                            {dynamicFields.map(field => (
                                <input
                                    key={field}
                                    type="text"
                                    placeholder={field.replace(/_/g, " ")}
                                    className="w-full border p-2 rounded"
                                    onChange={(e) =>
                                        handleFieldChange(field, e.target.value)
                                    }
                                    required
                                />
                            ))}

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
                                className="bg-indigo-600 text-white px-4 py-2 rounded"
                            >
                                {loading ? "Generating..." : "Create Contract"}
                            </button>
                        </form>
                    )}
                </>
            )}

            {activeTab === "upload" && (
                <div className="max-w-xl bg-white p-6 rounded shadow space-y-4">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setCustomFile(e.target.files[0])}
                    />

                    <p className="text-gray-500 text-sm">
                        Custom upload backend wiring coming next.
                    </p>
                </div>
            )}
        </div>
    );
}