const API_BASE = "http://localhost:8000/api";

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