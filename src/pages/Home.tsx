import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import HeroSection from '../components/HeroSection'

type TicketStats = {
  total: number
  open: number
  resolvedToday: number
}

export default function Home() {
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    resolvedToday: 0
  })

  useEffect(() => {
    const fetchTicketStats = async () => {
      // Get all tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select('status, created_at')

      if (tickets) {
        const today = new Date().toISOString().split('T')[0]
        
        setStats({
          total: tickets.length,
          open: tickets.filter(t => t.status === 'new' || t.status === 'in_progress').length,
          resolvedToday: tickets.filter(t => 
            t.status === 'resolved' && 
            t.created_at.startsWith(today)
          ).length
        })
      }
    }

    fetchTicketStats()
  }, [])

  return (
    <>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Ticket */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
              <p className="text-gray-600 mb-4">
                Need help? Submit a new support ticket and we'll get back to you as soon as possible.
              </p>
            </div>
            <div>
              <Link
                to="/tickets/create"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full text-center"
              >
                Create Ticket
              </Link>
            </div>
          </div>

          {/* View Tickets */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
            <div>
              <h2 className="text-xl font-semibold mb-4">View Tickets</h2>
              <p className="text-gray-600 mb-4">
                Check the status of your existing support tickets and view responses.
              </p>
            </div>
            <div>
              <Link
                to="/tickets"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full text-center"
              >
                View All Tickets
              </Link>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
              <p className="text-gray-600 mb-4">
                View and manage your profile settings and preferences.
              </p>
            </div>
            <div>
              <Link
                to="/profile"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full text-center"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <div className="text-gray-600">Open Tickets</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
            <div className="text-gray-600">Resolved Today</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-gray-600">Total Tickets</div>
          </div>
        </div>
      </div>
    </>
  )
}