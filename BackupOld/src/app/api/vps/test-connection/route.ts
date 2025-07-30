import { NextRequest, NextResponse } from 'next/server'
import { NodeSSH } from 'node-ssh'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { vps_id } = await request.json()
    
    if (!vps_id) {
      return NextResponse.json(
        { success: false, error: 'VPS ID is required' },
        { status: 400 }
      )
    }

    // Buscar dados da VPS
    const { data: vps, error } = await supabaseAdmin
      .from('vps')
      .select('*')
      .eq('id', vps_id)
      .single()

    if (error || !vps) {
      return NextResponse.json(
        { success: false, error: 'VPS not found' },
        { status: 404 }
      )
    }

    // Testar conexão SSH
    const ssh = new NodeSSH()
    let isOnline = false
    let errorMessage = ''

    try {
      const connectionConfig: any = {
        host: vps.ip,
        port: vps.port || 22,
        username: vps.username,
        readyTimeout: 10000,
        // Ignorar verificação de host key (importante para VPS novas)
        algorithms: {
          serverHostKey: ['ssh-rsa', 'ssh-dss', 'ssh-ed25519', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521'],
          hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1'],
          cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes128-gcm', 'aes256-gcm']
        },
        // Callback para aceitar qualquer host key
        hostVerifier: () => true
      }

      // Configurar autenticação
      if (vps.auth_type === 'password' && vps.password_hash) {
        connectionConfig.password = vps.password_hash
      } else if (vps.auth_type === 'key' && vps.private_key) {
        connectionConfig.privateKey = vps.private_key
      } else {
        throw new Error(`No authentication method available. Auth type: ${vps.auth_type}, Has password: ${!!vps.password_hash}, Has key: ${!!vps.private_key}`)
      }

      await ssh.connect(connectionConfig)
      
      // Testar comando simples
      const result = await ssh.execCommand('echo "test"')
      
      if (result.stdout.trim() === 'test') {
        isOnline = true
      }
      
      ssh.dispose()
    } catch (err) {
      isOnline = false
      errorMessage = err instanceof Error ? err.message : 'Connection failed'
    }

    // Atualizar status no banco
    const newStatus = isOnline ? 'online' : 'offline'
    await supabaseAdmin
      .from('vps')
      .update({ 
        status: newStatus,
        last_seen: isOnline ? new Date().toISOString() : vps.last_seen
      })
      .eq('id', vps_id)

    return NextResponse.json({
      success: true,
      data: {
        vps_id,
        status: newStatus,
        online: isOnline,
        error: errorMessage || null
      }
    })

  } catch (error) {
    console.error('SSH test error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to test SSH connection' },
      { status: 500 }
    )
  }
}
