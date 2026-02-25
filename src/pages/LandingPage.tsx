import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Calendar, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Event } from '../types'
import EventCard from '../components/EventCard'

const LandingPage = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedEvents()
  }, [])

  const loadFeaturedEvents = async () => {
    try {
      const q = query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc'),
        limit(3)
      )
      const snapshot = await getDocs(q)
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Event[]
      setFeaturedEvents(events)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { icon: Calendar, label: 'Events', value: '20+' },
    { icon: Users, label: 'Participants', value: '500+' },
    { icon: Trophy, label: 'Prize Pool', value: '₹50K' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient bg-[length:200%_200%]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="flex justify-center">
              <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full">
                <Sparkles className="text-yellow-400" size={20} />
                <span className="text-sm">February 25-28, 2026</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SPK College
              </span>
              <br />
              <span className="text-white">TechFest 2026</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Join the biggest technical festival of the year. Compete, Learn, and Win amazing prizes!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events" className="btn-primary text-lg">
                Explore Events
              </Link>
              <Link to="/register" className="btn-secondary text-lg">
                Register Now
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto pt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <stat.icon className="mx-auto mb-3 text-blue-400" size={32} />
                  <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Events</h2>
            <Link to="/events" className="text-blue-400 hover:text-blue-300 flex items-center space-x-2">
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="text-gray-400">No events available yet. Check back soon!</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 rounded-2xl text-center space-y-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Join?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Don't miss out on this incredible opportunity to showcase your skills and win amazing prizes!
          </p>
          <Link to="/register" className="btn-primary text-lg inline-block">
            Register for TechFest 2026
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

export default LandingPage
