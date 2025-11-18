const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// -------------------------
// LOGIN
// -------------------------
export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Login error:", data);
    throw new Error(data.error || "Login failed");
  }

  return data;
}

// -------------------------
// REGISTER
// -------------------------
export async function register(email, password, displayName) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: email.trim(),
      password,
      displayName: displayName?.trim() || "User",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Registration error:", data);
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

// -------------------------
// FETCH USERS
// -------------------------
export async function getUsers() {
  const response = await fetch(`${API_URL}/keys`, {
    headers: getAuthHeader(),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Get users error:", data);
    throw new Error(data.error || "Failed to fetch users");
  }

  return data;
}

// -------------------------
// FETCH MESSAGES
// -------------------------
export async function getMessages(userId) {
  const response = await fetch(`${API_URL}/messages/${userId}`, {
    headers: getAuthHeader(),
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Fetch messages error:", data);
    throw new Error(data.error || "Failed to fetch messages");
  }

  return data;
}

// -------------------------
// SEND MESSAGE
// -------------------------
export async function sendMessage(userId, content) {
  const response = await fetch(`${API_URL}/messages/${userId}`, {
    method: "POST",
    headers: getAuthHeader(),
    credentials: "include",
    body: JSON.stringify({ ciphertext: content }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Send message error:", data);
    throw new Error(data.error || "Failed to send message");
  }

  return data;
}
