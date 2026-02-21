const API_BASE = "http://localhost:8000/api";

export async function getInviteDetails(token) {
    const response = await fetch(`${API_BASE}/invite/${token}`);

    if (!response.ok) {
        throw new Error("Invalid or expired invite");
    }

    return response.json();
}

export async function signContract(token, authToken) {
    const response = await fetch(`${API_BASE}/sign/${token}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to sign contract");
    }

    return response.json();
}

export async function rejectContract(token, authToken) {
    const response = await fetch(`${API_BASE}/reject/${token}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to reject contract");
    }

    return response.json();
}