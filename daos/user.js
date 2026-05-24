import User from '../models/user';

export const findByEmail = (email) => User.findOne({ email }).lean();

export const create = (userData) => User.create(userData);

export const findById = (id) => User.findById(id).lean();
