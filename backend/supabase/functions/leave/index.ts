import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Verify Auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const userRole = user.app_metadata?.role || user.user_metadata?.role
    const companyId = user.user_metadata?.company_id
    const method = req.method

    // --- LIST LEAVE REQUESTS ---
    if (method === 'GET') {
      let query = supabaseClient
        .from('leave_requests')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('company_id', companyId)

      // Employees ONLY see their own requests
      if (userRole === 'employee') {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- SUBMIT LEAVE REQUEST (Employee Only) ---
    if (method === 'POST') {
      const { start_date, end_date, leave_type, reason } = await req.json()
      
      const { data, error } = await supabaseClient
        .from('leave_requests')
        .insert({
          user_id: user.id,
          company_id: companyId,
          start_date,
          end_date,
          leave_type,
          reason,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ message: 'Leave request submitted', data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- MANAGE REQUEST (Approve/Reject - Admin Only) ---
    if (method === 'PATCH') {
      const { id, status, admin_comment } = await req.json()
      
      if (userRole !== 'company_admin' && userRole !== 'admin') {
         throw new Error('Only admins can approve/reject leave')
      }

      const { data, error } = await supabaseClient
        .from('leave_requests')
        .update({ 
            status, 
            admin_comment,
            responded_at: new Date().toISOString(),
            responded_by: user.id 
        })
        .eq('id', id)
        .eq('company_id', companyId) // Safety check
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ message: `Leave request ${status}`, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
