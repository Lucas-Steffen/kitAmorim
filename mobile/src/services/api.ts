const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type NestValidationItem = { constraints?: Record<string, string> };

function parseNestError(body: { message?: unknown }, status: number): string {
  const { message } = body;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.length > 0) {
    const first = message[0] as NestValidationItem | string;
    if (typeof first === 'string') return first;
    if (first?.constraints) return Object.values(first.constraints)[0] ?? '';
  }
  return `Erro ${status}`;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  formData?: FormData;
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData, token } = options;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!formData) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (!response.ok) {
    let err: { message?: unknown } = {};
    try { err = JSON.parse(await response.text()); } catch {}
    throw new Error(parseNestError(err, response.status));
  }

  const text = await response.text().catch(() => '');
  if (!text) return undefined as unknown as T;
  try { return JSON.parse(text) as T; } catch { return undefined as unknown as T; }
}
