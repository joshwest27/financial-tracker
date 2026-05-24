import { Router } from 'express';
import * as reportDao from '../daos/report';

const router = Router();

router.get('/monthly', async (req, res) => {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!year || !month || month < 1 || month > 12) {
    return res.status(400).send('year and month (1–12) are required');
  }

  try {
    const report = await reportDao.getMonthlyReport(req.user.id, year, month);
    return res.json(report);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

export default router;
