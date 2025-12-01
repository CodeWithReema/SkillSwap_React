import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchAPI, messageAPI, userAPI } from '../services/api';
import './Messages.css';

const Messages = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { getCurrentUserId } = useAuth();

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.matchId);
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
        content: newMessage,
      });
      setNewMessage('');
      await loadMessages(selectedMatch.matchId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="messages-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">
        {/* Conversations List */}
        <aside className="conversations-sidebar">
          <h2>Conversations</h2>
          {matches.length === 0 ? (
            <div className="empty-conversations">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="conversations-list">
              {matches.map(match => (
                <div
                  key={match.matchId}
                  className={`conversation-item ${selectedMatch?.matchId === match.matchId ? 'active' : ''}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="conversation-avatar">
                    {match.otherUser?.firstName?.[0]}{match.otherUser?.lastName?.[0]}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">
                      {match.otherUser?.firstName} {match.otherUser?.lastName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Messages Area */}
        <main className="messages-main">
          {selectedMatch ? (
            <>
              <div className="messages-header">
                <h3>
                  {selectedMatch.otherUser?.firstName} {selectedMatch.otherUser?.lastName}
                </h3>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map(message => {
                    const isOwn = (message.sender?.userId || message.sender?.id) === getCurrentUserId();
                    return (
                      <div key={message.messageId} className={`message ${isOwn ? 'own' : 'other'}`}>
                        <div className="message-content">{message.content}</div>
                        <div className="message-time">
                          {new Date(message.timestamp || message.sentAt).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={sendMessage} className="message-input-form">
                <input
                  type="text"
                  className="input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-primary">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;

