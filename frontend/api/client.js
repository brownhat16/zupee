import { Platform } from "react-native";

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const defaultApiBaseUrl = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000",
});

const API_BASE_URL = (rawApiBaseUrl || defaultApiBaseUrl).replace(/\/$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error(`Cannot reach API at ${API_BASE_URL}. Check Metro/backend/network setup.`);
  }

  if (!response.ok) {
    const responseType = response.headers.get("content-type") || "";

    if (responseType.includes("application/json")) {
      const payload = await response.json();
      throw new Error(payload.detail || payload.message || "Request failed");
    }

    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json();
}

export function getStats() {
  return request("/stats");
}

export function sendChat(message, personality) {
  return request("/chat", {
    method: "POST",
    body: JSON.stringify({ message, personality }),
  });
}

export function playCricket(choice, personality) {
  return request("/cricket/predict", {
    method: "POST",
    body: JSON.stringify({ choice, personality }),
  });
}

export function startBluff(personality) {
  return request("/bluff/start", {
    method: "POST",
    body: JSON.stringify({ personality }),
  });
}

export function askBluff(sessionId, question, personality) {
  return request("/bluff/ask", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, question, personality }),
  });
}

export function guessBluff(sessionId, guess, personality) {
  return request("/bluff/guess", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, guess, personality }),
  });
}
