const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export async function getTemplates(token) {
    const response = await fetch(`${API_BASE}/templates`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch templates");
    }

    return response.json();
}