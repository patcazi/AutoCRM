import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Layout() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isEmployee, setIsEmployee] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsEmployee(currentUser?.user_metadata?.role === 'employee')
      
      // Fetch profile name if user exists
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', currentUser.id)
          .single()
        
        if (data) {
          setProfileName(data.name)
        }
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsEmployee(currentUser?.user_metadata?.role === 'employee')
      
      // Fetch profile name if user exists
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', currentUser.id)
          .single()
        
        if (data) {
          setProfileName(data.name)
        }
      } else {
        setProfileName(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-blue-600 font-bold text-xl">
                AutoCRM
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:flex sm:space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/tickets"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Tickets
              </Link>
              {isEmployee && (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
            </div>

            {/* Auth Section */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-sm font-medium">
                      {profileName || user?.user_metadata?.name || user?.email}
                    </span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          Logged in as {profileName || user?.user_metadata?.name || user?.email}
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsDropdownOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}