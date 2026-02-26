import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Event, User, Announcement, Department } from '../../types'
import { Plus, Edit, Trash2, Users, Calendar, TrendingUp, UserCog, Megaphone, Upload, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { uploadImage } from '../../utils/imageUpload'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    department: 'General' as Department,
    location: '',
    eventDate: '',
    eventTime: '',
    banner: '',
    maxParticipants: 50,
    rules: [''],
    eligibility: '',
  })
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
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

      // Load announcements
      const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
      const announcementsSnapshot = await getDocs(announcementsQuery)
      const announcementsData = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Announcement[]
      setAnnouncements(announcementsData)
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
      department: event.department || 'General',
      location: event.location,
      eventDate: event.eventDate.toISOString().split('T')[0],
      eventTime: event.eventTime,
      banner: event.banner || '',
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
      department: 'General',
      location: '',
      eventDate: '',
      eventTime: '',
      banner: '',
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

  const handleUpdateUserDepartment = async (userId: string, newDepartment: Department) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        department: newDepartment,
      })
      toast.success('User department updated successfully!')
      loadData()
    } catch (error) {
      console.error('Error updating user department:', error)
      toast.error('Failed to update user department')
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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingAnnouncement) {
        // Update existing announcement
        await updateDoc(doc(db, 'announcements', editingAnnouncement.id), {
          title: announcementForm.title,
          content: announcementForm.content,
          priority: announcementForm.priority,
        })
        toast.success('Announcement updated successfully!')
      } else {
        // Create new announcement
        await addDoc(collection(db, 'announcements'), {
          title: announcementForm.title,
          content: announcementForm.content,
          author: user.displayName || 'Admin',
          authorId: user.uid,
          priority: announcementForm.priority,
          createdAt: Timestamp.now(),
        })
        toast.success('Announcement posted successfully!')
      }

      setAnnouncementForm({ title: '', content: '', priority: 'medium' })
      setShowAnnouncementForm(false)
      setEditingAnnouncement(null)
      loadData()
    } catch (error) {
      console.error('Error with announcement:', error)
      toast.error('Failed to process announcement')
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
    })
    setShowAnnouncementForm(true)
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      await deleteDoc(doc(db, 'announcements', announcementId))
      toast.success('Announcement deleted successfully!')
      loadData()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    }
  }

  const handleExportParticipants = async () => {
    try {
      // Get all registrations
      const registrationsSnapshot = await getDocs(collection(db, 'registrations'))
      const registrations = registrationsSnapshot.docs.map(doc => doc.data())

      // Create CSV content
      const csvHeaders = ['Name', 'Email', 'Event', 'Registration Date', 'Attended', 'Event Date', 'Event Time', 'Location']
      const csvRows = await Promise.all(
        registrations.map(async (reg: any) => {
          // Get event details
          const eventDoc = await getDocs(query(collection(db, 'events')))
          const event = eventDoc.docs.find(e => e.id === reg.eventId)?.data()
          
          return [
            reg.userName || '',
            reg.userEmail || '',
            reg.eventTitle || '',
            reg.registeredAt?.toDate?.()?.toLocaleDateString() || '',
            reg.attended ? 'Yes' : 'No',
            event?.eventDate?.toDate?.()?.toLocaleDateString() || '',
            event?.eventTime || '',
            event?.location || ''
          ].join(',')
        })
      )

      const csvContent = [csvHeaders.join(','), ...csvRows].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `techfest-participants-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Participants data exported successfully!')
    } catch (error) {
      console.error('Error exporting participants:', error)
      toast.error('Failed to export participants data')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const imageUrl = await uploadImage(file, 'events')
      setEventForm({ ...eventForm, banner: imageUrl })
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
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

        {/* Announcements */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Megaphone size={24} className="text-blue-400" />
              <span>Announcements</span>
            </h2>
            <button
              onClick={() => {
                setShowAnnouncementForm(!showAnnouncementForm)
                if (editingAnnouncement) {
                  setEditingAnnouncement(null)
                  setAnnouncementForm({ title: '', content: '', priority: 'medium' })
                }
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>New Announcement</span>
            </button>
          </div>

          {showAnnouncementForm && (
            <form onSubmit={handleCreateAnnouncement} className="space-y-4 mb-6 p-4 glass-card rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="input-field"
                  placeholder="Announcement title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="input-field min-h-[120px]"
                  placeholder="Announcement content..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="input-field"
                  aria-label="Announcement priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementForm(false)
                    setEditingAnnouncement(null)
                    setAnnouncementForm({ title: '', content: '', priority: 'medium' })
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Announcements List */}
          {announcements.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold text-lg mb-4">All Announcements</h3>
              {announcements.map((announcement) => (
                <div key={announcement.id} className="glass-card p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          announcement.priority === 'high' ? 'bg-red-600/20 text-red-400' :
                          announcement.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{announcement.content}</p>
                      <p className="text-xs text-gray-500">
                        By {announcement.author} • {announcement.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit announcement"
                      >
                        <Edit size={18} className="text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Delete announcement"
                      >
                        <Trash2 size={18} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    aria-label="Event category"
                  >
                    <option>Technical</option>
                    <option>Non-Technical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={eventForm.department}
                  onChange={(e) => setEventForm({ ...eventForm, department: e.target.value as Department })}
                  className="input-field"
                  required
                >
                  <option value="General">General (All Departments)</option>
                  <option value="IT">Information Technology (IT)</option>
                  <option value="CS">Computer Science (CS)</option>
                  <option value="DS">Data Science (DS)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the department this event belongs to
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="input-field min-h-[100px]"
                  aria-label="Event description"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Event Banner Image</label>
                
                {/* File Upload Option */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="text-blue-400 mb-2" size={40} />
                    <span className="text-sm text-gray-400 mb-2">
                      {uploadingImage ? 'Uploading...' : 'Click to upload image from computer'}
                    </span>
                    <span className="text-xs text-gray-500">Max 5MB • JPEG, PNG, GIF, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>

                {/* URL Input Option */}
                <div>
                  <input
                    type="url"
                    value={eventForm.banner}
                    onChange={(e) => setEventForm({ ...eventForm, banner: e.target.value })}
                    className="input-field"
                    placeholder="Or paste image URL (https://example.com/image.jpg)"
                  />
                  <p className="text-sm text-gray-500 mt-1">You can upload a file or paste a URL</p>
                </div>

                {/* Image Preview */}
                {eventForm.banner && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Preview</label>
                    <img
                      src={eventForm.banner}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x200?text=Invalid+Image'
                      }}
                    />
                  </div>
                )}
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
                    placeholder="e.g., 10:00 AM - 2:00 PM"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 10:00 AM - 2:00 PM</p>
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
                          aria-label="Edit event"
                        >
                          <Edit size={18} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Delete event"
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
            <div className="flex space-x-3">
              <button
                onClick={handleExportParticipants}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Export Participants</span>
              </button>
              <button
                onClick={() => setShowUserManagement(!showUserManagement)}
                className="btn-primary flex items-center space-x-2"
              >
                <UserCog size={20} />
                <span>{showUserManagement ? 'Hide' : 'Show'} Users</span>
              </button>
            </div>
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

              {/* Staff Management (Coordinators & Event Heads) */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <UserCog size={20} className="mr-2 text-purple-400" />
                  Staff Members
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-center py-3 px-4">Role</th>
                        <th className="text-center py-3 px-4">Department</th>
                        <th className="text-center py-3 px-4">Change Role</th>
                        <th className="text-center py-3 px-4">Assign Event</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'coordinator' || u.role === 'eventHead' || u.role === 'admin').map((user) => (
                        <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-medium">{user.displayName}</td>
                          <td className="py-3 px-4 text-gray-400">{user.email}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-sm border ${getRoleBadge(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {(user.role === 'coordinator' || user.role === 'eventHead') && (
                              <select
                                value={user.department || 'General'}
                                onChange={(e) => handleUpdateUserDepartment(user.uid, e.target.value as Department)}
                                className="input-field text-sm py-2"
                                aria-label={`Department for ${user.displayName}`}
                              >
                                <option value="General">General</option>
                                <option value="IT">IT</option>
                                <option value="CS">CS</option>
                                <option value="DS">DS</option>
                              </select>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.uid, e.target.value)}
                              className="input-field text-sm py-2"
                              aria-label={`Role for ${user.displayName}`}
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
                                {events
                                  .filter(event => event.department === user.department || event.department === 'General')
                                  .map((event) => (
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
              </div>

              {/* Participants Management */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Users size={20} className="mr-2 text-green-400" />
                  Participants
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-center py-3 px-4">Registered</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'participant').map((user) => (
                        <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-medium">{user.displayName}</td>
                          <td className="py-3 px-4 text-gray-400">{user.email}</td>
                          <td className="py-3 px-4 text-center text-gray-400 text-sm">
                            {user.createdAt.toLocaleDateString()}
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
                        aria-label={`Assign event head for ${event.title}`}
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
