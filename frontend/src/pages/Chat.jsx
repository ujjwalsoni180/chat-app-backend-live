import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('https://chat-app-backend-live.onrender.com');

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('userInfo'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Join socket room using current user ID
    socket.emit('join_room', currentUser._id);

    // Fetch user list
    const fetchUsers = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        };
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [currentUser, navigate]);

  // Listen for incoming socket messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      if (
        selectedUser &&
        (data.sender === selectedUser._id || data.receiver === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.off('receive_message');
  }, [selectedUser]);

  // Fetch chat history when a user is selected
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/messages/${user._id}`,
        config
      );
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      content: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '90vh', margin: '20px', border: '1px solid #ccc' }}>
      {/* Sidebar - Users List */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h3>Welcome, {currentUser?.name}</h3>
        <button onClick={handleLogout} style={{ marginBottom: '15px', padding: '5px 10px', cursor: 'pointer' }}>
          Logout
        </button>
        <h4>Users</h4>
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => handleSelectUser(u)}
            style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: selectedUser?._id === u._id ? '#e0e0e0' : '#f9f9f9',
              cursor: 'pointer',
              borderRadius: '5px',
            }}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* Main Chat Box */}
      <div style={{ width: '70%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <h3>Chatting with {selectedUser.name}</h3>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
              {messages.map((m, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: m.sender === currentUser._id ? 'right' : 'left',
                    margin: '5px 0',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: m.sender === currentUser._id ? '#007bff' : '#e4e6eb',
                      color: m.sender === currentUser._id ? '#fff' : '#000',
                    }}
                  >
                    {m.content}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto' }}>Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Chat;