import Transaction from '../models/transaction';

export const getAll = (userId) =>
  Transaction.find({ userId }).sort({ date: -1 }).lean();

export const getById = (userId, transactionId) =>
  Transaction.findOne({ _id: transactionId, userId }).lean();

export const create = (transactionData) => Transaction.create(transactionData);

export const updateById = (userId, transactionId, updates) =>
  Transaction.findOneAndUpdate({ _id: transactionId, userId }, updates, {
    new: true,
    runValidators: true,
  }).lean();

export const deleteById = (userId, transactionId) =>
  Transaction.deleteOne({ _id: transactionId, userId });
