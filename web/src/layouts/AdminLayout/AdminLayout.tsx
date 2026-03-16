import type { ReactNode } from 'react'

import { Link, routes, useMatch } from '@cedarjs/router'
import { LayoutDashboard, Package, ShoppingCart, Mail, Settings, LogOut, ChevronLeft } from 'lucide-react'

import { useAuth } from 'src/auth'
import { cn } from 'src/lib/utils'

const navItems = [
  { label: 'Dashboard', to: 'adminDashboard', icon: LayoutDashboard },
  { label: 'Orders', to: 'adminOrders', icon: ShoppingCart },
  { label: 'Products', to: 'adminProducts', icon: Package },
  { label: 'Messages', to: 'adminContactMessages', icon: Mail },
  { label: 'Settings', to: 'adminSettings', icon: Settings },
] as const

interface AdminLayoutProps {
  children: ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logOut, currentUser } = useAuth()

  return (
    <div className="flex min-h-screen bg-darker">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-white/5 bg-black">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-4">
          <img src="/images/kbr-logo.png" alt="KBR" className="h-8" />
          <span className="font-heading text-xs font-bold tracking-wider text-white/40 uppercase italic">Admin</span>
        </div>

        <nav className="flex-1 px-2 py-4">
          {navItems.map((item) => {
            const matchInfo = useMatch(routes[item.to]())
            const active = matchInfo.match
            return (
              <Link
                key={item.to}
                to={routes[item.to]()}
                className={cn(
                  'mb-1 flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-racing-red/10 text-racing-red'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <div className="mb-2 truncate px-2 text-xs text-white/30">{currentUser?.email}</div>
          <Link
            to={routes.home()}
            className="mb-1 flex items-center gap-2 rounded px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to site
          </Link>
          <button
            onClick={logOut}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
