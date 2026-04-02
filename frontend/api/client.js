const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
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
