import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Ticket = {
  id: string
  created_at: string
  title: string
  description: string
  status: string
  priority: string
  user_id: string
}

type Note = {
  id: string
  // ticket_id?: string // You can remove this if you want, or leave it optional
  created_by: string
  note: string
  created_at: string
  profiles?: {
    email: string
  }
}

type TicketModalProps = {
  ticket: Ticket | null
  onClose: () => void
  onUpdate: (ticketId: string, updates: Partial<Ticket>) => Promise<void>
}

function TicketModal({ ticket, onClose, onUpdate }: TicketModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)
  const [noteSuccess, setNoteSuccess] = useState(false)
  
  useEffect(() => {
    if (ticket) {
      const fetchNotes = async () => {
        // Revert to selecting only the fields you need (no ticket_id here)
        const { data } = await supabase
          .from('ticket_notes')
          .select(`
            id,
            note,
            created_at,
            created_by
          `)
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: false })

        if (data) {
          setNotes(data)
        }
      }

      fetchNotes()
    }
  }, [ticket])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticket || !newNote.trim()) return

    setIsAddingNote(true)
    setNoteError(null)
    setNoteSuccess(false)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('You must be logged in to add notes')
      }

      // Revert to selecting only the fields you need (no ticket_id here)
      const { data, error } = await supabase
        .from('ticket_notes')
        .insert([
          {
            // The DB relationship automatically handles linking if your schema is set up that way
            ticket_id: ticket.id,
            note: newNote.trim(),
            created_by: userData.user.id
          }
        ])
        .select(`
          id,
          note,
          created_at,
          created_by
        `)

      if (error) throw error

      if (data) {
        setNotes([data[0], ...notes])
        setNewNote('')
        setNoteSuccess(true)
        setTimeout(() => setNoteSuccess(false), 3000)
      }
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setIsAddingNote(false)
    }
  }

  if (!ticket) return null

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsSaving(true)
      setError(null)
      await onUpdate(ticket.id, { status: newStatus })
    } catch (err) {
      setError('Failed to update ticket status')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    try {
      setIsSaving(true)
      setError(null)
      await onUpdate(ticket.id, { priority: newPriority })
    } catch (err) {
      setError('Failed to update ticket priority')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">#{ticket.id.slice(0, 8)}</p>
              <h2 className="text-xl font-bold mt-1">{ticket.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isSaving}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isSaving && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Priority</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={isSaving}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isSaving && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>

            {/* Error display block (useful to see if an update fails) */}
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900">{ticket.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                disabled={isAddingNote}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              {noteError && (
                <p className="mt-1 text-sm text-red-600">{noteError}</p>
              )}
              {noteSuccess && (
                <p className="mt-1 text-sm text-green-600">Note added successfully</p>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote || !newNote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isAddingNote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Add Note'
                  )}
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-900">{note.note}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function priorityRank(priority: string) {
  switch (priority) {
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'low':
      return 3
    default:
      return 4
  }
}

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const sortedData = (data || []).sort((a, b) => {
          return priorityRank(a.priority) - priorityRank(b.priority)
        })

        setTickets(sortedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
      } finally {
        setLoading(false)
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

  const handleTicketUpdate = async (ticketId: string, updates: Partial<Ticket>) => {
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)

    if (error) throw error

    // Update the ticket in our local state
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ))
    
    // Update the selected ticket if it's open in the modal
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            AutoCRM - Employee Dashboard
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleTicketUpdate}
        />
      )}
    </div>
  )
}