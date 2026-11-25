export interface AuthUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

const AUTH_API = "/api/auth";

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch(`${AUTH_API}/me`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.user ?? null;
}

export async function signupWithEmail(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthUser> {
  const res = await fetch(`${AUTH_API}/signup`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "TravelMind",
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).error || "Failed to create account.");
  }
  return (data as any).user;
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await fetch(`${AUTH_API}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "TravelMind",
    },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).error || "Invalid email or password.");
  }
  return (data as any).user;
}

export async function logoutSession(): Promise<void> {
  await fetch(`${AUTH_API}/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-Requested-With": "TravelMind",
    },
  });
}
