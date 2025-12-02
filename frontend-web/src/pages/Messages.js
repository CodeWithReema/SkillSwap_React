import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { matchAPI, messageAPI, userAPI } from '../services/api';

const Messages = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { getCurrentUserId } = useAuth();
  const { clearMessageNotifications } = useNotifications();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    clearMessageNotifications();
  }, [clearMessageNotifications]);

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.matchId);
      
      const interval = setInterval(() => {
        loadMessages(selectedMatch.matchId);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [selectedMatch]);

  const loadMatches = async () => {
    try {
      const userId = getCurrentUserId();
      const allMatches = await matchAPI.getAll();
      const allUsers = await userAPI.getAll();

      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      const enrichedMatches = userMatches.map(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        const otherUserId = user1Id === userId ? user2Id : user1Id;
        const otherUser = allUsers.find(u => u.userId === otherUserId);

        return {
          ...match,
          otherUser,
        };
      });

      setMatches(enrichedMatches);
      if (enrichedMatches.length > 0 && !selectedMatch) {
        setSelectedMatch(enrichedMatches[0]);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const loadMessages = async (matchId) => {
    try {
      const allMessages = await messageAPI.getByMatch(matchId);
      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      await messageAPI.create({
        match: { matchId: selectedMatch.matchId },
        sender: { userId: getCurrentUserId() },
        messageContent: newMessage.trim(),
      });
      setNewMessage('');
      await loadMessages(selectedMatch.matchId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-glass-accent-primary rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse-slow"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-glass-accent-primary relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-glass-accent-primary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-glass-accent-secondary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Split Screen Layout - Completely Different */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-8rem)]">
          {/* Left Sidebar - Vertical Conversation List */}
          <aside className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card h-full flex flex-col"
            >
              <h2 className="text-3xl font-bold text-glass-text-primary mb-6 flex items-center gap-3">
                <span className="text-3xl">💬</span>
                Conversations
              </h2>
              {matches.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-glass-text-secondary text-lg">No conversations yet</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3">
                  {matches.map((match, index) => (
                    <motion.div
                      key={match.matchId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                        selectedMatch?.matchId === match.matchId
                          ? 'bg-glass-bg-light border-2 border-glass-accent-primary shadow-glass-lg shadow-glow-purple'
                          : 'bg-glass-bg-card hover:bg-glass-bg-hover border-2 border-transparent hover:border-glass-border'
                      }`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-semibold text-xl shadow-glass">
                          {match.otherUser?.firstName?.[0]}{match.otherUser?.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-glass-text-primary text-lg truncate">
                            {match.otherUser?.firstName} {match.otherUser?.lastName}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </aside>

          {/* Right Side - Chat Area */}
          <main className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card h-full flex flex-col"
            >
              {selectedMatch ? (
                <>
                  {/* Header with Gradient Background */}
                  <div className="bg-gradient-primary p-6 rounded-t-3xl -mt-8 -mx-8 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold text-xl border-2 border-white/30 shadow-glass-xl">
                        {selectedMatch.otherUser?.firstName?.[0]}{selectedMatch.otherUser?.lastName?.[0]}
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {selectedMatch.otherUser?.firstName} {selectedMatch.otherUser?.lastName}
                      </h3>
                    </div>
                  </div>

                  {/* Messages Area - Chat Bubbles */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-7xl mb-6">💭</div>
                          <p className="text-glass-text-secondary text-xl">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isOwn = (message.sender?.userId || message.sender?.id) === getCurrentUserId();
                        return (
                          <motion.div
                            key={message.messageId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-3xl px-6 py-4 ${
                                isOwn
                                  ? 'bg-gradient-primary text-white shadow-glass-lg'
                                  : 'bg-glass-bg-card text-glass-text-primary border border-glass-border'
                              }`}
                            >
                              <div className="text-base leading-relaxed">{message.messageContent || message.content}</div>
                              <div className={`text-xs mt-2 ${isOwn ? 'text-white/70' : 'text-glass-text-muted'}`}>
                                {new Date(message.timestamp || message.sentAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <input
                      type="text"
                      className="input flex-1"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      autoComplete="off"
                    />
                    <button type="submit" className="btn btn-primary px-8">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-7xl mb-6">💬</div>
                    <p className="text-glass-text-secondary text-xl">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Messages;
