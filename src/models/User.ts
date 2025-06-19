import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@/types';

export interface IUser extends Omit<User, '_id'>, Document {}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 