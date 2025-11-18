import { useState, useEffect } from 'react'
import { getUsers } from '../utils/api'
import './ConversationList.css'

function ConversationList({ onSelectUser, selectedUser, onLogout }) {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    setFilteredUsers(users.filter(u => u.displayName.toLowerCase().includes(term)))
  }

  return (
    <div className="conversation-list">
      <div className="list-header">
        <h2>Chats</h2>
        <button className="logout-btn" onClick={onLogout} title="Logout">↪</button>
      </div>
      
      <input
        type="text"
        placeholder="Search contacts..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <div className="users-container">
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div
              key={user._id}
              className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-avatar">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <p className="user-name">{user.displayName}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-users">No users found</p>
        )}
      </div>
    </div>
  )
}

export default ConversationList
