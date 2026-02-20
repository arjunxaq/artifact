const API_BASE = "http://localhost:8000/api";

export async function getMyContracts(token) {
    const response = await fetch(`${API_BASE}/contracts`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch contracts");
    }

    return response.json();
}

export async function createContract(token, { title, file, emails }) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("emails", emails.join(","));

    const response = await fetch(`${API_BASE}/contracts`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error("Failed to create contract");
    }

    return response.json();
}