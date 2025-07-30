import { NextRequest, NextResponse } from 'next/server';
import { VPSService } from '@/types/services';

// Simulação de armazenamento em memória (substituir por banco de dados real)
let services: VPSService[] = [];

// GET: Listar serviços de uma VPS
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const vpsServices = services.filter(s => s.vpsId === id);
  return NextResponse.json(vpsServices);
}

// POST: Adicionar serviço à VPS
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await req.json();
  const newService: VPSService = {
    ...data,
    id: crypto.randomUUID(),
    vpsId: id,
    installedAt: new Date(),
    status: 'instalado',
  };
  services.push(newService);
  return NextResponse.json(newService);
}

// PATCH: Atualizar serviço
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const data = await req.json();
  const idx = services.findIndex(s => s.id === data.id && s.vpsId === id);
  if (idx === -1) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
  services[idx] = { ...services[idx], ...data, updatedAt: new Date() };
  return NextResponse.json(services[idx]);
}

// DELETE: Remover serviço
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { serviceId } = await req.json();
  services = services.filter(s => !(s.id === serviceId && s.vpsId === id));
  return NextResponse.json({ success: true });
}
