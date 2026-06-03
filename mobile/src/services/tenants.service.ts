import { apiRequest } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type TenantKitnet = {
  id: string;
  number: string;
  address: string;
  monthlyRent: number;
  photos: string[];
};

export type TenantApi = {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  rg: string;
  kitnet: TenantKitnet;
  documentFront: string | null;
  documentBack: string | null;
  rentalStartDate: string; // YYYY-MM-DD
  rentalPeriod: number;    // meses
  rentalValue: number;
  paymentDay: number;
  createdAt: string;
  updatedAt: string;
};

export type TenantInput = {
  fullName: string;
  cpf: string;
  email: string;
  rg: string;
  kitnetId: string;
  rentalStartDate: string; // YYYY-MM-DD
  rentalPeriod: number;
  rentalValue: number;
  paymentDay: number;
  documentFront?: string;  // local URI
  documentBack?: string;   // local URI
};

export function getTenantPhotoUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/${path.replace(/^\//, '')}`;
}

function fileEntry(uri: string, name: string) {
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { uri, name: `${name}.${ext}`, type } as unknown as Blob;
}

function toFormData(data: Partial<TenantInput>): FormData {
  const fd = new FormData();
  if (data.fullName) fd.append('fullName', data.fullName);
  if (data.cpf) fd.append('cpf', data.cpf);
  if (data.email) fd.append('email', data.email);
  if (data.rg) fd.append('rg', data.rg);
  if (data.kitnetId) fd.append('kitnetId', data.kitnetId);
  if (data.rentalStartDate) fd.append('rentalStartDate', data.rentalStartDate);
  if (data.rentalPeriod !== undefined) fd.append('rentalPeriod', String(data.rentalPeriod));
  if (data.rentalValue !== undefined) fd.append('rentalValue', String(data.rentalValue));
  if (data.paymentDay !== undefined) fd.append('paymentDay', String(data.paymentDay));
  if (data.documentFront) fd.append('documentFront', fileEntry(data.documentFront, 'doc_front'));
  if (data.documentBack) fd.append('documentBack', fileEntry(data.documentBack, 'doc_back'));
  return fd;
}

export async function fetchTenants(token: string): Promise<TenantApi[]> {
  return apiRequest<TenantApi[]>('/tenants', { token });
}

export async function createTenant(data: TenantInput, token: string): Promise<TenantApi> {
  return apiRequest<TenantApi>('/tenants', {
    method: 'POST',
    formData: toFormData(data),
    token,
  });
}

export async function updateTenant(
  id: string,
  data: Partial<TenantInput>,
  token: string,
): Promise<TenantApi> {
  return apiRequest<TenantApi>(`/tenants/${id}`, {
    method: 'PATCH',
    formData: toFormData(data),
    token,
  });
}

export async function deleteTenant(id: string, token: string): Promise<void> {
  await apiRequest<void>(`/tenants/${id}`, { method: 'DELETE', token });
}
