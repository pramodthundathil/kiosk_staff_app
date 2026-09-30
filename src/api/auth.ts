import { apiClient } from './client';
import { LoginResponse, StaffUser } from '../types/auth';

export async function loginStaffUser(username: string, password: string): Promise<LoginResponse> {
  // Post to /api/cms/auth/login/ endpoint as provided by Django backend
  const response = await apiClient.post('/api/cms/auth/login/', {
    username: username.trim(),
    password,
  });

  const data = response.data;
  return {
    access: data.access,
    refresh: data.refresh,
    username: data.username,
    role: data.role,
    role_display: data.role_display,
  };
}

export async function changeStaffPassword(oldPassword: string, newPassword: string): Promise<string> {
  const response = await apiClient.post('/api/cms/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data?.message || 'Password updated successfully.';
}
