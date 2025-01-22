import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Ticket = {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const fetchTickets = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setTickets(data)
      }
    }

    fetchTickets()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Link
          to="/tickets/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          New Ticket
        </Link>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  #{ticket.id.slice(0, 8)} • Created {formatDate(ticket.created_at)}
                </div>
                <h2 className="text-lg font-medium">{ticket.title}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-gray-600 mt-2">{ticket.description}</p>
            
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className={`px-2 py-1 rounded ${
                ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticket.priority} priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}