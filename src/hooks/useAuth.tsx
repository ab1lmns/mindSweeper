import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthCtx {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  needsUsername: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<string | null>
  signUpWithEmail: (email: string, password: string, username: string) => Promise<string | null>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  setUsername: (username: string) => Promise<string | null>
  setNeedsUsername: (val: boolean) => void
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsUsername, setNeedsUsername] = useState(false)

  async function fetchProfile(userId: string) {
    if (!userId) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (data) {
      setProfile(data as Profile)
      const p = data as Profile
      if (!p.username || p.username.startsWith('user_') || p.username.includes('@')) {
        setNeedsUsername(true)
      } else {
        setNeedsUsername(false)
      }
    } else {
      // Profile doesn't exist. Let's create it.
      if (!user) return

      const userId = user.id
      // Use a generic 'user_' prefix so the UsernameSetupModal always triggers for auto-created profiles
      const defaultUsername = `user_${userId.slice(0, 8)}`

      console.log('Creating missing profile for user:', userId)
      
      supabase.from('profiles').insert([{
        id: userId,
        username: defaultUsername,
        elo_rating: 1000,
        games_played: 0,
        games_won: 0,
      }]).select().single().then(({ data: newProfile, error: insertError }) => {
        if (newProfile) {
          console.log('Profile created successfully:', newProfile)
          setProfile(newProfile as Profile)
          setNeedsUsername(true)
        } else if (insertError) {
          console.error('Error creating profile:', insertError.message)
        }
      })
    }
  }

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setNeedsUsername(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }

  async function signInWithEmail(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signUpWithEmail(email: string, password: string, username: string): Promise<string | null> {
    // Check username availability
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()
    if (existing) return 'Это имя уже занято'

    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    
    if (authData.user) {
      // Create profile record immediately
      await supabase.from('profiles').insert([{
        id: authData.user.id,
        username: username,
        elo_rating: 1000,
        games_played: 0,
        games_won: 0,
      }])
    }

    return error?.message ?? null
  }

  async function signOut() {
    await supabase.auth.signOut()
    setNeedsUsername(false)
  }

  async function setUsernameAction(username: string): Promise<string | null> {
    if (!user) return 'Не авторизован'
    if (username.length < 3) return 'Минимум 3 символа'
    if (username.length > 20) return 'Максимум 20 символов'
    if (!/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/.test(username)) return 'Только буквы, цифры и _'

    // Check uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()
    if (existing) return 'Это имя уже занято'

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)
    if (error) return error.message

    setNeedsUsername(false)
    await fetchProfile(user.id)
    return null
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading, needsUsername,
      signInWithGoogle, signInWithEmail, signUpWithEmail,
      signOut, refreshProfile, setUsername: setUsernameAction, setNeedsUsername
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
