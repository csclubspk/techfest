import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Event } from '../types'
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const EventDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [id])

  useEffect(() => {
    if (user && event) {
      checkRegistration()
    }
  }, [user, event])

  const loadEvent = async () => {
    if (!id) return
    
    try {
      const eventDoc = await getDoc(doc(db, 'events', id))
      if (eventDoc.exists()) {
        setEvent({
          id: eventDoc.id,
          ...eventDoc.data(),
          eventDate: eventDoc.data().eventDate?.toDate(),
          createdAt: eventDoc.data().createdAt?.toDate(),
          updatedAt: eventDoc.data().updatedAt?.toDate(),
        } as Event)
      } else {
        toast.error('Event not found')
        navigate('/events')
      }
    } catch (error) {
      console.error('Error loading event:', error)
      toast.error('Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    if (!user || !event) return

    try {
      const q = query(
        collection(db, 'registrations'),
        where('eventId', '==', event.id),
        where('userId', '==', user.uid)
      )
      const snapshot = await getDocs(q)
      setIsRegistered(!snapshot.empty)
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register')
      navigate('/login')
      return
    }

    if (!event) return

    if (event.currentParticipants >= event.maxParticipants) {
      toast.error('Event is full')
      return
    }

    setRegistering(true)
    try {
      await addDoc(collection(db, 'registrations'), {
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhoto: user.photoURL,
        registeredAt: new Date(),
        attended: false,
      })

      // Note: In production, use a Cloud Function to update participant count
      // to ensure data consistency and prevent race conditions
      
      toast.success('Successfully registered for the event!')
      setIsRegistered(true)
    } catch (error) {
      console.error('Error registering:', error)
      toast.error('Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Events</span>
        </button>

        {/* Banner */}
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
          {event.banner ? (
            <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
              <span className="text-8xl font-bold text-white/30">{event.title[0]}</span>
            </div>
          )}
          {event.isLive && (
            <div className="absolute top-6 right-6 px-4 py-2 bg-red-500 rounded-full font-semibold animate-pulse">
              LIVE NOW
            </div>
          )}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="px-3 py-1 glass-card rounded-full">{event.category}</span>
                {event.eventHeadName && (
                  <span>Organized by {event.eventHeadName}</span>
                )}
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-4">
              <h2 className="text-2xl font-bold">About</h2>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>

            {event.rules && event.rules.length > 0 && (
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h2 className="text-2xl font-bold">Rules & Regulations</h2>
                <ul className="space-y-2 text-gray-300">
                  {event.rules.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass-card p-6 rounded-xl space-y-4">
              <h2 className="text-2xl font-bold">Eligibility</h2>
              <p className="text-gray-300">{event.eligibility}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl space-y-4 sticky top-20">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="text-blue-400" size={20} />
                  <div>
                    <div className="text-sm text-gray-400">Date</div>
                    <div className="font-medium">{format(event.eventDate, 'MMM dd, yyyy')}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Clock className="text-blue-400" size={20} />
                  <div>
                    <div className="text-sm text-gray-400">Time</div>
                    <div className="font-medium">{event.eventTime}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="text-blue-400" size={20} />
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="font-medium">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-300">
                  <Users className="text-blue-400" size={20} />
                  <div>
                    <div className="text-sm text-gray-400">Participants</div>
                    <div className="font-medium">
                      {event.currentParticipants}/{event.maxParticipants}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                {isRegistered ? (
                  <div className="text-center py-3 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <span className="text-green-400 font-semibold">✓ Already Registered</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering || event.currentParticipants >= event.maxParticipants}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registering
                      ? 'Registering...'
                      : event.currentParticipants >= event.maxParticipants
                      ? 'Event Full'
                      : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default EventDetailPage
