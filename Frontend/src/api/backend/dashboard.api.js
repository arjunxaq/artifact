const API_BASE = "http://localhost:8000/api";

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