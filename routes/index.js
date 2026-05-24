import { Router } from 'express';
import authRoutes from './auth';
import categoryRoutes from './categories';
import transactionRoutes from './transactions';
import reportRoutes from './reports';
import jwtVerify from '../middleware/jwtVerify';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', jwtVerify, categoryRoutes);
router.use('/transactions', jwtVerify, transactionRoutes);
router.use('/reports', jwtVerify, reportRoutes);

export default router;
