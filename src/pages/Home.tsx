import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-light text-zinc-100 mb-4">
          Connect Through Circles
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
          Small private groups for the people that matter. Share updates, coordinate tasks, and stay connected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
        <div className="border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
          <h2 className="text-lg sm:text-xl font-medium text-zinc-100 mb-3">
            🔵 Circles
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-4">
            Create private groups for family, friends, co-parents, teams, or support networks. 
            Each circle is a safe space to share and connect.
          </p>
          <Link 
            to="/circles" 
            className="inline-block px-4 py-2 text-sm sm:text-base bg-emerald-700 text-zinc-100 hover:bg-emerald-600 transition-colors"
          >
            View My Circles
          </Link>
        </div>

        <div className="border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
          <h2 className="text-lg sm:text-xl font-medium text-zinc-100 mb-3">
            ✉️ Invites
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-4">
            Join circles you've been invited to. Accept invitations from friends and family 
            to start collaborating.
          </p>
          <Link 
            to="/invites" 
            className="inline-block px-4 py-2 text-sm sm:text-base bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            View Invites
          </Link>
        </div>

        <div className="border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
          <h2 className="text-lg sm:text-xl font-medium text-zinc-100 mb-3">
            📝 Updates & Tasks
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-4">
            Share updates with your circles and coordinate tasks together. 
            Keep everyone on the same page.
          </p>
          <Link 
            to="/circles" 
            className="inline-block px-4 py-2 text-sm sm:text-base bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
          <h2 className="text-lg sm:text-xl font-medium text-zinc-100 mb-3">
            📁 Shared Files
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-4">
            Upload and share files within your circles. Keep important documents 
            accessible to your group.
          </p>
          <Link 
            to="/circles" 
            className="inline-block px-4 py-2 text-sm sm:text-base bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            Browse Circles
          </Link>
        </div>
      </div>

      <div className="mt-12 p-6 border border-zinc-800 bg-zinc-950 text-center">
        <h3 className="text-xl font-medium text-zinc-100 mb-2">Ready to get started?</h3>
        <p className="text-zinc-400 mb-4">
          Create your first circle or accept an invite to join an existing one
        </p>
        <Link
          to="/circles"
          className="inline-block px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors"
        >
          Go to Circles
        </Link>
      </div>
    </div>
  );
}
