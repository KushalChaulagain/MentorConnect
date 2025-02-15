'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone, Search, Video } from "lucide-react";
import { useSession } from "next-auth/react";

export default function MessagesPage() {
  const { data: session } = useSession();

  return (
    <div className="h-[calc(100vh-6rem)]">
      <div className="grid grid-cols-12 h-full gap-4">
        {/* Contacts List */}
        <Card className="col-span-4 bg-white dark:bg-gray-800">
          <CardHeader className="p-4 space-y-4">
            <CardTitle className="text-xl">Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {/* Active Chat */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">JS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">John Smith</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Hey, when is our next session?</p>
                  </div>
                  <div className="text-xs text-gray-400">2m</div>
                </div>
              </div>

              {/* Other Chats */}
              {[
                { initials: 'AS', name: 'Alice Smith', message: 'Thanks for the great session!', time: '1h' },
                { initials: 'RJ', name: 'Robert Johnson', message: 'Can we schedule a call?', time: '3h' },
                { initials: 'MD', name: 'Mary Davis', message: 'The last session was very helpful', time: '1d' },
              ].map((chat) => (
                <div key={chat.initials} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{chat.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{chat.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.message}</p>
                    </div>
                    <div className="text-xs text-gray-400">{chat.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 bg-white dark:bg-gray-800">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">JS</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">John Smith</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">React Fundamentals Student</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Phone className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Video className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 h-[calc(100vh-16rem)] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {/* Chat Messages */}
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[70%]">
                  <p className="text-sm text-gray-900 dark:text-white">Hey, when is our next session?</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">2:30 PM</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-indigo-600 rounded-lg p-3 max-w-[70%]">
                  <p className="text-sm text-white">Hi! Let me check my calendar. How about tomorrow at 3 PM?</p>
                  <span className="text-xs text-indigo-200">2:31 PM</span>
                </div>
              </div>
            </div>
            
            {/* Message Input */}
            <div className="border-t pt-4">
              <Input 
                placeholder="Type your message..." 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 