import request from 'supertest';

import { createApp } from '../src/app.js';

describe('app', () => {
  it('exposes a health endpoint for the server process', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('restricts cross-origin requests to the configured frontend', async () => {
    const response = await request(createApp('https://frontend.example'))
      .get('/health')
      .set('Origin', 'https://frontend.example');

    expect(response.headers['access-control-allow-origin']).toBe(
      'https://frontend.example',
    );
  });
});
