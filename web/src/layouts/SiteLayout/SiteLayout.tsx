import type { ReactNode } from 'react'

import Navigation from 'src/components/Navigation/Navigation'
import Footer from 'src/components/Footer/Footer'

interface SiteLayoutProps {
  children: ReactNode
}

const SiteLayout = ({ children }: SiteLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default SiteLayout
