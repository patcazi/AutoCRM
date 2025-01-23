import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AutoCRM
        </h1>
        <p className="text-lg text-gray-600">
          Manage your customer relationships with ease
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create Ticket Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Ticket
          </h2>
          <p className="text-gray-600 mb-4">
            Create and manage support tickets for your customers
          </p>
          <Link
            to="/tickets/create"
            className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Create Ticket
          </Link>
        </div>

        {/* View Tickets Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            View Tickets
          </h2>
          <p className="text-gray-600 mb-4">
            Browse and manage all your existing support tickets
          </p>
          <Link
            to="/tickets"
            className="inline-flex items-center justify-center w-full bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            View All Tickets
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Profile
          </h2>
          <p className="text-gray-600 mb-4">
            View and manage your account settings
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center w-full bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors"
          >
            Go to Profile
          </Link>
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
  )
}