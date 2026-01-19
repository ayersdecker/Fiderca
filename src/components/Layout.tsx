import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl sm:text-2xl font-light text-zinc-100">
              Fiderca
            </Link>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              <Link 
                to="/connections" 
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Connections
              </Link>
              <Link 
                to="/vaults" 
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Vaults
              </Link>
              <Link 
                to="/calendar" 
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Calendar
              </Link>
              <Link 
                to="/search" 
                className="text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Search
              </Link>
              {user && (
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-zinc-700">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-zinc-300 text-sm hidden lg:inline">{user.name}</span>
                  <button
                    onClick={logout}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
              <Link 
                to="/connections" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors py-2"
              >
                Connections
              </Link>
              <Link 
                to="/vaults" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors py-2"
              >
                Vaults
              </Link>
              <Link 
                to="/calendar" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors py-2"
              >
                Calendar
              </Link>
              <Link 
                to="/search" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 transition-colors py-2"
              >
                Search
              </Link>
              {user && (
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-zinc-300 text-sm">{user.name}</span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm ml-auto"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800 bg-zinc-950 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-zinc-500">
          Intentional connections, meaningful relationships
        </div>
      </footer>
    </div>
  );
}
