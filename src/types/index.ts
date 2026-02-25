export type UserRole = 'admin' | 'coordinator' | 'eventHead' | 'participant'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  banner?: string
  rules: string[]
  eligibility: string
  maxParticipants: number
  currentParticipants: number
  eventDate: Date
  eventTime: string
  location: string
  category: string
  eventHeadId?: string
  eventHeadName?: string
  isLive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Registration {
  id: string
  eventId: string
  eventTitle: string
  userId: string
  userName: string
  userEmail: string
  userPhoto?: string
  registeredAt: Date
  attended: boolean
  certificateId?: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  createdAt: Date
  priority: 'low' | 'medium' | 'high'
}

export interface Winner {
  id: string
  eventId: string
  eventTitle: string
  position: 1 | 2 | 3
  userId: string
  userName: string
  userPhoto?: string
  approvedBy: string
  approvedAt: Date
}

export interface Certificate {
  id: string
  userId: string
  userName: string
  eventId: string
  eventTitle: string
  eventDate: Date
  verificationId: string
  generatedAt: Date
}
