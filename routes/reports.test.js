import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import server from '../server';
import Category from '../models/category';
import Transaction from '../models/transaction';

describe('Reports', () => {
  let token;
  let userId;
  let foodCategoryId;
  let salaryCategoryId;

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    await mongoose.connect(process.env.MONGO_URL);

    await request(server)
      .post('/auth/register')
      .send({ email: 'reports@test.com', password: 'testPassword' });

    const login = await request(server)
      .post('/auth/login')
      .send({ email: 'reports@test.com', password: 'testPassword' });

    token = login.body.token;
    userId = jwt.verify(token, process.env.JWT_SECRET).id;

    const food = await Category.create({
      name: 'Food',
      type: 'expense',
      userId,
    });
    const salary = await Category.create({
      name: 'Salary',
      type: 'income',
      userId,
    });
    foodCategoryId = food._id;
    salaryCategoryId = salary._id;

    await Transaction.create([
      {
        amount: 50,
        date: new Date(2026, 4, 10),
        type: 'expense',
        description: 'Groceries',
        userId,
        categoryId: foodCategoryId,
      },
      {
        amount: 30,
        date: new Date(2026, 4, 15),
        type: 'expense',
        description: 'Coffee',
        userId,
        categoryId: foodCategoryId,
      },
      {
        amount: 3000,
        date: new Date(2026, 4, 1),
        type: 'income',
        description: 'Paycheck',
        userId,
        categoryId: salaryCategoryId,
      },
    ]);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /reports/monthly', () => {
    it('returns monthly totals and category breakdown', () =>
      request(server)
        .get('/reports/monthly?year=2026&month=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.year).toBe(2026);
          expect(res.body.month).toBe(5);
          expect(res.body.totalIncome).toBe(3000);
          expect(res.body.totalExpense).toBe(80);
          expect(res.body.balance).toBe(2920);
          expect(res.body.byCategory).toHaveLength(2);

          const food = res.body.byCategory.find(
            (row) => row.categoryName === 'Food',
          );
          expect(food.total).toBe(80);
          expect(food.type).toBe('expense');
        }));

    it('returns zeros when no transactions exist for the month', () =>
      request(server)
        .get('/reports/monthly?year=2020&month=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalIncome).toBe(0);
          expect(res.body.totalExpense).toBe(0);
          expect(res.body.balance).toBe(0);
          expect(res.body.byCategory).toEqual([]);
        }));

    it('requires year and month query params', () =>
      request(server)
        .get('/reports/monthly')
        .set('Authorization', `Bearer ${token}`)
        .expect(400));

    it('requires authentication', () =>
      request(server).get('/reports/monthly?year=2026&month=5').expect(401));
  });
});
