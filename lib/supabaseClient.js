import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zaohiqvhzvhlkxipwmpr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphb2hpcXZoenZobGt4aXB3bXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMzg5ODMsImV4cCI6MjA4NDcxNDk4M30.JgkOJUheRJTyrWNVcyCZ49EWdMVxb9gN1560P5BRdT0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)