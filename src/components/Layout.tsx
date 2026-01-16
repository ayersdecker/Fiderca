import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-light text-zinc-100">
              Fiderca
            </Link>
            <nav className="flex gap-6">
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
