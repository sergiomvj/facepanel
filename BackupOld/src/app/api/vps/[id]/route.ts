import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
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

    // Check if VPS exists
    const { data: existingVPS, error: checkError } = await supabaseAdmin
      .from('vps')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingVPS) {
      return NextResponse.json(
        { success: false, error: 'VPS not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      name,
      ip,
      port,
      username,
      auth_type,
      tags,
      updated_at: new Date().toISOString()
    }

    // Add authentication credentials based on type
    if (auth_type === 'key') {
      updateData.private_key = private_key
      updateData.password_hash = null // Clear password if switching to key
    } else if (auth_type === 'password') {
      updateData.password_hash = password // TODO: Hash in production
      updateData.private_key = null // Clear key if switching to password
    }

    // Update VPS
    const { data: updatedVPS, error: updateError } = await supabaseAdmin
      .from('vps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update VPS in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedVPS
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update VPS' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { error } = await supabaseAdmin
      .from('vps')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete VPS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'VPS deleted successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete VPS' },
      { status: 500 }
    )
  }
}
