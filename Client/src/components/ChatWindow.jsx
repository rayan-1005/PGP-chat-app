import { useState, useEffect } from 'react'
import { getMessages, sendMessage } from '../utils/api'
import MessageInput from './MessageInput'
import './ChatWindow.css'

function ChatWindow({ selectedUser, onClose }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const currentUser = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (selectedUser) {
      fetchMessages()
      const interval = setInterval(fetchMessages, 2000)
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  const fetchMessages = async () => {
    if (!selectedUser) return
    try {
      const data = await getMessages(selectedUser._id)
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const handleSendMessage = async (content) => {
    if (!selectedUser) return

    try {
      const message = await sendMessage(selectedUser._id, content)
      setMessages([...messages, message])
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <p>Select a contact to start chatting</p>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="back-btn" onClick={onClose}>←</button>
        <div className="header-user">
          <div className="avatar">{selectedUser.displayName.charAt(0).toUpperCase()}</div>
          <div>
            <p className="header-name">{selectedUser.displayName}</p>
            <p className="header-email">{selectedUser.email}</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-wrapper ${msg.fromUserId === currentUser._id ? 'sent' : 'received'}`}>
            <div className={`message-bubble ${msg.fromUserId === currentUser._id ? 'sent' : 'received'}`}>
              <p className="message-text">{msg.ciphertext || msg.message}</p>
              <span className="message-time">{new Date(msg.ts).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}

export default ChatWindow
