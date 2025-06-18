import mongoose, { Schema, Document } from 'mongoose';
import { Event } from '@/types';

export interface IEvent extends Omit<Event, '_id' | 'author' | 'votes' | 'messages'>, Document {
  votes: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  image: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  authorId: {
    type: String,
    required: true,
    ref: 'User',
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'Vote',
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
  }],
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
EventSchema.index({ city: 1, date: 1 });
EventSchema.index({ category: 1, date: 1 });
EventSchema.index({ authorId: 1 });
EventSchema.index({ date: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema); 