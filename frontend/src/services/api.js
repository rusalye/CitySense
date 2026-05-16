const RAW_API_BASE = import.meta.env.VITE_API_URL || "https://citysense-api.onrender.com";
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

export const getZones = async (chapterId = null, mode = null, ageGroup = null) => {
  let url = `${API_BASE}/zones`;
  const params = [];
  if (chapterId) params.push(`chapter_id=${chapterId}`);
  if (mode) params.push(`mode=${mode}`);
  if (ageGroup) params.push(`age_group=${ageGroup}`);
  if (params.length) url += '?' + params.join('&');
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch zones");
  return res.json();
};

export const getEnvironment = async (lat, lng) => {
  const res = await fetch(`${API_BASE}/environment?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error("Failed to fetch environment");
  return res.json();
};

export const getChapters = async () => {
    const res = await fetch(`${API_BASE}/chapters`);
    if (!res.ok) throw new Error("Failed to fetch chapters");
    return res.json();
}

export const getJournal = async () => {
    const res = await fetch(`${API_BASE}/journal`);
    if (!res.ok) throw new Error("Failed to fetch journal");
    return res.json();
}

export const createJournal = async (entry) => {
    const res = await fetch(`${API_BASE}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Failed to create journal");
    return res.json();
}

export const deleteJournal = async (entryId) => {
    const res = await fetch(`${API_BASE}/journal/${entryId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to delete journal entry");
    return res.json();
}

export const getChallenges = async () => {
    const res = await fetch(`${API_BASE}/challenges`);
    if (!res.ok) throw new Error("Failed to fetch challenges");
    return res.json();
}

export const getCards = async () => {
    const res = await fetch(`${API_BASE}/cards`);
    if (!res.ok) throw new Error("Failed to fetch cards");
    return res.json();
}

export const authRegister = async (email, password, name, username, age, phone) => {
    const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, username, age, phone }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
    }
    return res.json();
}

export const authLogin = async (email, password) => {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
    }
    return res.json();
}

export const updateProfile = async (userId, data) => {
    const res = await fetch(`${API_BASE}/users/${userId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Profile update failed");
    }
    return res.json();
}

export const updatePassword = async (userId, current_password, new_password) => {
    const res = await fetch(`${API_BASE}/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password }),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Password update failed");
    }
    return res.json();
}