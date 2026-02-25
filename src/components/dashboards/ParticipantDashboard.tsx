import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Registration, Event } from '../../types'
import { Calendar, Trophy, Download, MapPin, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { generateCertificate } from '../../utils/certificateGenerator'
import toast from 'react-hot-toast'

interface RegistrationWithEvent extends Registration {
  event?: Event
}

const ParticipantDashboard = () => {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<RegistrationWithEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null)

  useEffect(() => {
    loadRegistrations()
  }, [user])

  const loadRegistrations = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'registrations'),
        where('userId', '==', user.uid)
      )
      const snapshot = await getDocs(q)
      const regs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt?.toDate(),
      })) as RegistrationWithEvent[]

      // Fetch event details for each registration
      const regsWithEvents = await Promise.all(
        regs.map(async (reg) => {
          try {
            const eventDoc = await getDoc(doc(db, 'events', reg.eventId))
            if (eventDoc.exists()) {
              const eventData = {
                id: eventDoc.id,
                ...eventDoc.data(),
                eventDate: eventDoc.data().eventDate?.toDate(),
                createdAt: eventDoc.data().createdAt?.toDate(),
                updatedAt: eventDoc.data().updatedAt?.toDate(),
              } as Event
              return { ...reg, event: eventData }
            }
          } catch (error) {
            console.error('Error fetching event:', error)
          }
          return reg
        })
      )

      // Sort by registeredAt descending (most recent first)
      regsWithEvents.sort((a, b) => {
        if (!a.registeredAt || !b.registeredAt) return 0
        return b.registeredAt.getTime() - a.registeredAt.getTime()
      })

      setRegistrations(regsWithEvents)
    } catch (error) {
      console.error('Error loading registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCertificate = async (reg: RegistrationWithEvent) => {
    if (!reg.attended || !reg.event || !user) {
      toast.error('Certificate not available. Event attendance required.')
      return
    }

    setDownloadingCert(reg.id)
    try {
      await generateCertificate({
        userName: user.displayName || 'Participant',
        eventTitle: reg.eventTitle,
        eventDate: reg.event.eventDate,
        verificationId: reg.id,
      })
      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      console.error('Error generating certificate:', error)
      toast.error('Failed to generate certificate')
    } finally {
      setDownloadingCert(null)
    }
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
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.displayName}!</h1>
          <p className="text-gray-400">Manage your event registrations and certificates</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Registered Events</div>
                <div className="text-3xl font-bold">{registrations.length}</div>
              </div>
              <Calendar className="text-blue-400" size={40} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Attended</div>
                <div className="text-3xl font-bold">
                  {registrations.filter(r => r.attended).length}
                </div>
              </div>
              <Trophy className="text-green-400" size={40} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 mb-1">Certificates</div>
                <div className="text-3xl font-bold">
                  {registrations.filter(r => r.certificateId).length}
                </div>
              </div>
              <Download className="text-purple-400" size={40} />
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">My Registered Events</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : registrations.length > 0 ? (
            <div className="grid gap-6">
              {registrations.map((reg) => (
                <motion.div
                  key={reg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-xl mb-1">{reg.eventTitle}</h3>
                          <p className="text-sm text-gray-400">
                            Registered on {format(reg.registeredAt, 'MMM dd, yyyy - hh:mm a')}
                          </p>
                        </div>
                        {reg.attended && (
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                            ✓ Attended
                          </span>
                        )}
                      </div>

                      {reg.event && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center text-gray-400">
                            <Calendar size={16} className="mr-2 text-blue-400" />
                            <span>{format(reg.event.eventDate, 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Clock size={16} className="mr-2 text-purple-400" />
                            <span>{reg.event.eventTime}</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <MapPin size={16} className="mr-2 text-green-400" />
                            <span>{reg.event.location}</span>
                          </div>
                        </div>
                      )}

                      {reg.event?.banner && (
                        <div className="mt-4">
                          <img
                            src={reg.event.banner}
                            alt={reg.eventTitle}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 lg:ml-4">
                      {reg.attended ? (
                        <button
                          onClick={() => handleDownloadCertificate(reg)}
                          disabled={downloadingCert === reg.id}
                          className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
                        >
                          <Download size={18} />
                          <span>
                            {downloadingCert === reg.id ? 'Generating...' : 'Download Certificate'}
                          </span>
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm text-center">
                          <p className="font-semibold">Pending</p>
                          <p className="text-xs mt-1">Attendance not marked yet</p>
                        </div>
                      )}
                      
                      {reg.event?.isLive && (
                        <div className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm text-center font-semibold animate-pulse">
                          🔴 LIVE NOW
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>You haven't registered for any events yet.</p>
              <a href="/events" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Browse Events
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ParticipantDashboard
