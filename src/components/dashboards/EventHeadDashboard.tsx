import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Event, Registration } from '../../types'
import { Users, CheckCircle, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const EventHeadDashboard = () => {
  const { user } = useAuth()
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignedEvents()
  }, [user])

  useEffect(() => {
    if (selectedEvent) {
      loadParticipants(selectedEvent.id)
    }
  }, [selectedEvent])

  const loadAssignedEvents = async () => {
    if (!user) return

    try {
      const q = query(
        collection(db, 'events'),
        where('eventHeadId', '==', user.uid)
      )
      const snapshot = await getDocs(q)
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[]
      setAssignedEvents(events)
      if (events.length > 0) {
        setSelectedEvent(events[0])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = async (eventId: string) => {
    try {
      const q = query(
        collection(db, 'registrations'),
        where('eventId', '==', eventId)
      )
      const snapshot = await getDocs(q)
      const parts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        registeredAt: doc.data().registeredAt?.toDate(),
      })) as Registration[]
      setParticipants(parts)
    } catch (error) {
      console.error('Error loading participants:', error)
    }
  }

  const markAttendance = async (registrationId: string, attended: boolean) => {
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        attended,
      })
      setParticipants(prev =>
        prev.map(p => (p.id === registrationId ? { ...p, attended } : p))
      )
      toast.success(attended ? 'Marked as attended' : 'Attendance removed')
    } catch (error) {
      console.error('Error updating attendance:', error)
      toast.error('Failed to update attendance')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (assignedEvents.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-12 rounded-xl text-center">
          <h2 className="text-2xl font-bold mb-4">No Events Assigned</h2>
          <p className="text-gray-400">
            You haven't been assigned any events yet. Contact an admin for more information.
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
          <h1 className="text-4xl font-bold mb-2">Event Head Dashboard</h1>
          <p className="text-gray-400">Manage your assigned events</p>
        </div>

        {/* Event Selector */}
        <div className="glass-card p-4 rounded-xl">
          <label className="block text-sm font-medium mb-2">Select Event</label>
          <select
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const event = assignedEvents.find(ev => ev.id === e.target.value)
              setSelectedEvent(event || null)
            }}
            className="input-field"
          >
            {assignedEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 mb-1">Total Participants</div>
                    <div className="text-3xl font-bold">{participants.length}</div>
                  </div>
                  <Users className="text-blue-400" size={40} />
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 mb-1">Attended</div>
                    <div className="text-3xl font-bold">
                      {participants.filter(p => p.attended).length}
                    </div>
                  </div>
                  <CheckCircle className="text-green-400" size={40} />
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 mb-1">Available Slots</div>
                    <div className="text-3xl font-bold">
                      {selectedEvent.maxParticipants - participants.length}
                    </div>
                  </div>
                  <Trophy className="text-purple-400" size={40} />
                </div>
              </div>
            </div>

            {/* Participants Table */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Participants</h2>
              
              {participants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-center py-3 px-4">Attendance</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((participant) => (
                        <tr
                          key={participant.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4">{participant.userName}</td>
                          <td className="py-3 px-4 text-gray-400">{participant.userEmail}</td>
                          <td className="py-3 px-4 text-center">
                            {participant.attended ? (
                              <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                                Present
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => markAttendance(participant.id, !participant.attended)}
                                className="btn-secondary text-sm"
                              >
                                {participant.attended ? 'Remove' : 'Mark Present'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No participants registered yet.
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default EventHeadDashboard
