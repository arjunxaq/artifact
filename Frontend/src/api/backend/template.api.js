const API_BASE = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.startsWith('http') ? import.meta.env.VITE_API_URL : 'https://' + import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') + '/api' : 'http://localhost:8000/api');

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