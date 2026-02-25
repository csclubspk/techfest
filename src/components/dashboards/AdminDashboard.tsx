import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Event, User } from '../../types'
import { Plus, Edit, Trash2, Users, Calendar, TrendingUp, UserCog } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    location: '',
    eventDate: '',
    eventTime: '',
    maxParticipants: 50,
    rules: [''],
    eligibility: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load events
      const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'))
      const eventsSnapshot = await getDocs(eventsQuery)
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[]
      setEvents(eventsData)

      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const eventData = {
        ...eventForm,
        eventDate: new Date(eventForm.eventDate),
        currentParticipants: editingEvent?.currentParticipants || 0,
        isLive: false,
        updatedAt: new Date(),
      }

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData)
        toast.success('Event updated successfully!')
      } else {
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: new Date(),
        })
        toast.success('Event created successfully!')
      }

      resetForm()
      loadData()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteDoc(doc(db, 'events', eventId))
      toast.success('Event deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      eventDate: event.eventDate.toISOString().split('T')[0],
      eventTime: event.eventTime,
      maxParticipants: event.maxParticipants,
      rules: event.rules || [''],
      eligibility: event.eligibility,
    })
    setShowEventForm(true)
  }

  const resetForm = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      category: 'Technical',
      location: '',
      eventDate: '',
      eventTime: '',
      maxParticipants: 50,
      rules: [''],
      eligibility: '',
    })
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
      })
      toast.success('User role updated successfully!')
      loadData()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const handleAssignEventHead = async (eventId: string, userId: string) => {
    try {
      const user = users.find(u => u.uid === userId)
      if (!user) return

      await updateDoc(doc(db, 'events', eventId), {
        eventHeadId: userId,
        eventHeadName: user.displayName,
      })
      toast.success('Event head assigned successfully!')
      loadData()
    } catch (error) {
      console.error('Error assigning event head:', error)
      toast.error('Failed to assign event head')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteDoc(doc(db, 'users', userId))
      toast.success('User deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600/20 text-red-400 border-red-600/50'
      case 'coordinator':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/50'
      case 'eventHead':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/50'
      default:
        return 'bg-green-600/20 text-green-400 border-green-600/50'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'coordinator':
        return 'Coordinator'
      case 'eventHead':
        return 'Event Head'
      default:
        return 'Participant'
    }
  }

  const totalParticipants = events.reduce((sum, event) => sum + event.currentParticipants, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Full system control and management</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Total Events</div>
                <div className="text-3xl font-bold">{events.length}</div>
              </div>
              <Calendar className="text-blue-400" size={40} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Total Users</div>
                <div className="text-3xl font-bold">{users.length}</div>
              </div>
              <Users className="text-green-400" size={40} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Participants</div>
                <div className="text-3xl font-bold">{totalParticipants}</div>
              </div>
              <TrendingUp className="text-purple-400" size={40} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Live Events</div>
                <div className="text-3xl font-bold">
                  {events.filter(e => e.isLive).length}
                </div>
              </div>
              <TrendingUp className="text-red-400" size={40} />
            </div>
          </div>
        </div>

        {/* Event Management */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Events Management</h2>
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </button>
          </div>

          {showEventForm && (
            <form onSubmit={handleSaveEvent} className="space-y-4 mb-6 p-4 glass-card rounded-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="input-field"
                  >
                    <option>Technical</option>
                    <option>Non-Technical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="input-field min-h-[100px]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="text"
                    value={eventForm.eventTime}
                    onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
                    className="input-field"
                    placeholder="10:00 AM - 2:00 PM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={eventForm.maxParticipants}
                    onChange={(e) => setEventForm({ ...eventForm, maxParticipants: parseInt(e.target.value) })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Eligibility</label>
                <input
                  type="text"
                  value={eventForm.eligibility}
                  onChange={(e) => setEventForm({ ...eventForm, eligibility: e.target.value })}
                  className="input-field"
                  placeholder="Open to all students"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Event</th>
                  <th className="text-center py-3 px-4">Category</th>
                  <th className="text-center py-3 px-4">Participants</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium">{event.title}</td>
                    <td className="py-3 px-4 text-center">{event.category}</td>
                    <td className="py-3 px-4 text-center">
                      {event.currentParticipants}/{event.maxParticipants}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit size={18} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-gray-400 text-sm mt-1">Manage coordinators, event heads, and participants</p>
            </div>
            <button
              onClick={() => setShowUserManagement(!showUserManagement)}
              className="btn-primary flex items-center space-x-2"
            >
              <UserCog size={20} />
              <span>{showUserManagement ? 'Hide' : 'Show'} Users</span>
            </button>
          </div>

          {showUserManagement && (
            <>
              {/* User Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="glass-card p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Total Users</div>
                  <div className="text-2xl font-bold">{users.length}</div>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Coordinators</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {users.filter(u => u.role === 'coordinator').length}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Event Heads</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {users.filter(u => u.role === 'eventHead').length}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Participants</div>
                  <div className="text-2xl font-bold text-green-400">
                    {users.filter(u => u.role === 'participant').length}
                  </div>
                </div>
              </div>

              {/* User Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-center py-3 px-4">Role</th>
                      <th className="text-center py-3 px-4">Change Role</th>
                      <th className="text-center py-3 px-4">Assign Event</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-medium">{user.displayName}</td>
                        <td className="py-3 px-4 text-gray-400">{user.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm border ${getRoleBadge(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.uid, e.target.value)}
                            className="input-field text-sm py-2"
                          >
                            <option value="participant">Participant</option>
                            <option value="eventHead">Event Head</option>
                            <option value="coordinator">Coordinator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {user.role === 'eventHead' && (
                            <select
                              onChange={(e) => handleAssignEventHead(e.target.value, user.uid)}
                              className="input-field text-sm py-2"
                              defaultValue=""
                            >
                              <option value="" disabled>Assign to event...</option>
                              {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                  {event.title}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDeleteUser(user.uid)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={18} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Event Head Assignment by Event */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Event Head Assignments</h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="glass-card p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-400">
                          {event.eventHeadName || 'No event head assigned'}
                        </div>
                      </div>
                      <select
                        value={event.eventHeadId || ''}
                        onChange={(e) => handleAssignEventHead(event.id, e.target.value)}
                        className="input-field text-sm py-2 max-w-xs"
                      >
                        <option value="">Unassigned</option>
                        {users
                          .filter(u => u.role === 'eventHead' || u.role === 'admin')
                          .map(user => (
                            <option key={user.uid} value={user.uid}>
                              {user.displayName} ({getRoleLabel(user.role)})
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
