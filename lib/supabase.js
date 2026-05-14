import { createClient } from '@supabase/supabase-js'

const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local')
  return createClient(url, key)
}

let _instance = null
const handler = {
  get(_, prop) {
    if (!_instance) _instance = createSupabaseClient()
    return _instance[prop]
  }
}

export const supabase = new Proxy({}, handler)
