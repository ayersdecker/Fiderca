import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-zinc-100 mb-4">
          Network with Purpose
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Build intentional connections based on trust, not popularity. 
          Share what matters with those who matter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-xl font-medium text-zinc-100 mb-3">
            Trust-Based Connections
          </h2>
          <p className="text-zinc-400 mb-4">
            Organize relationships by trust levels: core, close, trusted, and known.
            Each connection is intentional and meaningful.
          </p>
          <Link 
            to="/connections" 
            className="inline-block px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
          >
            Manage Connections
          </Link>
        </div>

        <div className="border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-xl font-medium text-zinc-100 mb-3">
            Permissioned Vaults
          </h2>
          <p className="text-zinc-400 mb-4">
            Share information selectively. Grant temporary access that can be revoked
            at any time.
          </p>
          <Link 
            to="/vaults" 
            className="inline-block px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
          >
            View Vaults
          </Link>
        </div>

        <div className="border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-xl font-medium text-zinc-100 mb-3">
            Calendar Planning
          </h2>
          <p className="text-zinc-400 mb-4">
            Coordinate with your connections. Share events based on trust levels
            and relationship context.
          </p>
          <Link 
            to="/calendar" 
            className="inline-block px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
          >
            Open Calendar
          </Link>
        </div>

        <div className="border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-xl font-medium text-zinc-100 mb-3">
            Search by Need
          </h2>
          <p className="text-zinc-400 mb-4">
            Find connections based on what you need or what you can offer.
            Not by likes, not by followers.
          </p>
          <Link 
            to="/search" 
            className="inline-block px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
          >
            Start Search
          </Link>
        </div>
      </div>
    </div>
  );
}
