import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Registration } from '../../types'
import { Calendar, Trophy, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const ParticipantDashboard = () => {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRegistrations()
  }, [user])

  const loadRegistrations = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'registrations'),
        where('userId', '==', user.uid),
        orderBy('registeredAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const regs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt?.toDate(),
      })) as Registration[]
      setRegistrations(regs)
    } catch (error) {
      console.error('Error loading registrations:', error)
    } finally {
      setLoading(false)
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
          <h2 className="text-2xl font-bold mb-6">My Events</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="glass-card p-4 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{reg.eventTitle}</h3>
                      <p className="text-gray-400 text-sm">
                        Registered on {format(reg.registeredAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {reg.attended && (
                        <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                          Attended
                        </span>
                      )}
                      {reg.certificateId && (
                        <button className="btn-secondary text-sm">
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
