import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { searchUsersByEmail, type UserProfile } from '../services/users';
import { 
  sendConnectionRequest, 
  checkExistingRequest 
} from '../services/connectionRequests';

export default function Search() {
  const { user } = useAuth();
  const { connections } = useUserData();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setIsSearching(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const results = await searchUsersByEmail(searchEmail.toLowerCase().trim());
      // Filter out current user only
      const filteredResults = results.filter(
        (result) => result.userId !== user?.sub
      );
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setError('No users found with that email.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (toUser: UserProfile) => {
    if (!user) return;

    setError(null);
    setSuccessMessage(null);

    try {
      // Check if request already exists
      const exists = await checkExistingRequest(user.sub, toUser.userId);
      if (exists) {
        setError('A connection request already exists with this user.');
        return;
      }

      await sendConnectionRequest(
        user.sub,
        user.name,
        user.email,
        user.picture,
        toUser.userId,
        toUser.name,
        toUser.email,
        toUser.picture
      );

      setSuccessMessage(`Connection request sent to ${toUser.name}!`);
      // Remove from search results
      setSearchResults(searchResults.filter((u) => u.userId !== toUser.userId));
    } catch (err) {
      console.error('Send request error:', err);
      setError('Failed to send connection request. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-zinc-100 mb-2">
          Find Connections
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Search for people by email and send connection requests
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by email..."
            className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 sm:px-6 py-2 bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-800 text-emerald-400 text-sm">
          {successMessage}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-zinc-100">Search Results</h2>
          {searchResults.map((result) => {
            const isConnected = connections.some((conn) => conn.id === result.userId);
            
            return (
              <div
                key={result.userId}
                className="p-4 bg-zinc-950 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={result.picture}
                    alt={result.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-zinc-100 font-medium">{result.name}</div>
                    <div className="text-sm text-zinc-400">{result.email}</div>
                  </div>
                </div>
                {isConnected ? (
                  <div className="px-4 py-2 text-sm text-emerald-400 border border-emerald-800 bg-emerald-900/20">
                    Already Connected
                  </div>
                ) : (
                  <button
                    onClick={() => handleSendRequest(result)}
                    className="px-4 py-2 text-sm bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    Send Request
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {searchResults.length === 0 && searchEmail && !isSearching && !error && (
        <div className="text-center py-12 text-zinc-400">
          No results to display. Try searching for a user by email.
        </div>
      )}

      {!searchEmail && (
        <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
          <p className="text-zinc-400 mb-2">Start by searching for users</p>
          <p className="text-sm text-zinc-500">
            Enter an email address above to find and connect with people
          </p>
        </div>
      )}
    </div>
  );
}
