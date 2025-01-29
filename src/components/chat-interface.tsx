'use client';

import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    name: string;
    image: string;
  };
}

interface ChatInterfaceProps {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    image?: string;
  };
}

export function ChatInterface({ bookingId, otherUser }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${bookingId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`booking-${bookingId}`);
    channel.bind('new-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe(`booking-${bookingId}`);
    };
  }, [bookingId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={otherUser.image} />
            <AvatarFallback>
              {otherUser.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[70%] ${
                message.senderId === session?.user?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.image} />
                <AvatarFallback>
                  {message.sender.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 ${
                  message.senderId === session?.user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
} 