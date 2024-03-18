// app/_services/api.ts
import axios from 'axios';
import { parseCookies, setCookie } from 'nookies';

export const api = axios.create({
  baseURL: 'http://localhost:3030/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

 

export function updateApiToken(token: string) {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
  setCookie(undefined, 'jwt', token, {
    maxAge: 60 * 60 * 1, // 1 hour
  });
}

// Atualize o token no carregamento inicial
const { 'jwt': initialToken } = parseCookies();
if (initialToken) {
  updateApiToken(initialToken);
}
