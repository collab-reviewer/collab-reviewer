import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://csxyzlxajmqogaogdpmz.supabase.co'
const supabaseAnonKey = 'sb_publishable_V37cK4oEw8viI_VKYeoMgQ_6YsfnopM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
