import { Router } from 'express';
import * as transactionDao from '../daos/transaction';

const router = Router();

router.get('/', async (req, res) => {
  const transactions = await transactionDao.getAll(req.user.id);
  res.json(transactions);
});

router.post('/', async (req, res) => {
  const { amount, date, type, description, categoryId } = req.body;

  if (amount == null || !date || !type || !categoryId) {
    return res
      .status(400)
      .send('amount, date, type, and categoryId are required');
  }

  try {
    const transaction = await transactionDao.create({
      amount,
      date,
      type,
      description,
      categoryId,
      userId: req.user.id,
    });
    return res.status(201).json(transaction);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  const transaction = await transactionDao.getById(
    req.user.id,
    req.params.id,
  );
  if (!transaction) {
    return res.sendStatus(404);
  }
  return res.json(transaction);
});

router.patch('/:id', async (req, res) => {
  const transaction = await transactionDao.updateById(
    req.user.id,
    req.params.id,
    req.body,
  );
  if (!transaction) {
    return res.sendStatus(404);
  }
  return res.json(transaction);
});

router.delete('/:id', async (req, res) => {
  const result = await transactionDao.deleteById(req.user.id, req.params.id);
  if (result.deletedCount === 0) {
    return res.sendStatus(404);
  }
  return res.sendStatus(200);
});

export default router;
