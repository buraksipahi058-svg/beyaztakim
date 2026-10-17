import { apiRequest } from './client.js';

// GET /health -> { status: "ok" }
export function getHealth() {
  return apiRequest('/health');
}
