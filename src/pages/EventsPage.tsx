import { useEffect, useState } from 'react'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Event } from '../types'
import EventCard from '../components/EventCard'
import { Search, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Competition']

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [searchTerm, selectedCategory, events])

  const loadEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('eventDate', 'asc'))
      const snapshot = await getDocs(q)
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[]
      setEvents(eventsData)
      setFilteredEvents(eventsData)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Events</h1>
          <p className="text-gray-400 text-lg">
            Explore all the exciting events at TechFest 2026
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'glass-card hover:bg-white/10'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-xl">
            <p className="text-gray-400 text-lg">
              {searchTerm || selectedCategory !== 'all'
                ? 'No events found matching your criteria'
                : 'No events available yet'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default EventsPage
