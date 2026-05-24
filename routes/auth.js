import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userDao from '../daos/user';
import jwtVerify from '../middleware/jwtVerify';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('email and password are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await userDao.create({ email, password: hashedPassword });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.sendStatus(400);
    }
    return res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('email and password are required');
  }

  const user = await userDao.findByEmail(email);
  if (!user) {
    return res.status(404).send('Not found');
  }

  const isAuthenticated = await bcrypt.compare(password, user.password);
  if (!isAuthenticated) {
    return res.status(401).send('unauthorized');
  }

  const token = jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

  return res.status(200).json({ token });
});

router.get('/me', jwtVerify, async (req, res) => {
  const user = await userDao.findById(req.user.id);
  if (!user) {
    return res.sendStatus(404);
  }
  return res.json({ id: user._id, email: user.email });
});

export default router;
