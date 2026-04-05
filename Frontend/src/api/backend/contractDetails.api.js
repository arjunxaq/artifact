const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export async function getContractDetails(contractId, token) {
    const res = await fetch(`${API_BASE}/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
}

export async function downloadContract(contractId, token) {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contract.pdf";
    a.click();
}

export async function resendContract(contractId, token) {
    await fetch(`${API_BASE}/contracts/${contractId}/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });
}