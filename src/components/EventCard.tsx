import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { Event } from '../types'
import { format } from 'date-fns'

interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden group"
    >
      {/* Banner */}
      <div className="relative h-48 overflow-hidden">
        {event.banner ? (
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/30">{event.title[0]}</span>
          </div>
        )}
        {event.isLive && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 rounded-full text-sm font-semibold animate-pulse">
            LIVE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
            {event.title}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>{format(event.eventDate, 'MMM dd, yyyy')} • {event.eventTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>
              {event.currentParticipants}/{event.maxParticipants} participants
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-sm text-gray-400">{event.category}</span>
          <Link
            to={`/events/${event.id}`}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group"
          >
            <span>View Details</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default EventCard
