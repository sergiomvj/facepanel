import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vpsId = params.id
    
    // Mock status data - Em produção, isso viria da conexão SSH real
    const mockStatus = {
      vpsId,
      cpu: {
        usage: Math.random() * 100,
        cores: 4
      },
      memory: {
        used: Math.random() * 8000,
        total: 8000,
        percentage: Math.random() * 100
      },
      disk: {
        used: Math.random() * 50000,
        total: 100000,
        percentage: Math.random() * 100
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000
      },
      uptime: Math.random() * 1000000,
      timestamp: new Date()
    }
    
    return NextResponse.json({
      success: true,
      data: mockStatus
    })
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch VPS status' },
      { status: 500 }
    )
  }
}
