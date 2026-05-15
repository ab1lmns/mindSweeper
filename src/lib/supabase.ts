import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.')
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      document.body.innerHTML = '<div style="padding: 40px; color: white; text-align: center; font-family: sans-serif;"><h1>Ошибка конфигурации</h1><p>Не заданы ключи VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.</p><p>Укажи их в настройках Environment Variables на сервере (Vercel/Netlify/т.д.) и пересобери проект.</p></div>'
    }, 1000)
  }
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')
