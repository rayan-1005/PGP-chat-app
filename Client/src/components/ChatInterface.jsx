import { useState, useEffect } from 'react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import './ChatInterface.css'

function ChatInterface({ onLogout }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSelectUser = (user) => {
    setSelectedUser(user)
  }

  const handleCloseChat = () => {
    setSelectedUser(null)
  }

  return (
    <div className="chat-interface">
      {(!isMobile || !selectedUser) && (
        <ConversationList onSelectUser={handleSelectUser} selectedUser={selectedUser} onLogout={onLogout} />
      )}
      <ChatWindow selectedUser={selectedUser} onClose={handleCloseChat} />
    </div>
  )
}

export default ChatInterface
