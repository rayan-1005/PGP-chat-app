import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatInterface from '../components/ChatInterface'
import './ChatPage.css'

function ChatPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="chat-page">
      <ChatInterface onLogout={handleLogout} />
    </div>
  )
}

export default ChatPage
