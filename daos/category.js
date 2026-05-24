import Category from '../models/category';

export const getAll = (userId) => Category.find({ userId }).lean();

export const getById = (userId, categoryId) =>
  Category.findOne({ _id: categoryId, userId }).lean();

export const create = (categoryData) => Category.create(categoryData);

export const updateById = (userId, categoryId, updates) =>
  Category.findOneAndUpdate({ _id: categoryId, userId }, updates, {
    new: true,
    runValidators: true,
  }).lean();

export const deleteById = (userId, categoryId) =>
  Category.deleteOne({ _id: categoryId, userId });
