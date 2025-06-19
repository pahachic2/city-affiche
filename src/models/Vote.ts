import mongoose, { Schema, Document } from 'mongoose';
import { Vote } from '@/types';

export interface IVote extends Omit<Vote, '_id'>, Document {}

const VoteSchema = new Schema<IVote>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  eventId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  value: {
    type: Number,
    required: true,
    enum: [-1, 1], // только +1 или -1
  },
}, {
  timestamps: true,
});

// Составной уникальный индекс - пользователь может голосовать только один раз за мероприятие
VoteSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema); 