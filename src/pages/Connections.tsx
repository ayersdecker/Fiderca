import { useState, useEffect, useRef } from 'react';
import type { TrustLevel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import {
  subscribeToReceivedRequests,
  subscribeToAcceptedSentRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  sendConnectionRequest,
  checkExistingRequest,
  type ConnectionRequest,
} from '../services/connectionRequests';
import { searchUsersByEmail, type UserProfile } from '../services/users';
import { updateConnection } from '../services/firestore';

const TRUST_LEVEL_INFO: Record<TrustLevel, { label: string; description: string; color: string }> = {
  core: {
    label: 'Core',
    description: 'Your innermost circle - family and closest friends',
    color: 'bg-emerald-900 text-emerald-200 border-emerald-700'
  },
  close: {
    label: 'Close',
    description: 'Close friends and trusted colleagues',
    color: 'bg-blue-900 text-blue-200 border-blue-700'
  },
  trusted: {
    label: 'Trusted',
    description: 'People you trust but don\'t know deeply',
    color: 'bg-amber-900 text-amber-200 border-amber-700'
  },
  known: {
    label: 'Known',
    description: 'Acquaintances and new connections',
    color: 'bg-zinc-800 text-zinc-300 border-zinc-700'
  }
};

export default function Connections() {
  const { user } = useAuth();
  const { connections, deleteConnection } = useUserData();
  const [selectedTrustLevel, setSelectedTrustLevel] = useState<TrustLevel | 'all'>('all');
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingTrustLevel, setEditingTrustLevel] = useState<string | null>(null);

  // Subscribe to connection requests
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToReceivedRequests(user.sub, (requests) => {
      setPendingRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to accepted sent requests and auto-add connections
  const processedRequestsRef = useRef(new Set<string>());
  
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAcceptedSentRequests(user.sub, async (request) => {
      // Avoid processing the same request multiple times (persists across renders)
      if (processedRequestsRef.current.has(request.id)) return;
      processedRequestsRef.current.add(request.id);

      // Check if connection already exists in our current state
      const existingConnection = connections.find(c => c.id === request.toUserId);
      if (existingConnection) return;

      // Add connection for the sender (current user)
      try {
        await acceptConnectionRequest(request.id, user.sub);
      } catch (error) {
        console.error('Error auto-adding accepted connection:', error);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const filteredConnections = selectedTrustLevel === 'all' 
    ? connections 
    : connections.filter(c => c.trustLevel === selectedTrustLevel);

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

  const handleUpdateTrustLevel = async (connectionId: string, newTrustLevel: TrustLevel) => {
    if (!user) return;
    
    try {
      await updateConnection(user.sub, connectionId, { trustLevel: newTrustLevel });
      setEditingTrustLevel(null);
      setSuccessMessage('Trust level updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Update trust level error:', err);
      setError('Failed to update trust level. Please try again.');
    }
  };

  const handleAcceptRequest = async (request: ConnectionRequest) => {
    if (!user) return;

    try {
      // Accept the request - this adds connection to current user only
      // The sender will see accepted status and can add on their end
      await acceptConnectionRequest(request.id, user.sub);
      setSuccessMessage(`You're now connected with ${request.fromUserName}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Failed to accept connection request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectConnectionRequest(requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject connection request. Please try again.');
    }
  };

  const handleDeleteConnection = (id: string) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      deleteConnection(id);
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-light text-zinc-100 mb-2">Connections</h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Search for people and manage your network with trust levels
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-6 border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">Find People</h2>
        <form onSubmit={handleSearch} className="mb-4">
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
            <h3 className="text-sm font-medium text-zinc-300">Search Results</h3>
            {searchResults.map((result) => {
              const isConnected = connections.some((conn) => conn.id === result.userId);
              
              return (
                <div
                  key={result.userId}
                  className="p-4 bg-zinc-900 border border-zinc-800 flex items-center justify-between"
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
      </div>

      {/* Pending Connection Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-6 border border-amber-800 bg-amber-900/10 p-4 sm:p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-900 text-amber-200 text-xs font-bold">
              {pendingRequests.length}
            </span>
            Pending Requests
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={request.fromUserPicture}
                    alt={request.fromUserName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-zinc-100 font-medium">{request.fromUserName}</div>
                    <div className="text-sm text-zinc-400">{request.fromUserEmail}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <button
                    onClick={() => handleAcceptRequest(request)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-emerald-900 text-emerald-200 border border-emerald-700 hover:bg-emerald-800 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust Level Legend */}
      <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-100 mb-3">Trust Levels</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {(Object.entries(TRUST_LEVEL_INFO) as [TrustLevel, typeof TRUST_LEVEL_INFO[TrustLevel]][]).map(([level, info]) => (
            <div key={level} className="flex items-center gap-2">
              <div className={`px-2 py-1 border text-xs font-medium ${info.color}`}>
                {info.label}
              </div>
              <p className="text-xs text-zinc-500 hidden lg:block">{info.description.split(' - ')[0]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedTrustLevel('all')}
          className={`px-4 py-2 border transition-colors ${
            selectedTrustLevel === 'all'
              ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
          }`}
        >
          All
        </button>
        {(Object.keys(TRUST_LEVEL_INFO) as TrustLevel[]).map(level => (
          <button
            key={level}
            onClick={() => setSelectedTrustLevel(level)}
            className={`px-4 py-2 border transition-colors ${
              selectedTrustLevel === level
                ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            {TRUST_LEVEL_INFO[level].label}
          </button>
        ))}
      </div>

      {/* Connections List */}
      <div className="space-y-4">
        {filteredConnections.length === 0 ? (
          <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
            <p className="text-zinc-500 mb-2">No connections found</p>
            <p className="text-sm text-zinc-600">
              Search for people above to send connection requests
            </p>
          </div>
        ) : (
          filteredConnections.map(connection => (
            <div key={connection.id} className="border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={connection.picture}
                    alt={connection.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg sm:text-xl font-medium text-zinc-100">
                      {connection.name}
                    </h3>
                    <div className="text-sm text-zinc-400">{connection.email}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      Connected {connection.connectedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  {editingTrustLevel === connection.id ? (
                    <div className="flex flex-col gap-2">
                      <select
                        value={connection.trustLevel}
                        onChange={(e) => handleUpdateTrustLevel(connection.id, e.target.value as TrustLevel)}
                        className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600"
                      >
                        {(Object.keys(TRUST_LEVEL_INFO) as TrustLevel[]).map(level => (
                          <option key={level} value={level}>{TRUST_LEVEL_INFO[level].label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingTrustLevel(null)}
                        className="text-xs px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingTrustLevel(connection.id)}
                        className={`px-3 py-1 border text-sm font-medium ${
                          TRUST_LEVEL_INFO[connection.trustLevel].color
                        } hover:opacity-80 transition-opacity`}
                      >
                        {TRUST_LEVEL_INFO[connection.trustLevel].label}
                      </button>
                      <button
                        onClick={() => handleDeleteConnection(connection.id)}
                        className="text-xs px-3 py-1 bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
              {connection.notes && (
                <p className="mt-3 text-sm text-zinc-400">{connection.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
