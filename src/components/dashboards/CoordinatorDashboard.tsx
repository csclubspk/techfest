import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Event, Announcement } from '../../types'
import { Calendar, Users, Megaphone, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const CoordinatorDashboard = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'medium' as const })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load events
      const eventsQuery = query(collection(db, 'events'), orderBy('eventDate', 'asc'))
      const eventsSnapshot = await getDocs(eventsQuery)
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[]
      setEvents(eventsData)

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
          <h1 className="text-4xl font-bold mb-2">Coordinator Dashboard</h1>
          <p className="text-gray-400">Manage events and announcements</p>
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
          <h2 className="text-2xl font-bold mb-6">Events Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Event</th>
                  <th className="text-center py-3 px-4">Participants</th>
                  <th className="text-center py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Event Head</th>
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
