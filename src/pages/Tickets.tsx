import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Ticket = {
  id: string
  created_at: string
  title: string
  description: string
  status: string
  priority: string
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          New Ticket
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading tickets...</div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg divide-y">
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tickets found</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="text-lg font-medium">{ticket.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    ticket.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{ticket.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Priority: {ticket.priority}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}