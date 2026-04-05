const API_BASE = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL.startsWith('http') ? import.meta.env.VITE_API_URL : 'https://' + import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '') + '/api' : 'http://localhost:8000/api');

export async function getDashboard(token) {
    const res = await fetch(`${API_BASE}/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to load dashboard");
    }

    return res.json();
}