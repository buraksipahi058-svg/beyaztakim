// Backend ile konuşan tek ortak istemci.
// Backend adresi YALNIZCA burada okunur; değiştirmek için depo kökündeki
// .env dosyasında VITE_API_URL değerini ayarlayın.
//
// Her özellik kendi dosyasını açar (ör. src/api/notes.js) ve apiRequest kullanır:
//
//   export function listNotes() {
//     return apiRequest('/notes');
//   }

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(
  /\/+$/,
  '',
);

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function readBody(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest(path, { method = 'GET', body, headers, ...options } = {}) {
  const hasBody = body !== undefined;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(hasBody && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    ...options,
  });

  const data = await readBody(response);
  if (!response.ok) {
    const message =
      typeof data?.detail === 'string' ? data.detail : `İstek başarısız oldu (${response.status})`;
    throw new ApiError(response.status, message, data);
  }
  return data;
}
