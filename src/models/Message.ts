import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    maxlength: 50
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500,
    trim: true
  }
}, {
  timestamps: true
});

// Составной индекс для быстрого получения сообщений события
MessageSchema.index({ eventId: 1, createdAt: -1 });

// Индекс для удаления сообщений пользователя
MessageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema); 