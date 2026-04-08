import api from '@/lib/api';
import Cookies from 'js-cookie';

export const login = async (username: string, password: string) => {
  // URLSearchParams automatically encodes the data as 'application/x-www-form-urlencoded'
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const { data } = await api.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // Store the tokens securely in cookies
  Cookies.set('access_token', data.access_token);
  Cookies.set('refresh_token', data.refresh_token);
  
  return data;
};

export const logout = async () => {
  const refreshToken = Cookies.get('refresh_token');
  if (refreshToken) {
    // We don't await this or wrap in strict try/catch because we want to clear local cookies 
    // even if the server is unreachable or the token is already invalid.
    api.post('/auth/logout', { refresh_token: refreshToken }).catch(() => {});
  }
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
  window.location.href = '/login';
};