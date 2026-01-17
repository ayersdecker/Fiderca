import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-light text-zinc-100">
              Fiderca
            </Link>
            <nav className="flex gap-6 items-center">
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
                  <span className="text-zinc-300 text-sm">{user.name}</span>
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
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-zinc-800 bg-zinc-950 py-4">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-zinc-500">
          Intentional connections, meaningful relationships
        </div>
      </footer>
    </div>
  );
}
