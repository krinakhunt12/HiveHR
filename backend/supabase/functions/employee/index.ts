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

    // 1. Verify Auth & Role
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const userRole = user.app_metadata?.role || user.user_metadata?.role
    // Fallback companyId from URL or JWT metadata
    const url = new URL(req.url)
    const companyIdFromUrl = url.searchParams.get('company_id')
    const companyId = companyIdFromUrl || user.user_metadata?.company_id

    // Only company_admin and admin can list or manage employees
    if (userRole !== 'company_admin' && userRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const method = req.method

    // --- LIST EMPLOYEES (Secure Fetch) ---
    if (method === 'GET') {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .eq('role', 'employee')

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- ADD EMPLOYEE ---
    if (method === 'POST') {
      const { email, password, full_name, designation, department_id } = await req.json()
      
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: 'employee', company_id: companyId },
        app_metadata: { role: 'employee' }
      })
      if (createError) throw createError

      const { data, error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: newUser.user.id,
          full_name,
          designation,
          department_id,
          company_id: companyId,
          role: 'employee'
        })
        .select()
        .single()

      if (profileError) throw profileError

      return new Response(JSON.stringify({ message: 'Employee added successfully', data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- DELETE EMPLOYEE ---
    if (method === 'DELETE') {
      const { id } = await req.json()
      if (!id) throw new Error('Employee ID required')

      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(id)
      if (authDeleteError) throw authDeleteError

      return new Response(JSON.stringify({ message: 'Employee removed successfully' }), {
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
