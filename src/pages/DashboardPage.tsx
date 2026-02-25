import { useAuth } from '../contexts/AuthContext'
import AdminDashboard from '../components/dashboards/AdminDashboard'
import CoordinatorDashboard from '../components/dashboards/CoordinatorDashboard'
import EventHeadDashboard from '../components/dashboards/EventHeadDashboard'
import ParticipantDashboard from '../components/dashboards/ParticipantDashboard'

const DashboardPage = () => {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'coordinator':
      return <CoordinatorDashboard />
    case 'eventHead':
      return <EventHeadDashboard />
    case 'participant':
      return <ParticipantDashboard />
    default:
      return <ParticipantDashboard />
  }
}

export default DashboardPage
