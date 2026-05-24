import { Router } from 'express';
import * as categoryDao from '../daos/category';

const router = Router();

router.get('/', async (req, res) => {
  const categories = await categoryDao.getAll(req.user.id);
  res.json(categories);
});

router.post('/', async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).send('name and type are required');
  }

  try {
    const category = await categoryDao.create({
      name,
      type,
      userId: req.user.id,
    });
    return res.status(201).json(category);
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).send('category already exists');
    }
    return res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res) => {
  const category = await categoryDao.getById(req.user.id, req.params.id);
  if (!category) {
    return res.sendStatus(404);
  }
  return res.json(category);
});

router.patch('/:id', async (req, res) => {
  const category = await categoryDao.updateById(
    req.user.id,
    req.params.id,
    req.body,
  );
  if (!category) {
    return res.sendStatus(404);
  }
  return res.json(category);
});

router.delete('/:id', async (req, res) => {
  const result = await categoryDao.deleteById(req.user.id, req.params.id);
  if (result.deletedCount === 0) {
    return res.sendStatus(404);
  }
  return res.sendStatus(200);
});

export default router;
