const request = require('supertest');
const app = require('./index');

describe('DevSecOps API', () => {
  it('GET /api/health should return UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  it('GET /api/users should return a list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });
});
