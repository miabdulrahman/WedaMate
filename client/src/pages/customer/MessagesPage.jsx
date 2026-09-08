import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Calendar, Clock } from 'lucide-react';
import messageService from '../../services/messageService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/FeedbackStates.jsx';

export const MessagesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const list = await messageService.getConversations();
        setConversations(list);
        if (list.length > 0) {
          setActiveConv(list[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConv) return;
      try {
        const msgs = await messageService.getMessages(activeConv._id);
        setMessages(msgs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    try {
      setSending(true);
      const newMsg = await messageService.sendMessage(activeConv._id, { text });
      setMessages((prev) => [...prev, newMsg]);
      setText('');
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv?.participants?.find((p) => p._id !== user?._id) || { name: 'User' };
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages & Chat</h1>
        <p className="text-xs text-slate-500 mt-0.5">Communicate directly regarding active bookings and quotations</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        {/* Conversations Sidebar */}
        <div className="md:col-span-4 border-r border-slate-200/80 divide-y divide-slate-100 overflow-y-auto max-h-[550px]">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200/70 font-bold text-xs text-slate-700">
            Inbox ({conversations.length})
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations found. Chats start automatically when a booking is created.
            </div>
          ) : (
            conversations.map((c) => {
              const other = getOtherParticipant(c);
              const isSelected = activeConv?._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => setActiveConv(c)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/60' : ''
                  }`}
                >
                  <img
                    src={other.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={other.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{other.name}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Thread Panel */}
        <div className="md:col-span-8 flex flex-col h-[550px]">
          {activeConv ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getOtherParticipant(activeConv).avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={getOtherParticipant(activeConv).name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {getOtherParticipant(activeConv).name}
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
                  </div>
                </div>

                {activeConv.booking && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Booking #{activeConv.booking?._id?.slice(-6) || activeConv.booking?.toString()?.slice(-6)}
                  </span>
                )}
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-12">
                    Send a message to start communicating with your service provider.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-sm rounded-2xl p-3 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p>{m.text}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isMe ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="submit" variant="secondary" size="sm" icon={Send} isLoading={sending}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              <span>Select a conversation to begin chatting</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
