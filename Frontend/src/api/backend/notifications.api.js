const API_BASE = "http://localhost:8000/api";

export async function getNotifications(token) {
    const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch notifications");
    }

    return response.json();
}

export async function deleteNotification(notificationId, token) {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete notification");
    }

    return response.json();
}
