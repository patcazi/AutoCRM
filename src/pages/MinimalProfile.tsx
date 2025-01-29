import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function MinimalProfile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    (async () => {
      // Fetch the Auth user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) return

      // Set email from Auth
      setEmail(user.email || '')

      // Fetch profile row
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('user_id', user.id)
        .single()

      if (!profileError && profileData) {
        setName(profileData.name || '')
        setRole(profileData.role || '')
      }
    })()
  }, [])

  return (
    <div className="bg-gray-50 py-20 flex justify-center">
      <div className="bg-white p-10 shadow-md rounded-md w-full max-w-xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">My Profile</h1>
        <div className="text-lg space-y-4">
          <p>
            <strong className="text-gray-900">Name:</strong> {name || 'Not set'}
          </p>
          <p>
            <strong className="text-gray-900">Email:</strong> {email}
          </p>
          <p>
            <strong className="text-gray-900">Role:</strong> {role || 'Not set'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MinimalProfile 