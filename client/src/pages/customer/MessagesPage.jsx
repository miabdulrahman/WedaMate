import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  User,
  Calendar,
  Clock,
  Search,
  ArrowLeft,
  CheckCheck,
  Briefcase,
  MapPin,
  Car,
  Wrench,
  ExternalLink,
  Loader2
} from 'lucide-react';
import messageService from '../../services/messageService.js';
import bookingService from '../../services/bookingService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/FeedbackStates.jsx';

export const MessagesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const targetConvId = conversationId || searchParams.get('conversationId');
  const targetBookingId = searchParams.get('bookingId');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Booking Picker Modal state (chats must be tied to bookings)
  const [selectBookingModalOpen, setSelectBookingModalOpen] = useState(false);
  const [bookingsList, setBookingsList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [openingBookingId, setOpeningBookingId] = useState(null);

  // Mobile navigation state
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const messagesEndRef = useRef(null);

  // Load conversations on mount or query change
  const fetchConversations = async (selectTargetId = null) => {
    try {
      setLoading(true);
      const list = await messageService.getConversations();
      setConversations(list);

      // 1. If targetBookingId was provided in query, fetch/create booking conversation
      if (targetBookingId) {
        try {
          const bookingConv = await messageService.getBookingConversation(targetBookingId);
          if (bookingConv) {
            setActiveConv(bookingConv);
            setMobileShowThread(true);
            setConversations((prev) => {
              if (prev.some((c) => c._id === bookingConv._id)) return prev;
              return [bookingConv, ...prev];
            });
            return;
          }
        } catch (bookingErr) {
          console.error('Failed to load booking conversation:', bookingErr);
        }
      }

      // 2. If targetConvId was provided in route or query
      const targetId = selectTargetId || targetConvId;
      if (targetId) {
        const found = list.find((c) => c._id === targetId);
        if (found) {
          setActiveConv(found);
          setMobileShowThread(true);
        } else if (list.length > 0) {
          setActiveConv(list[0]);
        }
      } else if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [targetConvId, targetBookingId]);

  // Fetch messages when active conversation changes
  const fetchMessages = async () => {
    if (!activeConv) return;
    try {
      const msgs = await messageService.getMessages(activeConv._id);
      setMessages(msgs);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeConv?._id]);

  // Auto-refresh messages every 4 seconds for realtime chat feel
  useEffect(() => {
    if (!activeConv) return;
    const interval = setInterval(() => {
      fetchMessages();
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConv?._id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    const outgoing = text.trim();
    setText('');

    try {
      setSending(true);
      const newMsg = await messageService.sendMessage(activeConv._id, { text: outgoing });
      setMessages((prev) => [...prev, newMsg]);

      // Update last message in local conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id
            ? { ...c, lastMessage: outgoing, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
      setText(outgoing);
    } finally {
      setSending(false);
    }
  };

  // Helper to get the other user in the conversation
  const getOtherParticipant = (conv) => {
    return (
      conv?.participants?.find((p) => p._id !== user?._id && p._id !== user?.id) || {
        name: 'WedaMate User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        role: 'user'
      }
    );
  };

  // Open the "Select Booking" modal to pick who to chat with
  const handleOpenBookingPicker = async () => {
    setSelectBookingModalOpen(true);
    setBookingSearch('');
    try {
      setLoadingBookings(true);
      const res = await bookingService.getBookings({ limit: 50 });
      setBookingsList(res.bookings || []);
    } catch (err) {
      showToast('Failed to load your bookings', 'error');
    } finally {
      setLoadingBookings(false);
    }
  };

  // Select a booking to open or start its conversation
  const handleSelectBookingToChat = async (booking) => {
    try {
      setOpeningBookingId(booking._id);
      const conv = await messageService.getBookingConversation(booking._id);
      setSelectBookingModalOpen(false);

      if (conv) {
        setActiveConv(conv);
        setMobileShowThread(true);
        setConversations((prev) => {
          if (prev.some((c) => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        showToast('Chat opened for booking #' + booking._id.slice(-6), 'success');
      }
    } catch (err) {
      showToast(err.message || 'Could not open conversation for this booking', 'error');
    } finally {
      setOpeningBookingId(null);
    }
  };

  const filteredBookings = bookingsList.filter((b) => {
    const q = bookingSearch.toLowerCase();
    const serviceName = (b.serviceSnapshot?.title || b.service?.title || 'Personal Driver').toLowerCase();
    const otherName = (user?.role === 'customer' ? b.provider?.name : b.customer?.name) || '';
    const idStr = b._id.toLowerCase();
    const city = (b.location?.city || '').toLowerCase();
    return (
      serviceName.includes(q) ||
      otherName.toLowerCase().includes(q) ||
      idStr.includes(q) ||
      city.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages & Job Chat</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate job details and service schedule with your verified booking partners
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Calendar}
          onClick={handleOpenBookingPicker}
          className="shrink-0"
        >
          Select from My Bookings
        </Button>
      </div>

      {/* Main Messaging Layout */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[calc(100vh-14rem)]">
        {/* Conversations Sidebar (Hidden on mobile if viewing thread) */}
        <div
          className={`md:col-span-4 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/50 ${
            mobileShowThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3.5 bg-white border-b border-slate-200/70 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">
              Active Job Chats ({conversations.length})
            </span>
            <button
              type="button"
              onClick={handleOpenBookingPicker}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Pick Booking</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-16 rounded-2xl" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">No chats yet</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Chats are initiated directly from your bookings in the Dashboard or My Bookings.
                </p>
                <Button variant="secondary" size="xs" icon={Calendar} onClick={handleOpenBookingPicker}>
                  Select from Bookings
                </Button>
              </div>
            ) : (
              conversations.map((c) => {
                const other = getOtherParticipant(c);
                const isSelected = activeConv?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setActiveConv(c);
                      setMobileShowThread(true);
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-100/70 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-700' : 'bg-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          other.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
                        }
                        alt={other.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{other.name}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                        {c.lastMessage || 'No messages yet'}
                      </p>

                      {c.booking && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Job #{c.booking?._id?.slice(-5) || c.booking?.toString()?.slice(-5) || 'Booking'}
                          </span>
                          {c.booking?.bookingType === 'driver' ? (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Car className="w-2.5 h-2.5" /> Driver
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate max-w-[120px]">
                              <Wrench className="w-2.5 h-2.5" /> {c.booking?.serviceSnapshot?.title || 'Service'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread Panel (Hidden on mobile if viewing inbox list) */}
        <div
          className={`md:col-span-8 flex flex-col h-full bg-white ${
            !mobileShowThread ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileShowThread(false)}
                    className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={
                        getOtherParticipant(activeConv).avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
                      }
                      alt={getOtherParticipant(activeConv).name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {getOtherParticipant(activeConv).name}
                      </h3>
                      <Badge variant="default" size="xs">
                        {getOtherParticipant(activeConv).role?.toUpperCase() || 'USER'}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active on WedaMate
                    </span>
                  </div>
                </div>

                {activeConv.booking && (
                  <Link
                    to={`/bookings/${activeConv.booking?._id || activeConv.booking}`}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200/80 transition-colors shrink-0"
                    title="View Booking Details"
                  >
                    <span>Job #{activeConv.booking?._id?.slice(-6) || activeConv.booking?.toString()?.slice(-6)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-16">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-slate-600">Start the conversation</p>
                    <p className="mt-0.5">Coordinate timing, tools, requirements, and job specifics.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe =
                      m.sender?._id === user?._id ||
                      m.sender === user?._id ||
                      m.sender?._id === user?.id ||
                      m.sender === user?.id;

                    return (
                      <div
                        key={m._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md rounded-2xl p-3 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-800 text-white rounded-br-xs shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${
                              isMe ? 'text-emerald-200' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type a message or inquiry..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  isLoading={sending}
                  disabled={!text.trim()}
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Select a Booking to Chat</h3>
              <p className="text-slate-500 max-w-sm mb-5 leading-relaxed">
                To keep communications secure and job-focused, all messaging on WedaMate is connected to scheduled bookings. Select one of your bookings to open a chat.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" icon={Calendar} onClick={handleOpenBookingPicker}>
                  Select from My Bookings
                </Button>
                <Link to={user?.role === 'provider' ? '/provider/bookings' : '/bookings'}>
                  <Button variant="outline" size="sm">
                    View All Bookings
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Select Booking to Chat Modal */}
      <Modal
        isOpen={selectBookingModalOpen}
        onClose={() => setSelectBookingModalOpen(false)}
        title="Select a Booking to Chat"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Pick an existing service booking or driving hire to start or continue coordinating with the other party.
          </p>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by job title, partner name, booking #, or city..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Bookings List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
            {loadingBookings ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No matching bookings found</p>
                <p className="mt-1 text-slate-400">
                  Book a service or driver first from the Marketplace or Dashboard to enable job chat.
                </p>
              </div>
            ) : (
              filteredBookings.map((b) => {
                const other = user?.role === 'customer' ? b.provider : b.customer;
                const isDriver = b.bookingType === 'driver';
                const title = isDriver
                  ? `Personal Driver (${b.driverDetails?.vehicleType?.toUpperCase() || 'Car'})`
                  : b.serviceSnapshot?.title || b.service?.title || 'Service Booking';

                return (
                  <div
                    key={b._id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          other?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
                        }
                        alt={other?.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
                          <span className="text-[10px] font-mono text-slate-400">#{b._id.slice(-6)}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {user?.role === 'customer' ? 'Provider: ' : 'Customer: '}
                          <strong className="text-slate-800 font-semibold">{other?.name || 'Local User'}</strong>
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {new Date(b.scheduledDate).toLocaleDateString()} at {b.startTime}
                          </span>
                          <span>•</span>
                          <span className="capitalize font-semibold text-emerald-700">{b.status}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="xs"
                      variant="primary"
                      icon={MessageSquare}
                      onClick={() => handleSelectBookingToChat(b)}
                      isLoading={openingBookingId === b._id}
                      className="shrink-0"
                    >
                      Chat
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <Link
              to={user?.role === 'provider' ? '/provider/bookings' : '/bookings'}
              className="text-xs text-emerald-700 font-bold hover:underline"
              onClick={() => setSelectBookingModalOpen(false)}
            >
              Go to Full Bookings List →
            </Link>
            <Button variant="outline" size="sm" onClick={() => setSelectBookingModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessagesPage;
