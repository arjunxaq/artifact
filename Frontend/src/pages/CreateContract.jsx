import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import { createContract } from "../api/backend/contracts.api";
import { getTemplates } from "../api/backend/template.api";
import { extractPlaceholders } from "../utils/templateParser";
import {
    FileText,
    Upload,
    ChevronLeft,
    Check,
    Plus,
    Mail,
    Calendar,
    Type,
    ArrowRight,
    Loader2,
    X,
    Clock
} from "lucide-react";

export default function CreateContract() {
    const { user, session } = useAuth();
    const [activeTab, setActiveTab] = useState("templates");
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [templateData, setTemplateData] = useState({});
    const [customFile, setCustomFile] = useState(null);
    const [title, setTitle] = useState("");
    const [emails, setEmails] = useState("");
    const [signingDeadline, setSigningDeadline] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadTemplates() {
            try {
                const token = session?.access_token;
                if (!token) return;
                const data = await getTemplates(token);
                setTemplates(data);
            } catch (err) { setError("Failed to load templates"); }
        }
        if (session) loadTemplates();
    }, [session]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        const fields = extractPlaceholders(template.html_content);
        setDynamicFields(fields);
        setTemplateData({});
    };

    const handleFieldChange = (key, value) => {
        setTemplateData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const token = session?.access_token;
            if (!token) throw new Error("Authentication session lost. Please refresh.");

            if (activeTab === "templates") {
                await createContract(token, {
                    templateId: selectedTemplate.id,
                    title,
                    templateData,
                    emails: emails.split(",").map(e => e.trim()),
                    signingDeadline,
                    expiryDate
                });
            } else {
                if (!customFile) throw new Error("Please select a file to upload");
                await createContract(token, {
                    title,
                    emails: emails.split(",").map(e => e.trim()),
                    file: customFile,
                    signingDeadline,
                    expiryDate
                });
            }

            setSuccess("Contract created successfully.");
            // Reset form
            setTitle("");
            setEmails("");
            setSigningDeadline("");
            setExpiryDate("");
            setCustomFile(null);
            setSelectedTemplate(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Create Document</h1>
                <p className="text-zinc-500 mt-1">Generate from templates or upload your own PDF.</p>
            </header>

            {/* Mode Switcher */}
            {!selectedTemplate && (
                <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab("templates")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "templates" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab("upload")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "upload" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        <Upload className="w-4 h-4" />
                        Upload Custom
                    </button>
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <X className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">{success}</span>
                </div>
            )}

            {activeTab === "templates" && (
                <div className="animate-in fade-in duration-500">
                    {!selectedTemplate ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {templates.map(template => (
                                <button
                                    key={template.id}
                                    className="glass-card p-6 rounded-3xl text-left group flex flex-col justify-between h-48"
                                    onClick={() => handleTemplateSelect(template)}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-indigo-600 transition-all group-hover:scale-110 shadow-lg">
                                        <FileText className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-white transition-colors">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
                                            Use this template <ArrowRight className="w-3 h-3" />
                                        </p>
                                    </div>
                                </button>
                            ))}
                            <div className="glass-card border-dashed border-zinc-700 p-6 rounded-3xl flex flex-col items-center justify-center text-zinc-500 gap-2 h-48 opacity-50 cursor-not-allowed">
                                <Plus className="w-8 h-8" />
                                <span className="text-sm font-medium">Coming Soon</span>
                            </div>
                        </div>
                    ) : (
                        <DocumentForm
                            title={title}
                            setTitle={setTitle}
                            emails={emails}
                            setEmails={setEmails}
                            signingDeadline={signingDeadline}
                            setSigningDeadline={setSigningDeadline}
                            expiryDate={expiryDate}
                            setExpiryDate={setExpiryDate}
                            loading={loading}
                            onSubmit={handleSubmit}
                            onBack={() => setSelectedTemplate(null)}
                            dynamicFields={dynamicFields}
                            handleFieldChange={handleFieldChange}
                            btnText={loading ? "Generating..." : "Generate Contract"}
                        />
                    )}
                </div>
            )}

            {activeTab === "upload" && (
                <div className="animate-in fade-in duration-500">
                    <DocumentForm
                        title={title}
                        setTitle={setTitle}
                        emails={emails}
                        setEmails={setEmails}
                        signingDeadline={signingDeadline}
                        setSigningDeadline={setSigningDeadline}
                        expiryDate={expiryDate}
                        setExpiryDate={setExpiryDate}
                        loading={loading}
                        onSubmit={handleSubmit}
                        customFile={customFile}
                        setCustomFile={setCustomFile}
                        isUpload
                        btnText={loading ? "Uploading..." : "Publish Contract"}
                    />
                </div>
            )}
        </div>
    );
}

function DocumentForm({
    title, setTitle,
    emails, setEmails,
    signingDeadline, setSigningDeadline,
    expiryDate, setExpiryDate,
    loading, onSubmit, onBack,
    dynamicFields = [], handleFieldChange,
    isUpload = false, customFile, setCustomFile,
    btnText
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-8 glass-card rounded-[2.5rem] p-10 relative">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="absolute -top-12 left-0 flex items-center gap-1 text-zinc-500 hover:text-white transition-all text-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to templates
                </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Document Identity</h3>
                    <div className="space-y-4">
                        <InputGroup label="Contract Title" icon={Type}>
                            <input
                                type="text"
                                placeholder="e.g. Service Agreement - 2024"
                                className="form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </InputGroup>

                        {isUpload && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Document File</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        id="customFile"
                                        onChange={(e) => setCustomFile(e.target.files[0])}
                                    />
                                    <label
                                        htmlFor="customFile"
                                        className="w-full h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all"
                                    >
                                        <Upload className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                        <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                                            {customFile ? customFile.name : "Select PDF Document"}
                                        </span>
                                        {customFile && (
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                                                {(customFile.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {dynamicFields.length > 0 && (
                            <div className="space-y-4 pt-2">
                                <label className="text-sm font-medium text-zinc-300 ml-1">Template Variables</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dynamicFields.map(field => {
                                        const lowerField = field.toLowerCase();
                                        const isDate = lowerField.includes('date');
                                        const isNumber = lowerField.includes('rent') || lowerField.includes('fee') || lowerField.includes('deposit') || lowerField.includes('amount');
                                        const isLong = lowerField.includes('terms') || lowerField.includes('description') || lowerField.includes('address');
                                        
                                        return (
                                            <div key={field} className={isLong ? "md:col-span-2" : ""}>
                                                <label className="text-xs font-semibold text-zinc-400 mb-1 ml-1 block">
                                                    {field.replace(/_/g, " ").toUpperCase()}
                                                </label>
                                                {isLong ? (
                                                    <textarea
                                                        placeholder={`Enter ${field.replace(/_/g, " ")}`}
                                                        className="form-input min-h-[80px]"
                                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="relative">
                                                        {isNumber && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">$</span>}
                                                        <input
                                                            type={isDate ? "date" : "text"}
                                                            placeholder={isDate ? "" : `Enter ${field.replace(/_/g, " ")}`}
                                                            className={`form-input h-11 ${isNumber ? "pl-7" : ""}`}
                                                            onChange={(e) => handleFieldChange(field, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Workflow & Governance</h3>
                    <div className="space-y-4">
                        <InputGroup label="Recipient Emails" icon={Mail}>
                            <textarea
                                placeholder="john@example.com, sara@example.com"
                                className="form-input min-h-[100px] py-3"
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                                required
                            />
                        </InputGroup>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Signing Deadline" icon={Calendar}>
                                <input
                                    type="datetime-local"
                                    className="form-input text-xs"
                                    value={signingDeadline}
                                    onChange={(e) => setSigningDeadline(e.target.value)}
                                />
                            </InputGroup>
                            <InputGroup label="Contract Expiry" icon={Clock}>
                                <input
                                    type="datetime-local"
                                    className="form-input text-xs"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-zinc-900 flex justify-end">
                <button
                    disabled={loading}
                    className="btn-primary min-w-[200px] h-14 relative group"
                >
                    <div className="flex items-center justify-center gap-2">
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>{btnText}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </div>
                </button>
            </div>
        </form>
    )
}

function InputGroup({ label, icon: Icon, children }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1 flex items-center gap-2">
                <Icon className="w-4 h-4 text-zinc-500" /> {label}
            </label>
            {children}
        </div>
    )
}