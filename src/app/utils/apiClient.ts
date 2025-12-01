// utils/apiClient.ts

export const apiClient = async (url: string, options: RequestInit = {}) => {
  let token: string | null = null;

  // ⛔ Avoid localStorage during SSR
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  // 🚨 Token expired or missing → redirect to login
  if (res.status === 401) {
    console.warn(`[apiClient] 401 Unauthorized → redirecting to /login`);
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return null; // Let caller know we’re done
  }

  // 🧼 Log non-OK errors
  if (!res.ok) {
    const err = await res.text();
    console.error(`[apiClient Error] ${url}`, res.status, err);
  }

  return res;
};
