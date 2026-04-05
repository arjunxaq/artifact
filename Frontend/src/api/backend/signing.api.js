const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export async function signContract(signeeId, token) {
    const response = await fetch(
        `${API_BASE}/contracts/${signeeId}/sign`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to sign contract");
    }

    return response.json();
}

export async function rejectContract(signeeId, token) {
    const response = await fetch(
        `${API_BASE}/contracts/${signeeId}/reject`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to reject contract");
    }

    return response.json();
}