import request from 'supertest';
import mongoose from 'mongoose';
import server from '../server';

describe('Auth', () => {
  let token;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    await mongoose.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /auth/register', () => {
    it('creates a user', () =>
      request(server)
        .post('/auth/register')
        .send({ email: 'register@test.com', password: 'testPassword' })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('register@test.com');
          expect(res.body.id).toBeDefined();
        }));

    it('does not create a duplicate user', () =>
      request(server)
        .post('/auth/register')
        .send({ email: 'register@test.com', password: 'testPassword' })
        .expect(400));

    it('requires email and password', () =>
      request(server).post('/auth/register').send({ email: 'no-password@test.com' }).expect(400));
  });

  describe('POST /auth/login', () => {
    it('returns a token for valid credentials', () =>
      request(server)
        .post('/auth/login')
        .send({ email: 'register@test.com', password: 'testPassword' })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          token = res.body.token;
        }));

    it('requires email and password', () =>
      request(server)
        .post('/auth/login')
        .send({ email: 'register@test.com' })
        .expect(400));

    it('returns 404 for an unknown user', () =>
      request(server)
        .post('/auth/login')
        .send({ email: 'missing@test.com', password: 'testPassword' })
        .expect(404));

    it('returns 401 for a bad password', () =>
      request(server)
        .post('/auth/login')
        .send({ email: 'register@test.com', password: 'wrongPassword' })
        .expect(401));
  });

  describe('GET /auth/me', () => {
    it('returns the logged-in user', () =>
      request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('register@test.com');
          expect(res.body.id).toBeDefined();
        }));

    it('requires a bearer token', () =>
      request(server).get('/auth/me').expect(401));

    it('rejects an invalid token', () =>
      request(server)
        .get('/auth/me')
        .set('Authorization', 'Bearer not-a-valid-token')
        .expect(401));
  });
});

describe('Health', () => {
  it('returns ok status', () =>
    request(server).get('/health').expect(200).expect({ status: 'ok' }));
});
