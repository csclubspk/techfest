import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Winner, Event } from '../types'
import { Trophy, Award, Medal } from 'lucide-react'
import { motion } from 'framer-motion'

const WinnersPage = () => {
  const [winners, setWinners] = useState<Winner[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load winners
      const winnersQuery = query(collection(db, 'winners'), orderBy('approvedAt', 'desc'))
      const winnersSnapshot = await getDocs(winnersQuery)
      const winnersData = winnersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        approvedAt: doc.data().approvedAt?.toDate(),
      })) as Winner[]
      setWinners(winnersData)

      // Load events for grouping
      const eventsSnapshot = await getDocs(collection(db, 'events'))
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[]
      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupWinnersByEvent = () => {
    const grouped: { [key: string]: Winner[] } = {}
    winners.forEach(winner => {
      if (!grouped[winner.eventId]) {
        grouped[winner.eventId] = []
      }
      grouped[winner.eventId].push(winner)
    })
    return grouped
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return Trophy
      case 2:
        return Award
      case 3:
        return Medal
      default:
        return Trophy
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-600 to-yellow-400'
      case 2:
        return 'from-gray-600 to-gray-400'
      case 3:
        return 'from-orange-700 to-orange-500'
      default:
        return 'from-blue-600 to-blue-400'
    }
  }

  const getPositionText = (position: number) => {
    switch (position) {
      case 1:
        return '1st Place'
      case 2:
        return '2nd Place'
      case 3:
        return '3rd Place'
      default:
        return `${position}th Place`
    }
  }

  const groupedWinners = groupWinnersByEvent()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Winners
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Celebrating excellence and achievement at TechFest 2026
          </p>
        </div>

        {/* Winners List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(groupedWinners).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedWinners).map(([eventId, eventWinners]) => {
              const event = events.find(e => e.id === eventId)
              if (!event) return null

              const sortedWinners = [...eventWinners].sort((a, b) => a.position - b.position)

              return (
                <motion.div
                  key={eventId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card p-6 rounded-xl"
                >
                  <h2 className="text-2xl font-bold mb-6">{event.title}</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {sortedWinners.map((winner, index) => {
                      const PositionIcon = getPositionIcon(winner.position)
                      return (
                        <motion.div
                          key={winner.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className={`glass-card p-6 rounded-xl text-center ${
                            winner.position === 1 ? 'md:scale-105' : ''
                          }`}
                        >
                          <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${getPositionColor(winner.position)} mb-4`}>
                            <PositionIcon size={32} className="text-white" />
                          </div>
                          
                          {winner.userPhoto ? (
                            <img
                              src={winner.userPhoto}
                              alt={winner.userName}
                              className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-white/20"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold border-2 border-white/20">
                              {winner.userName[0]}
                            </div>
                          )}

                          <h3 className="text-xl font-bold mb-2">{winner.userName}</h3>
                          <p className={`text-sm font-semibold bg-gradient-to-r ${getPositionColor(winner.position)} bg-clip-text text-transparent`}>
                            {getPositionText(winner.position)}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="glass-card p-12 rounded-xl text-center">
            <Trophy className="mx-auto mb-4 text-gray-600" size={48} />
            <h3 className="text-xl font-semibold mb-2">No Winners Announced Yet</h3>
            <p className="text-gray-400">Winners will be announced after the events conclude!</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default WinnersPage
