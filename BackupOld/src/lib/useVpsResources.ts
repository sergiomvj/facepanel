import { useEffect, useState } from 'react';

export type VPSResources = {
  cpu: number;
  memory: number;
  disk: number;
  bandwidth: number;
};

export function useVpsResources(vpsId: string) {
  const [resources, setResources] = useState<VPSResources | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para gerar dados mockados aleatórios
  function generateMockResources() {
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
      bandwidth: Math.floor(Math.random() * 100),
    };
  }

  useEffect(() => {
    if (!vpsId) return;
    setLoading(true);
    // Atualiza a cada 10 segundos
    const fetchResources = () => {
      // Para visualização, usa dados mockados
      setResources(generateMockResources());
      setLoading(false);
      setError(null);
    };
    fetchResources();
    const interval = setInterval(fetchResources, 10000);
    return () => clearInterval(interval);
  }, [vpsId]);

  return { resources, loading, error };
}
