import { NextRequest, NextResponse } from 'next/server'
import { serviceTemplates } from '@/lib/templates'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: serviceTemplates
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}
