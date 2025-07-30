'use client'

export function Navbar() {
  // Buscar dados das VPS do localStorage (mock) ou via API global
  let totalVPS = 0, onlineVPS = 0, offlineVPS = 0;
  if (typeof window !== 'undefined') {
    try {
      const vpsList = JSON.parse(localStorage.getItem('vpsList') || '[]');
      totalVPS = vpsList.length;
      onlineVPS = vpsList.filter((v: any) => v.status === 'online').length;
      offlineVPS = vpsList.filter((v: any) => v.status === 'offline').length;
    } catch {}
  }
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FacePanel <span className="ml-2 text-base font-normal text-gray-500">Dashboard</span></h1>
            </div>
            <div className="ml-8 flex gap-6 text-sm text-gray-700">
              <span>Total VPS: <span className="font-bold">{totalVPS}</span></span>
              <span>Online: <span className="font-bold text-green-600">{onlineVPS}</span></span>
              <span>Offline: <span className="font-bold text-red-500">{offlineVPS}</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* ...botoes existentes... */}
          </div>
        </div>
      </div>
    </nav>
  )
}
