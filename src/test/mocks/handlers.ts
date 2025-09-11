import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('https://oimlpoizcfywxaahliij.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      },
    });
  }),

  // Database REST API
  http.get('https://oimlpoizcfywxaahliij.supabase.co/rest/v1/*', () => {
    return HttpResponse.json([]);
  }),

  http.post('https://oimlpoizcfywxaahliij.supabase.co/rest/v1/*', () => {
    return HttpResponse.json({ id: 'mock-id' });
  }),

  http.patch('https://oimlpoizcfywxaahliij.supabase.co/rest/v1/*', () => {
    return HttpResponse.json({ id: 'mock-id' });
  }),

  http.delete('https://oimlpoizcfywxaahliij.supabase.co/rest/v1/*', () => {
    return HttpResponse.json({});
  }),

  // Edge Functions
  http.post('https://oimlpoizcfywxaahliij.supabase.co/functions/v1/*', () => {
    return HttpResponse.json({ success: true });
  }),
];