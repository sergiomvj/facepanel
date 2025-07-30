// Tipo para representar um serviço ou projeto instalado em uma VPS
export type VPSService = {
  id: string;
  vpsId: string;
  name: string;
  type: 'wordpress' | 'serverweb' | 'n8n' | 'evolution' | 'chatwoot' | 'portainer' | 'outro';
  status: 'instalado' | 'executando' | 'parado' | 'erro' | 'removido';
  installedAt: Date;
  updatedAt?: Date;
  dependencies?: string[];
  logs?: string[];
  config?: Record<string, any>;
};

// Tipo para listagem de serviços por VPS
export type VPSServiceList = VPSService[];
