import { useEffect, useState } from 'react';
import { VPSService } from '@/types/services';

export function useVpsServices(vpsId: string) {
  const [services, setServices] = useState<VPSService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vpsId) return;
    setLoading(true);
    fetch(`/api/vps/${vpsId}/services`)
      .then(res => res.json())
      .then(setServices)
      .catch(err => setError('Erro ao carregar serviços'))
      .finally(() => setLoading(false));
  }, [vpsId]);

  return { services, loading, error };
}
