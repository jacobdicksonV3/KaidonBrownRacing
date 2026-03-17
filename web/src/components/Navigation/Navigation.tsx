import { useState } from 'react'

import { Link, routes } from '@cedarjs/router'
import { Menu, X, Shield } from 'lucide-react'

import { useAuth } from 'src/auth'
import CartIcon from 'src/components/CartIcon/CartIcon'

const navLinks = [
  { label: 'Home', to: 'home' },
  { label: 'About', to: 'about' },
  { label: 'Shop', to: 'shop' },
  { label: 'Contact', to: 'contact' },
] as const

const Navigation = () => {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, hasRole } = useAuth()
  const isAdmin = isAuthenticated && hasRole('admin')

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/90 backdrop-blur-md">
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-racing-red/50 to-transparent" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to={routes.home()}>
          <img src="/images/kbr-logo.png" alt="Kaidon Brown Racing" className="h-10 md:h-12" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={routes[link.to]()}
              className="font-heading text-sm font-bold uppercase italic tracking-wider text-white/70 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to={routes.adminDashboard()}
              className="flex items-center gap-1.5 font-heading text-sm font-bold uppercase italic tracking-wider text-racing-red transition-colors hover:text-gold"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
          <CartIcon />
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <CartIcon />
          <button onClick={() => setOpen(!open)} className="text-white">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-black md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={routes[link.to]()}
              className="block px-4 py-3 font-heading text-sm font-bold uppercase italic tracking-wider text-white/70 transition-colors hover:bg-white/5 hover:text-gold"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to={routes.adminDashboard()}
              className="flex items-center gap-2 px-4 py-3 font-heading text-sm font-bold uppercase italic tracking-wider text-racing-red transition-colors hover:bg-white/5 hover:text-gold"
              onClick={() => setOpen(false)}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navigation
