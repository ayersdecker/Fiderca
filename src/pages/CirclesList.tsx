import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCircle, getUserCircles } from '../services/circles';
import type { Circle, CircleType } from '../types/circles';

const CIRCLE_TYPES: Array<{ value: CircleType; label: string; icon: string }> = [
  { value: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'Co-parents', label: 'Co-parents', icon: '👨‍👧‍👦' },
  { value: 'Friends', label: 'Friends', icon: '🤝' },
  { value: 'Team', label: 'Team', icon: '💼' },
  { value: 'Support', label: 'Support', icon: '❤️' },
];

export default function CirclesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newCircle, setNewCircle] = useState({
    name: '',
    type: 'Friends' as CircleType,
  });

  useEffect(() => {
    if (user) {
      loadCircles();
    }
  }, [user]);

  const loadCircles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userCircles = await getUserCircles(user.sub);
      setCircles(userCircles);
    } catch (err) {
      console.error('Error loading circles:', err);
      setError('Failed to load circles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setCreating(true);
    setError(null);
    
    try {
      const circleId = await createCircle(
        newCircle.name,
        newCircle.type,
        user.sub
      );
      
      // Navigate to the new circle
      navigate(`/circles/${circleId}`);
    } catch (err) {
      console.error('Error creating circle:', err);
      setError('Failed to create circle. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getCircleIcon = (type: CircleType) => {
    return CIRCLE_TYPES.find(t => t.value === type)?.icon || '●';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-400">Loading circles...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-zinc-100">My Circles</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Private groups for the people that matter
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ New Circle'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 text-red-400">
          {error}
        </div>
      )}

      {/* Create Circle Form */}
      {showCreateForm && (
        <div className="p-6 bg-zinc-950 border border-zinc-800">
          <h2 className="text-xl font-medium text-zinc-100 mb-4">Create New Circle</h2>
          <form onSubmit={handleCreateCircle} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                Circle Name
              </label>
              <input
                id="name"
                type="text"
                value={newCircle.name}
                onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-zinc-500"
                placeholder="My Family, Work Team, etc."
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-zinc-300 mb-1">
                Circle Type
              </label>
              <select
                id="type"
                value={newCircle.type}
                onChange={(e) => setNewCircle({ ...newCircle, type: e.target.value as CircleType })}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                {CIRCLE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Circle'}
            </button>
          </form>
        </div>
      )}

      {/* Circles List */}
      {circles.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
          <p className="text-zinc-400 mb-4">You haven't joined any circles yet</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors"
          >
            Create Your First Circle
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {circles.map((circle) => (
            <button
              key={circle.id}
              onClick={() => navigate(`/circles/${circle.id}`)}
              className="p-6 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getCircleIcon(circle.type)}</span>
                <div>
                  <h3 className="text-xl font-medium text-zinc-100">{circle.name}</h3>
                  <p className="text-sm text-zinc-500">{circle.type}</p>
                </div>
              </div>
              <div className="text-xs text-zinc-600 mt-3">
                Created {circle.createdAt.toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
