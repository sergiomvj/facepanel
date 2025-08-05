'use client'

import { Sidebar } from '@/components/ui/sidebar'

export default function DomainsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b h-14 flex items-center px-6">
          <h1 className="text-xl font-semibold">Domains</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {/* Content for the Domains page will go here */}
          <div className="flex items-center justify-center h-full border-2 border-dashed border-muted rounded-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Domains Management</h2>
              <p className="text-muted-foreground mt-2">This section is under construction.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
