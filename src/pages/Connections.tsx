import { useState, useEffect } from 'react';
import type { TrustLevel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import {
  subscribeToReceivedRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  type ConnectionRequest,
} from '../services/connectionRequests';
import { addConnection } from '../services/firestore';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [newConnection, setNewConnection] = useState({
    name: '',
    trustLevel: 'known' as TrustLevel,
    notes: ''
  });

  // Subscribe to connection requests
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToReceivedRequests(user.sub, (requests) => {
      setPendingRequests(requests);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredConnections = selectedTrustLevel === 'all' 
    ? connections 
    : connections.filter(c => c.trustLevel === selectedTrustLevel);

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConnection.name.trim() && user) {
      addConnection(user.sub, {
        name: newConnection.name,
        trustLevel: newConnection.trustLevel,
        notes: newConnection.notes || undefined
      });
      setNewConnection({ name: '', trustLevel: 'known', notes: '' });
      setShowAddForm(false);
    }
  };

  const handleAcceptRequest = async (request: ConnectionRequest) => {
    if (!user) return;

    try {
      // Accept the request
      await acceptConnectionRequest(request.id);
      
      // Add to connections
      await addConnection(user.sub, {
        name: request.fromUserName,
        trustLevel: 'known',
        notes: `Connected via ${request.fromUserEmail}`,
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept connection request. Please try again.');
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
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-zinc-100 mb-2">Connections</h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Your intentional network, organized by trust levels
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Connection'}
        </button>
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

      {/* Add Connection Form */}
      {showAddForm && (
        <div className="mb-6 border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">New Connection</h2>
          <form onSubmit={handleAddConnection} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={newConnection.name}
                onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Trust Level</label>
              <select
                value={newConnection.trustLevel}
                onChange={(e) => setNewConnection({ ...newConnection, trustLevel: e.target.value as TrustLevel })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
              >
                {(Object.keys(TRUST_LEVEL_INFO) as TrustLevel[]).map(level => (
                  <option key={level} value={level}>{TRUST_LEVEL_INFO[level].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Notes (optional)</label>
              <textarea
                value={newConnection.notes}
                onChange={(e) => setNewConnection({ ...newConnection, notes: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                rows={3}
                placeholder="Add some context about this connection"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              Add Connection
            </button>
          </form>
        </div>
      )}

      {/* Trust Level Legend */}
      <div className="mb-8 p-6 bg-zinc-950 border border-zinc-800">
        <h2 className="text-lg font-medium text-zinc-100 mb-4">Trust Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(TRUST_LEVEL_INFO) as [TrustLevel, typeof TRUST_LEVEL_INFO[TrustLevel]][]).map(([level, info]) => (
            <div key={level} className="flex items-start gap-3">
              <div className={`px-3 py-1 border text-sm font-medium ${info.color}`}>
                {info.label}
              </div>
              <p className="text-sm text-zinc-400">{info.description}</p>
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
          <div className="text-center py-12 text-zinc-500">
            No connections found
          </div>
        ) : (
          filteredConnections.map(connection => (
            <div key={connection.id} className="border border-zinc-800 p-6 bg-zinc-950">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-medium text-zinc-100">
                    {connection.name}
                  </h3>
                  <div className={`inline-block mt-2 px-3 py-1 border text-sm font-medium ${
                    TRUST_LEVEL_INFO[connection.trustLevel].color
                  }`}>
                    {TRUST_LEVEL_INFO[connection.trustLevel].label}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-zinc-500">
                    Connected {connection.connectedAt.toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="text-xs px-3 py-1 bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {connection.notes && (
                <p className="mt-3 text-zinc-400">{connection.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
