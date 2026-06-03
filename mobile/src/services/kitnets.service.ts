import { apiRequest } from './api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type KitnetApi = {
  id: string;
  number: string;
  address: string;
  monthlyRent: number;
  latitude?: number;
  longitude?: number;
  photos: string[];
  createdAt: string;
  updatedAt: string;
};

export type KitnetInput = {
  number: string;
  address: string;
  monthlyRent: number;
  latitude?: number;
  longitude?: number;
  photos?: string[];
};

export function getPhotoUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/${path.replace(/^\//, '')}`;
}

function toFormData(data: Partial<KitnetInput>): FormData {
  const fd = new FormData();
  if (data.number !== undefined) fd.append('number', data.number);
  if (data.address !== undefined) fd.append('address', data.address);
  if (data.monthlyRent !== undefined) fd.append('monthlyRent', String(data.monthlyRent));
  if (data.latitude !== undefined) fd.append('latitude', String(data.latitude));
  if (data.longitude !== undefined) fd.append('longitude', String(data.longitude));
  data.photos?.forEach((uri) => {
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    fd.append('photos', { uri, name: `photo.${ext}`, type } as unknown as Blob);
  });
  return fd;
}

export async function fetchKitnets(token: string): Promise<KitnetApi[]> {
  return apiRequest<KitnetApi[]>('/kitnets', { token });
}

export async function createKitnet(data: KitnetInput, token: string): Promise<KitnetApi> {
  return apiRequest<KitnetApi>('/kitnets', {
    method: 'POST',
    formData: toFormData(data),
    token,
  });
}

export async function updateKitnet(
  id: string,
  data: Partial<KitnetInput>,
  token: string,
): Promise<KitnetApi> {
  return apiRequest<KitnetApi>(`/kitnets/${id}`, {
    method: 'PATCH',
    formData: toFormData(data),
    token,
  });
}

export async function deleteKitnet(id: string, token: string): Promise<void> {
  await apiRequest<void>(`/kitnets/${id}`, { method: 'DELETE', token });
}
