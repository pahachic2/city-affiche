import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '@/types';

export interface IMessage extends Omit<Message, '_id' | 'sender'>, Document {}

const MessageSchema = new Schema<IMessage>({
  eventId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  text: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Валидация: сообщение должно содержать либо текст, либо изображение
MessageSchema.pre('save', function() {
  if (!this.text && !this.imageUrl) {
    throw new Error('Сообщение должно содержать текст или изображение');
  }
});

// Индексы для оптимизации запросов
MessageSchema.index({ eventId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema); 