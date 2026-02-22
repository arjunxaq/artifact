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

export async function createContract(token, data) {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("emails", data.emails.join(","));

    if (data.templateId) {
        formData.append("template_id", data.templateId);
        formData.append(
            "template_data",
            JSON.stringify(data.templateData)
        );
    }

    if (data.file) {
        formData.append("file", data.file);
    }

    const response = await fetch(`${API_BASE}/contracts`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to create contract");
    }

    return response.json();
}