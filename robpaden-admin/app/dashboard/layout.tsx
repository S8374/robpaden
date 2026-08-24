import { Bell, Search } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden selection:bg-primary/20">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-zinc-200 z-10 sticky top-0">
          <div className="flex items-center">
            <h1 className="text-zinc-600 font-medium text-sm">Dashboard</h1>
          </div>
          
          <div className="flex items-center">
            <button className="relative p-2 text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 relative">
           {children}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
