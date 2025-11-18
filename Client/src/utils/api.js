const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

export async function register(email, password, displayName) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName }),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
}

export async function getUsers() {
  const response = await fetch(`${API_URL}/keys`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function getMessages(userId) {
  const response = await fetch(`${API_URL}/messages/${userId}`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}

export async function sendMessage(userId, content) {
  const response = await fetch(`${API_URL}/messages/${userId}`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ ciphertext: content }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}
