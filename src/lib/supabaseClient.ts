import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Only surface the missing-config warning in dev. In production the var
// names show up in the shipped bundle string anyway, but logging them on
// every page load is needless info-disclosure to anyone opening DevTools.
if ((!url || !key) && import.meta.env.DEV) {
  console.warn('[supabase] env vars missing — admin sign-in will fail')
}

// Supabase is used only to validate admin credentials. As soon as the
// password sign-in succeeds we hand the Supabase access token to our own
// API (POST /api/admin/session), which sets an HttpOnly cookie and is
// the actual source of authority for /api/admin/*.
//
// We deliberately disable Supabase's session persistence — there is no
// reason to retain the JWT in JS-reachable storage once the cookie is set.
// XSS can't steal a credential that doesn't exist.
export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
