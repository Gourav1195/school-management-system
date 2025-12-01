import { cookies } from 'next/headers'

export const getToken = async () => {
  const cookieStore = await cookies(); //await removed
  const token = cookieStore.get('token')?.value;
  return token || null;
}

export const getAuthHeader = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
