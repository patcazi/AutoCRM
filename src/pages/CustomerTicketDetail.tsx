import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Note = {
  id: string
  note: string
  created_at: string
  created_by: string
}

type Ticket = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  created_at: string
}

export default function CustomerTicketDetail() {
  const { ticketId } = useParams()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTicketAndNotes() {
      try {
        setLoading(true)
        
        // Fetch ticket details
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (ticketError) throw ticketError
        setTicket(ticketData)

        // Fetch public notes
        const { data: notesData, error: notesError } = await supabase
          .from('ticket_notes')
          .select('*')
          .eq('ticket_id', ticketId)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })

        if (notesError) throw notesError
        setNotes(notesData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket details')
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      fetchTicketAndNotes()
    }
  }, [ticketId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
          Ticket not found
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back to tickets link */}
      <Link
        to="/tickets"
        className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Tickets
      </Link>

      {/* Ticket header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Ticket #{ticket.id.slice(0, 8)}</p>
            <h1 className="text-2xl font-bold mt-1">{ticket.title}</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ticket.status === 'new' ? 'bg-blue-100 text-blue-800' :
            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-gray-600 mt-4">{ticket.description}</p>
        
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span className={`px-2 py-1 rounded ${
            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {ticket.priority} priority
          </span>
          <span className="text-gray-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Notes section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Updates</h2>
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map(note => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">{note.note}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No updates yet</p>
        )}
      </div>
    </div>
  )
} 