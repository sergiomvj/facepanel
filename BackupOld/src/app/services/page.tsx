import { useEffect, useState } from 'react';
import { VPS } from '@/types';
import { VPSCard } from '@/components/VPSCard';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export default function ServicesPanel() {
  const [vpsList, setVpsList] = useState<VPS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVPS() {
      try {
        const response = await fetch('/api/vps');
        const data = await response.json();
        if (data.success) {
          setVpsList(data.data);
        }
      } catch (error) {
        console.error('Erro ao buscar VPS:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVPS();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Painel de Serviços por VPS</h1>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Carregando VPS...</div>
            ) : vpsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vpsList.map(vps => (
                  <VPSCard key={vps.id} vps={vps} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Nenhuma VPS cadastrada.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
