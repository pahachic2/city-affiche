'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '@/types';

interface EventChatProps {
  eventId: string;
  isOrganizer: boolean;
}

export default function EventChat({ eventId, isOrganizer }: EventChatProps) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Функция загрузки сообщений
  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const response = await fetch(`/api/events/${eventId}/messages?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setLastFetchTime(Date.now());
        setError(null);
      } else {
        throw new Error('Ошибка загрузки сообщений');
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      setError('Не удалось загрузить сообщения');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Функция отправки сообщения
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      setError('Необходимо авторизоваться для отправки сообщений');
      return;
    }

    const content = newMessage.trim();
    if (!content) return;

    if (content.length > 500) {
      setError('Сообщение не должно превышать 500 символов');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        
        // Прокручиваем к новому сообщению
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка отправки сообщения');
      }
    } catch (error) {
      setError('Произошла ошибка при отправке сообщения');
    } finally {
      setIsSending(false);
    }
  };

  // Функция удаления сообщения
  const deleteMessage = async (messageId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/events/${eventId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка удаления сообщения');
      }
    } catch (error) {
      setError('Произошла ошибка при удалении сообщения');
    }
  };

  // Проверка прав на удаление сообщения
  const canDeleteMessage = (message: Message) => {
    if (!user) return false;
    return message.userId === user._id || isOrganizer;
  };

  // Форматирование времени
  const formatMessageTime = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    
    return messageDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Эффект для начальной загрузки и настройки автообновления
  useEffect(() => {
    fetchMessages(true);

    // Настраиваем автообновление каждые 10 секунд
    intervalRef.current = setInterval(() => {
      fetchMessages(false);
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [eventId]);

  // Эффект для прокрутки к последнему сообщению при загрузке
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages.length, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Обсуждение</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Заголовок */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Обсуждение ({messages.length})
        </h3>
        {!user && (
          <p className="text-sm text-gray-500 mt-1">
            Войдите в аккаунт, чтобы участвовать в обсуждении
          </p>
        )}
      </div>

      {/* Список сообщений */}
      <div className="p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Пока нет сообщений. Станьте первым, кто начнет обсуждение!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className="flex space-x-3">
              {/* Аватар */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {message.username[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>
              
              {/* Содержимое сообщения */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    {message.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatMessageTime(message.createdAt)}
                  </p>
                  
                  {/* Кнопка удаления */}
                  {canDeleteMessage(message) && (
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="text-xs text-red-500 hover:text-red-700 ml-auto"
                      title="Удалить сообщение"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* Элемент для прокрутки */}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      {user && (
        <div className="p-4 sm:p-6 border-t border-gray-200">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={sendMessage} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Написать сообщение..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 resize-none"
                rows={2}
                maxLength={500}
                disabled={isSending}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {newMessage.length}/500
                </span>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                >
                  {isSending ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 