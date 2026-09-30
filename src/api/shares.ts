import { apiClient } from './client';
import { CustomerSharePayload } from '../types/share';

export async function logProductShareToBackend(payload: CustomerSharePayload): Promise<boolean> {
  try {
    // Post to /api/product-shares/ if backend endpoint is configured
    await apiClient.post('/api/product-shares/', payload);
    return true;
  } catch (err) {
    // If backend endpoint is not implemented or fails, don't break the user experience
    return false;
  }
}
