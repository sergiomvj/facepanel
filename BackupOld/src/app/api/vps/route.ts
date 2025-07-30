import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: vps, error } = await supabaseAdmin
      .from('vps')
      .select(`
        *,
        vps_stats:vps_latest_stats(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch VPS from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vps || []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch VPS list' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { 
      name, 
      ip, 
      username, 
      port = 22, 
      tags = [], 
      private_key, 
      password,
      auth_type = 'key'
    } = body
    
    if (!name || !ip || !username) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, ip, username' },
        { status: 400 }
      )
    }

    // Validate authentication credentials
    if (auth_type === 'key' && !private_key) {
      return NextResponse.json(
        { success: false, error: 'Private key is required for key authentication' },
        { status: 400 }
      )
    }

    if (auth_type === 'password' && !password) {
      return NextResponse.json(
        { success: false, error: 'Password is required for password authentication' },
        { status: 400 }
      )
    }

    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { success: false, error: 'Invalid IP address format' },
        { status: 400 }
      )
    }
    
    // Check if VPS with same IP and port already exists
    const { data: existingVPS, error: checkError } = await supabaseAdmin
      .from('vps')
      .select('id')
      .eq('ip', ip)
      .eq('port', port)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing VPS:', checkError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    if (existingVPS) {
      return NextResponse.json(
        { success: false, error: 'VPS with this IP and port already exists' },
        { status: 409 }
      )
    }
    
    // Create new VPS entry
    const vpsData: any = {
      name,
      ip,
      port,
      username,
      auth_type,
      tags,
      status: 'offline'
    }

    // Add authentication credentials based on type
    if (auth_type === 'key') {
      vpsData.private_key = private_key // TODO: Encrypt this in production
    } else if (auth_type === 'password') {
      // TODO: Hash the password before storing
      // For now, storing plaintext (NOT recommended for production)
      vpsData.password_hash = password
    }

    const { data: newVPS, error: insertError } = await supabaseAdmin
      .from('vps')
      .insert(vpsData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting VPS:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create VPS' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: newVPS
    }, { status: 201 })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create VPS' },
      { status: 500 }
    )
  }
}
