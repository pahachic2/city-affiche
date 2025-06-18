import mongoose, { Schema, Document } from 'mongoose';
import { Event } from '@/types';

export interface IEvent extends Omit<Event, '_id' | 'author' | 'votes' | 'messages'>, Document {
  votes: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  upvotes: number;
  downvotes: number;
  rating: number;
  commentsCount: number;
  viewsCount: number;
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
  // Новые поля для рейтинга
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
EventSchema.index({ city: 1, date: 1 });
EventSchema.index({ category: 1, date: 1 });
EventSchema.index({ authorId: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ rating: -1 }); // Для сортировки по рейтингу
EventSchema.index({ city: 1, rating: -1 }); // Для городской ленты

// Виртуальное поле для общего рейтинга
EventSchema.virtual('totalRating').get(function() {
  return this.upvotes - this.downvotes;
});

// Middleware для автоматического пересчета рейтинга
EventSchema.pre('save', function() {
  this.rating = this.upvotes - this.downvotes;
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema); 