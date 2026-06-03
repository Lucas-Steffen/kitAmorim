import { apiRequest } from './api';

export type LoginResponse = { token: string };

const AUTH_ERRORS: Record<string, string> = {
  'Email or password is invalid!': 'E-mail ou senha incorretos.',
  'email must be an email': 'Informe um e-mail válido.',
  'password should not be empty': 'A senha não pode estar vazia.',
  'Invalid code': 'Código inválido.',
  'Code expired': 'Código expirado. Solicite um novo.',
  'User not found': 'E-mail não encontrado.',
};

function translate(err: unknown): never {
  const raw = err instanceof Error ? err.message : '';
  throw new Error(AUTH_ERRORS[raw] ?? 'Falha na operação. Tente novamente.');
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    return await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  } catch (err) {
    return translate(err);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await apiRequest('/users/forgot-password', { method: 'POST', body: { email } });
  } catch (err) {
    return translate(err);
  }
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  try {
    await apiRequest('/users/forgot-password/validate', {
      method: 'POST',
      body: { email, code, newPassword },
    });
  } catch (err) {
    return translate(err);
  }
}
