import request from 'supertest';
import mongoose from 'mongoose';
import server from '../server';

describe('Transactions', () => {
  let token;
  let otherToken;
  let categoryId;
  let transactionId;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    await mongoose.connect(process.env.MONGO_URL);

    await request(server)
      .post('/auth/register')
      .send({ email: 'transactions@test.com', password: 'testPassword' });

    const login = await request(server)
      .post('/auth/login')
      .send({ email: 'transactions@test.com', password: 'testPassword' });

    token = login.body.token;

    await request(server)
      .post('/auth/register')
      .send({ email: 'other-transactions@test.com', password: 'testPassword' });

    const otherLogin = await request(server)
      .post('/auth/login')
      .send({ email: 'other-transactions@test.com', password: 'testPassword' });

    otherToken = otherLogin.body.token;

    const category = await request(server)
      .post('/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Food', type: 'expense' });

    categoryId = category.body._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('requires authentication', () =>
    request(server).get('/transactions').expect(401));

  describe('POST /transactions', () => {
    it('creates a transaction', () =>
      request(server)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 42.5,
          date: '2026-05-10',
          type: 'expense',
          categoryId,
          description: 'Lunch',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.amount).toBe(42.5);
          expect(res.body.description).toBe('Lunch');
          transactionId = res.body._id;
        }));

    it('requires amount, date, type, and categoryId', () =>
      request(server)
        .post('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 10, type: 'expense' })
        .expect(400));
  });

  describe('GET /transactions', () => {
    it('lists transactions for the logged-in user', () =>
      request(server)
        .get('/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].amount).toBe(42.5);
        }));
  });

  describe('GET /transactions/:id', () => {
    it('returns a transaction by id', () =>
      request(server)
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(transactionId);
        }));

    it('returns 404 for another user transaction', () =>
      request(server)
        .get(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404));

    it('returns 404 for a missing transaction', () =>
      request(server)
        .get(`/transactions/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404));
  });

  describe('PATCH /transactions/:id', () => {
    it('updates a transaction', () =>
      request(server)
        .patch(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 55, description: 'Updated lunch' })
        .expect(200)
        .expect((res) => {
          expect(res.body.amount).toBe(55);
          expect(res.body.description).toBe('Updated lunch');
        }));

    it('returns 404 when updating a missing transaction', () =>
      request(server)
        .patch(`/transactions/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 99 })
        .expect(404));
  });

  describe('DELETE /transactions/:id', () => {
    it('returns 404 when deleting a missing transaction', () =>
      request(server)
        .delete(`/transactions/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404));

    it('deletes a transaction', () =>
      request(server)
        .delete(`/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });
});
