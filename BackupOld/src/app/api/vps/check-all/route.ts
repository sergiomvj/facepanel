import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    // Buscar todas as VPS
    const { data: vpsList, error } = await supabaseAdmin
      .from('vps')
      .select('*')

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch VPS list' },
        { status: 500 }
      )
    }

    const results = []

    // Testar cada VPS
    for (const vps of vpsList) {
      try {
        const response = await fetch(`http://localhost:3001/api/vps/test-connection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ vps_id: vps.id })
        })

        const result = await response.json()
        results.push({
          vps_id: vps.id,
          name: vps.name,
          ip: vps.ip,
          status: result.data?.status || 'offline',
          online: result.data?.online || false,
          error: result.data?.error || null
        })
      } catch (err) {
        results.push({
          vps_id: vps.id,
          name: vps.name,
          ip: vps.ip,
          status: 'offline',
          online: false,
          error: 'Connection test failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Check all VPS error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check VPS status' },
      { status: 500 }
    )
  }
}
