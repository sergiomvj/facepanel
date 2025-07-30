import { NextRequest, NextResponse } from 'next/server';

// Simulação de dados de monitoramento (substituir por integração real)
const vpsResources: Record<string, {
  cpu: number; // %
  memory: number; // %
  disk: number; // %
  bandwidth: number; // %
}> = {
  'vps-1': { cpu: 35, memory: 60, disk: 40, bandwidth: 20 },
  'vps-2': { cpu: 80, memory: 90, disk: 70, bandwidth: 50 },
  // Adicione mais VPS conforme necessário
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const resources = vpsResources[id] || { cpu: 0, memory: 0, disk: 0, bandwidth: 0 };
  return NextResponse.json(resources);
}
