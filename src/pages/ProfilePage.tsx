import { useEffect, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Shield, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { generateCertificate } from '../utils/certificateGenerator'

const ProfilePage = () => {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName)
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
      })
      toast.success('Profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadCertificate = async () => {
    if (!user) return

    try {
      // This is a sample certificate generation
      // In production, only generate for events the user attended
      await generateCertificate({
        userName: user.displayName,
        eventTitle: 'TechFest 2026',
        eventDate: new Date(),
        verificationId: `CERT-${user.uid.slice(0, 8).toUpperCase()}`,
      })
      toast.success('Certificate downloaded!')
    } catch (error) {
      console.error('Error generating certificate:', error)
      toast.error('Failed to generate certificate')
    }
  }

  if (!user) return null

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600/20 text-red-400 border-red-600/50'
      case 'coordinator':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/50'
      case 'eventHead':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/50'
      default:
        return 'bg-green-600/20 text-green-400 border-green-600/50'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'coordinator':
        return 'Coordinator'
      case 'eventHead':
        return 'Event Head'
      default:
        return 'Participant'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and information</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-8 rounded-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Photo */}
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-full border-4 border-blue-600/50"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold border-4 border-blue-600/50">
                  {user.displayName[0]}
                </div>
              )}
              {/* Photo upload disabled - Firebase Storage not configured */}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{user.displayName}</h2>
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-400">{user.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Shield size={18} className="text-gray-400" />
                <span className={`px-3 py-1 rounded-full text-sm border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="glass-card p-8 rounded-xl">
          <h3 className="text-2xl font-bold mb-6">Edit Profile</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={user.email}
                  className="input-field pl-10 bg-white/5 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Certificates Section */}
        {user.role === 'participant' && (
          <div className="glass-card p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">Certificates</h3>
            <p className="text-gray-400 mb-6">
              Download your participation certificates for attended events
            </p>
            <button
              onClick={handleDownloadCertificate}
              className="btn-primary flex items-center space-x-2"
            >
              <Download size={20} />
              <span>Download Sample Certificate</span>
            </button>
          </div>
        )}

        {/* Account Info */}
        <div className="glass-card p-8 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">Account Information</h3>
          <div className="space-y-3 text-gray-400">
            <div className="flex justify-between">
              <span>Account Type:</span>
              <span className="text-white">{getRoleLabel(user.role)}</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since:</span>
              <span className="text-white">
                {user.createdAt.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="text-white font-mono text-sm">{user.uid.slice(0, 12)}...</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
