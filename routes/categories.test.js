import request from 'supertest';
import mongoose from 'mongoose';
import server from '../server';

describe('Categories', () => {
  let token;
  let otherToken;
  let categoryId;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    await mongoose.connect(process.env.MONGO_URL);

    await request(server)
      .post('/auth/register')
      .send({ email: 'categories@test.com', password: 'testPassword' });

    const login = await request(server)
      .post('/auth/login')
      .send({ email: 'categories@test.com', password: 'testPassword' });

    token = login.body.token;

    await request(server)
      .post('/auth/register')
      .send({ email: 'other-categories@test.com', password: 'testPassword' });

    const otherLogin = await request(server)
      .post('/auth/login')
      .send({ email: 'other-categories@test.com', password: 'testPassword' });

    otherToken = otherLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('requires authentication', () =>
    request(server).get('/categories').expect(401));

  describe('POST /categories', () => {
    it('creates a category', () =>
      request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Food', type: 'expense' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Food');
          expect(res.body.type).toBe('expense');
          categoryId = res.body._id;
        }));

    it('requires name and type', () =>
      request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Rent' })
        .expect(400));

    it('rejects duplicate category names for the same user', () =>
      request(server)
        .post('/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Food', type: 'expense' })
        .expect(400));
  });

  describe('GET /categories', () => {
    it('lists categories for the logged-in user', () =>
      request(server)
        .get('/categories')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('Food');
        }));
  });

  describe('GET /categories/:id', () => {
    it('returns a category by id', () =>
      request(server)
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(categoryId);
        }));

    it('returns 404 for another user category', () =>
      request(server)
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404));

    it('returns 404 for a missing category', () =>
      request(server)
        .get(`/categories/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404));
  });

  describe('PATCH /categories/:id', () => {
    it('updates a category', () =>
      request(server)
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Groceries' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Groceries');
        }));

    it('returns 404 when updating a missing category', () =>
      request(server)
        .patch(`/categories/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Missing' })
        .expect(404));
  });

  describe('DELETE /categories/:id', () => {
    it('returns 404 when deleting a missing category', () =>
      request(server)
        .delete(`/categories/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404));

    it('deletes a category', () =>
      request(server)
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200));
  });
});
