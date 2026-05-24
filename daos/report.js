import mongoose from 'mongoose';
import Transaction from '../models/transaction';

const monthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
};

export const getMonthlyReport = async (userId, year, month) => {
  const { start, end } = monthRange(year, month);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const matchStage = {
    userId: userObjectId,
    date: { $gte: start, $lt: end },
  };

  const [byCategory, totalsByType] = await Promise.all([
    Transaction.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: '$category.name' },
          type: { $first: '$type' },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          categoryName: 1,
          type: 1,
          total: 1,
        },
      },
      { $sort: { type: 1, total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const totalIncome =
    totalsByType.find((row) => row._id === 'income')?.total ?? 0;
  const totalExpense =
    totalsByType.find((row) => row._id === 'expense')?.total ?? 0;

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory,
  };
};
