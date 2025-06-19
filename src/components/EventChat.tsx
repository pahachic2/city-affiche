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

  // Проверка, является ли сообщение своим
  const isOwnMessage = (message: Message) => {
    return user && message.userId === user._id;
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">💬 Обсуждение</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Заголовок */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h3 className="text-lg font-semibold flex items-center">
          <span className="mr-2">💬</span>
          Обсуждение ({messages.length})
        </h3>
        {!user && (
          <p className="text-blue-100 text-sm mt-1">
            Войдите в аккаунт, чтобы участвовать в обсуждении
          </p>
        )}
      </div>

      {/* Список сообщений */}
      <div className="p-4 space-y-3 bg-gray-50 min-h-[200px]">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-gray-500 text-lg">
              Пока нет сообщений
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Станьте первым, кто начнет обсуждение!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg ${isOwnMessage(message) ? 'mr-4' : 'order-1'}`}>
                {/* Сообщение */}
                <div className={`relative rounded-2xl px-4 py-3 shadow-sm ${
                  isOwnMessage(message) 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                }`}>
                  {/* Имя пользователя (только для чужих сообщений) */}
                  {!isOwnMessage(message) && (
                    <div className="text-xs font-medium text-blue-600 mb-1">
                      {message.username}
                    </div>
                  )}
                  
                  {/* Текст сообщения */}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  
                  {/* Время и кнопка удаления */}
                  <div className={`flex items-center justify-between mt-2 ${
                    isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    
                    {canDeleteMessage(message) && (
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className={`text-xs ml-2 opacity-70 hover:opacity-100 transition-opacity ${
                          isOwnMessage(message) ? 'text-blue-100 hover:text-white' : 'text-red-500 hover:text-red-700'
                        }`}
                        title="Удалить сообщение"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Аватар (только для чужих сообщений) */}
              {!isOwnMessage(message) && (
                <div className="flex-shrink-0 order-2 ml-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-gray-300 text-gray-700">
                    {message.username[0]?.toUpperCase() || '?'}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Элемент для прокрутки */}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки сообщения */}
      {user && (
        <div className="p-4 bg-white border-t border-gray-100">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={sendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Написать сообщение..."
                  className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none bg-gray-50"
                  rows={1}
                  maxLength={500}
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {newMessage.length}/500
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              title="Отправить сообщение"
            >
              {isSending ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 