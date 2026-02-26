import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Event, Registration, Winner } from '../../types'
import { Users, CheckCircle, Trophy, Edit, Play, Award, Upload, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { uploadImage } from '../../utils/imageUpload'

const EventHeadDashboard = () => {
  const { user } = useAuth()
  const [assignedEvents, setAssignedEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Registration[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showWinnerSelection, setShowWinnerSelection] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editForm, setEditForm] = useState({
    description: '',
    banner: '',
  })
  const [winnerForm, setWinnerForm] = useState({
    first: '',
    second: '',
    third: '',
  })

  useEffect(() => {
    loadAssignedEvents()
  }, [user])

  useEffect(() => {
    if (selectedEvent) {
      loadParticipants(selectedEvent.id)
      loadWinners(selectedEvent.id)
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

  const loadWinners = async (eventId: string) => {
    try {
      const q = query(
        collection(db, 'winners'),
        where('eventId', '==', eventId)
      )
      const snapshot = await getDocs(q)
      const winnersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        approvedAt: doc.data().approvedAt?.toDate(),
      })) as Winner[]
      setWinners(winnersData)
    } catch (error) {
      console.error('Error loading winners:', error)
    }
  }

  const startEvent = async () => {
    if (!selectedEvent || !user) return

    try {
      // Mark event as live
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        isLive: true,
        updatedAt: new Date(),
      })

      // Create announcement
      await addDoc(collection(db, 'announcements'), {
        title: `${selectedEvent.title} is now LIVE!`,
        content: `The event "${selectedEvent.title}" has started. Participants, please proceed to ${selectedEvent.location}.`,
        author: user.displayName || 'Event Head',
        authorId: user.uid,
        priority: 'high',
        createdAt: Timestamp.now(),
      })

      setSelectedEvent({ ...selectedEvent, isLive: true })
      toast.success('Event started and announcement posted!')
    } catch (error) {
      console.error('Error starting event:', error)
      toast.error('Failed to start event')
    }
  }

  const endEvent = async () => {
    if (!selectedEvent || !user) return

    try {
      // Mark event as not live
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        isLive: false,
        updatedAt: new Date(),
      })

      // Create announcement
      await addDoc(collection(db, 'announcements'), {
        title: `${selectedEvent.title} has ended`,
        content: `The event "${selectedEvent.title}" has concluded. Thank you to all participants!`,
        author: user.displayName || 'Event Head',
        authorId: user.uid,
        priority: 'medium',
        createdAt: Timestamp.now(),
      })

      setSelectedEvent({ ...selectedEvent, isLive: false })
      toast.success('Event ended and announcement posted!')
    } catch (error) {
      console.error('Error ending event:', error)
      toast.error('Failed to end event')
    }
  }

  const handleSelectWinners = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent || !user) return

    if (!winnerForm.first || !winnerForm.second || !winnerForm.third) {
      toast.error('Please select all three winners')
      return
    }

    if (
      winnerForm.first === winnerForm.second ||
      winnerForm.first === winnerForm.third ||
      winnerForm.second === winnerForm.third
    ) {
      toast.error('Please select different participants for each position')
      return
    }

    try {
      const positions = [
        { position: 1, userId: winnerForm.first },
        { position: 2, userId: winnerForm.second },
        { position: 3, userId: winnerForm.third },
      ]

      // Check if winners already exist
      if (winners.length > 0) {
        toast.error('Winners have already been declared for this event')
        return
      }

      for (const { position, userId } of positions) {
        const participant = participants.find(p => p.userId === userId)
        if (!participant) continue

        await addDoc(collection(db, 'winners'), {
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          position,
          userId: participant.userId,
          userName: participant.userName,
          userPhoto: participant.userPhoto || null,
          approvedBy: user.uid,
          approvedAt: Timestamp.now(),
        })
      }

      // Create announcement for winners
      const firstPlace = participants.find(p => p.userId === winnerForm.first)
      const secondPlace = participants.find(p => p.userId === winnerForm.second)
      const thirdPlace = participants.find(p => p.userId === winnerForm.third)

      await addDoc(collection(db, 'announcements'), {
        title: `Winners Announced: ${selectedEvent.title}`,
        content: `Congratulations to the winners!\n\n🥇 1st Place: ${firstPlace?.userName}\n🥈 2nd Place: ${secondPlace?.userName}\n🥉 3rd Place: ${thirdPlace?.userName}`,
        author: user.displayName || 'Event Head',
        authorId: user.uid,
        priority: 'high',
        createdAt: Timestamp.now(),
      })

      await loadWinners(selectedEvent.id)
      setShowWinnerSelection(false)
      setWinnerForm({ first: '', second: '', third: '' })
      toast.success('Winners declared and announcement posted!')
    } catch (error) {
      console.error('Error selecting winners:', error)
      toast.error('Failed to declare winners')
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

  const handleEditEvent = () => {
    if (selectedEvent) {
      setEditForm({
        description: selectedEvent.description,
        banner: selectedEvent.banner || '',
      })
      setShowEditForm(true)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const imageUrl = await uploadImage(file, 'events')
      setEditForm({ ...editForm, banner: imageUrl })
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    try {
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        description: editForm.description,
        banner: editForm.banner || null,
        updatedAt: new Date(),
      })
      
      // Update local state
      const updatedEvent = {
        ...selectedEvent,
        description: editForm.description,
        banner: editForm.banner || undefined,
      }
      setSelectedEvent(updatedEvent)
      setAssignedEvents(prev =>
        prev.map(e => e.id === selectedEvent.id ? updatedEvent : e)
      )
      
      setShowEditForm(false)
      toast.success('Event updated successfully!')
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
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

            {/* Edit Event Details */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Event Details</h2>
                <button
                  onClick={handleEditEvent}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Edit size={18} />
                  <span>Edit Event</span>
                </button>
              </div>

              {showEditForm ? (
                <form onSubmit={handleUpdateEvent} className="space-y-4 p-4 glass-card rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Title (Read-only)</label>
                    <input
                      type="text"
                      value={selectedEvent.title}
                      className="input-field bg-white/5 cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="input-field min-h-[120px]"
                      placeholder="Update event description..."
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
                        value={editForm.banner}
                        onChange={(e) => setEditForm({ ...editForm, banner: e.target.value })}
                        className="input-field"
                        placeholder="Or paste image URL (https://example.com/image.jpg)"
                      />
                      <p className="text-sm text-gray-500 mt-1">You can upload a file or paste a URL</p>
                    </div>

                    {/* Image Preview */}
                    {editForm.banner && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Preview</label>
                        <img
                          src={editForm.banner}
                          alt="Banner preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/800x200?text=Invalid+Image'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                    <p className="text-white">{selectedEvent.description}</p>
                  </div>
                  {selectedEvent.banner && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Event Banner</h3>
                      <img
                        src={selectedEvent.banner}
                        alt="Event banner"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <span className="ml-2 text-white">{selectedEvent.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Department:</span>
                      <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                        {selectedEvent.department}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <span className="ml-2 text-white">{selectedEvent.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <span className="ml-2 text-white">{selectedEvent.eventDate.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Time:</span>
                      <span className="ml-2 text-white">{selectedEvent.eventTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Controls */}
            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Event Controls</h2>
              <div className="flex flex-wrap gap-4">
                {!selectedEvent.isLive ? (
                  <button
                    onClick={startEvent}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Play size={18} />
                    <span>Start Event</span>
                  </button>
                ) : (
                  <>
                    <div className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg flex items-center space-x-2">
                      <CheckCircle size={18} />
                      <span>Event is Live</span>
                    </div>
                    <button
                      onClick={endEvent}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Square size={18} />
                      <span>End Event</span>
                    </button>
                  </>
                )}

                {winners.length === 0 ? (
                  <button
                    onClick={() => setShowWinnerSelection(!showWinnerSelection)}
                    className="btn-secondary flex items-center space-x-2"
                    disabled={participants.filter(p => p.attended).length < 3}
                  >
                    <Award size={18} />
                    <span>Select Winners</span>
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg flex items-center space-x-2">
                    <Trophy size={18} />
                    <span>Winners Declared</span>
                  </div>
                )}
              </div>

              {participants.filter(p => p.attended).length < 3 && winners.length === 0 && (
                <p className="text-sm text-yellow-400 mt-4">
                  ⚠️ At least 3 participants must mark attendance before selecting winners
                </p>
              )}
            </div>

            {/* Winner Selection Form */}
            {showWinnerSelection && winners.length === 0 && (
              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-6">Select Winners</h2>
                <form onSubmit={handleSelectWinners} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      🥇 1st Place
                    </label>
                    <select
                      value={winnerForm.first}
                      onChange={(e) => setWinnerForm({ ...winnerForm, first: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select participant...</option>
                      {participants
                        .filter(p => p.attended)
                        .map(p => (
                          <option key={p.userId} value={p.userId}>
                            {p.userName} ({p.userEmail})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      🥈 2nd Place
                    </label>
                    <select
                      value={winnerForm.second}
                      onChange={(e) => setWinnerForm({ ...winnerForm, second: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select participant...</option>
                      {participants
                        .filter(p => p.attended)
                        .map(p => (
                          <option key={p.userId} value={p.userId}>
                            {p.userName} ({p.userEmail})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      🥉 3rd Place
                    </label>
                    <select
                      value={winnerForm.third}
                      onChange={(e) => setWinnerForm({ ...winnerForm, third: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select participant...</option>
                      {participants
                        .filter(p => p.attended)
                        .map(p => (
                          <option key={p.userId} value={p.userId}>
                            {p.userName} ({p.userEmail})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary">
                      Declare Winners
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWinnerSelection(false)
                        setWinnerForm({ first: '', second: '', third: '' })
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Display Winners if already declared */}
            {winners.length > 0 && (
              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-6">Winners</h2>
                <div className="space-y-4">
                  {winners
                    .sort((a, b) => a.position - b.position)
                    .map((winner) => (
                      <div
                        key={winner.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">
                            {winner.position === 1 && '🥇'}
                            {winner.position === 2 && '🥈'}
                            {winner.position === 3 && '🥉'}
                          </div>
                          <div>
                            <div className="font-semibold">{winner.userName}</div>
                            <div className="text-sm text-gray-400">
                              {winner.position === 1 && '1st Place'}
                              {winner.position === 2 && '2nd Place'}
                              {winner.position === 3 && '3rd Place'}
                            </div>
                          </div>
                        </div>
                        <Trophy className="text-yellow-400" size={24} />
                      </div>
                    ))}
                </div>
              </div>
            )}

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
