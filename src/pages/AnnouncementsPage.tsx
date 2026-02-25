import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Announcement } from '../types'
import { Megaphone, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Real-time listener for announcements
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Announcement[]
      setAnnouncements(announcementsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600/20 text-red-400 border-red-600/50'
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50'
      default:
        return 'bg-blue-600/20 text-blue-400 border-blue-600/50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    return priority === 'high' ? AlertCircle : Megaphone
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Announcements</h1>
          <p className="text-gray-400 text-lg">
            Stay updated with the latest news and updates
          </p>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement, index) => {
              const PriorityIcon = getPriorityIcon(announcement.priority)
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-6 rounded-xl border-l-4 ${getPriorityStyles(announcement.priority)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${getPriorityStyles(announcement.priority)}`}>
                      <PriorityIcon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">{announcement.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs uppercase font-semibold ${getPriorityStyles(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Posted by {announcement.author}</span>
                        <span>{format(announcement.createdAt, 'MMM dd, yyyy • hh:mm a')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-xl text-center">
            <Megaphone className="mx-auto mb-4 text-gray-600" size={48} />
            <h3 className="text-xl font-semibold mb-2">No Announcements Yet</h3>
            <p className="text-gray-400">Check back soon for updates and news!</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AnnouncementsPage
