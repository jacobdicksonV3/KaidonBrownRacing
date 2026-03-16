import { Link, routes } from '@cedarjs/router'

const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 bg-black">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-racing-red to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <img src="/images/kbr-logo.png" alt="Kaidon Brown Racing" className="h-12" />
            <p className="mt-3 text-sm text-white/40">
              3x Australian Speedcar Champion
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm tracking-wider text-gold">
              QUICK LINKS
            </h4>
            <div className="mt-3 flex flex-col gap-2">
              <Link to={routes.home()} className="text-sm text-white/40 hover:text-gold">Home</Link>
              <Link to={routes.about()} className="text-sm text-white/40 hover:text-gold">About</Link>
              <Link to={routes.shop()} className="text-sm text-white/40 hover:text-gold">Shop</Link>
              <Link to={routes.contact()} className="text-sm text-white/40 hover:text-gold">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-sm tracking-wider text-gold">
              FOLLOW US
            </h4>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="https://www.facebook.com/kaidonbrownracing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-gold"
              >
                Facebook
              </a>
              <a
                href="https://www.instagram.com/kaidonbrownracing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/40 hover:text-gold"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 border-t border-white/5 pt-8 text-sm text-white/30 sm:flex-row sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Kaidon Brown Racing. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <span>Built by</span>
            <a href="https://distinct.au" target="_blank" rel="noopener noreferrer"><img src="/images/distinct-logo.png" alt="Distinct" className="h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
