import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Event, Announcement, User } from '../../types'
import { Calendar, Users, Megaphone, TrendingUp, Plus, Edit, Trash2, Upload } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { uploadImage } from '../../utils/imageUpload'

const CoordinatorDashboard = () => {
  const { user } = useAuth()
  const [currentUserData, setCurrentUserData] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'medium' as const })
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    location: '',
    eventDate: '',
    eventTime: '',
    banner: '',
    maxParticipants: 50,
    rules: [''],
    eligibility: '',
  })

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      // Load current user data
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        const userData = {
          uid: userDocSnap.id,
          ...userDocSnap.data(),
          createdAt: userDocSnap.data().createdAt?.toDate(),
        } as User
        setCurrentUserData(userData)

        // Load events for coordinator's department
        const eventsQuery = query(collection(db, 'events'), orderBy('eventDate', 'asc'))
        const eventsSnapshot = await getDocs(eventsQuery)
        const eventsData = eventsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            eventDate: doc.data().eventDate?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Event[]
        
        // Filter events by department
        const filteredEvents = eventsData.filter(
          event => event.department === userData.department || event.department === 'General'
        )
        setEvents(filteredEvents)
      } else {
        toast.error('User data not found. Please contact admin.')
      }

      // Load all users
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as User[]
      setAllUsers(usersData)

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
      toast.error('Failed to load dashboard data')
    }
  }

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnnouncement,
        author: user.displayName,
        authorId: user.uid,
        createdAt: new Date(),
      })
      toast.success('Announcement posted successfully!')
      setNewAnnouncement({ title: '', content: '', priority: 'medium' })
      setShowAnnouncementForm(false)
      loadData()
    } catch (error) {
      console.error('Error posting announcement:', error)
      toast.error('Failed to post announcement')
    }
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserData?.department) {
      toast.error('Department not assigned. Please contact admin.')
      return
    }

    try {
      const eventData = {
        ...eventForm,
        department: currentUserData.department,
        coordinatorId: user?.uid,
        coordinatorName: user?.displayName,
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

      resetEventForm()
      loadData()
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error('Failed to save event')
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
      banner: event.banner || '',
      maxParticipants: event.maxParticipants,
      rules: event.rules || [''],
      eligibility: event.eligibility,
    })
    setShowEventForm(true)
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

  const handleAssignEventHead = async (eventId: string, userId: string) => {
    try {
      const selectedUser = allUsers.find(u => u.uid === userId)
      if (!selectedUser) return

      await updateDoc(doc(db, 'events', eventId), {
        eventHeadId: userId,
        eventHeadName: selectedUser.displayName,
      })
      toast.success('Event head assigned successfully!')
      loadData()
    } catch (error) {
      console.error('Error assigning event head:', error)
      toast.error('Failed to assign event head')
    }
  }

  const resetEventForm = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      category: 'Technical',
      location: '',
      eventDate: '',
      eventTime: '',
      banner: '',
      maxParticipants: 50,
      rules: [''],
      eligibility: '',
    })
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

  const totalParticipants = events.reduce((sum, event) => sum + event.currentParticipants, 0)

  if (!currentUserData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 rounded-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentUserData.department) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Department Not Assigned</h2>
          <p className="text-gray-400 mb-2">
            Your account does not have a department assigned yet.
          </p>
          <p className="text-gray-400">
            Please contact an administrator to assign you to a department (IT, CS, or DS).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Coordinator Dashboard</h1>
          <p className="text-gray-400">
            Managing {currentUserData.department} Department Events
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Department Events</div>
                <div className="text-3xl font-bold">{events.length}</div>
              </div>
              <Calendar className="text-blue-400" size={40} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Total Participants</div>
                <div className="text-3xl font-bold">{totalParticipants}</div>
              </div>
              <Users className="text-green-400" size={40} />
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

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Announcements</div>
                <div className="text-3xl font-bold">{announcements.length}</div>
              </div>
              <Megaphone className="text-purple-400" size={40} />
            </div>
          </div>
        </div>

        {/* Post Announcement */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Announcements</h2>
            <button
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="btn-primary"
            >
              {showAnnouncementForm ? 'Cancel' : 'New Announcement'}
            </button>
          </div>

          {showAnnouncementForm && (
            <form onSubmit={handlePostAnnouncement} className="space-y-4 mb-6 p-4 glass-card rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="input-field min-h-[100px]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">Post Announcement</button>
            </form>
          )}

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="glass-card p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <p className="text-gray-400 mt-1">{announcement.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      By {announcement.author} • {announcement.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    announcement.priority === 'high' ? 'bg-red-600/20 text-red-400' :
                    announcement.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-blue-600/20 text-blue-400'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Overview */}
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

              <div className="space-y-3">
                <label className="block text-sm font-medium">Event Banner</label>
                
                {/* File Upload Option */}
                <div>
                  <label className="block">
                    <div className="btn-secondary inline-flex items-center space-x-2 cursor-pointer">
                      <Upload size={18} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Image (Max 5MB)'}</span>
                    </div>
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
                <button type="button" onClick={resetEventForm} className="btn-secondary">
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
                  <th className="text-center py-3 px-4">Participants</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Event Head</th>
                  <th className="text-center py-3 px-4">Assign Head</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-medium">{event.title}</td>
                    <td className="py-3 px-4 text-center">
                      {event.currentParticipants}/{event.maxParticipants}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {event.isLive ? (
                        <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm">
                          Live
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{event.eventHeadName || 'Not assigned'}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={event.eventHeadId || ''}
                        onChange={(e) => handleAssignEventHead(event.id, e.target.value)}
                        className="input-field text-sm py-2"
                      >
                        <option value="">Unassigned</option>
                        {allUsers
                          .filter(u => (u.role === 'eventHead' || u.role === 'admin') && u.department === currentUserData.department)
                          .map(user => (
                            <option key={user.uid} value={user.uid}>
                              {user.displayName}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit event"
                        >
                          <Edit size={18} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Delete event"
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
      </motion.div>
    </div>
  )
}

export default CoordinatorDashboard
