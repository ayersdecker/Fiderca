import { useState } from 'react';
import type { Need, TrustLevel } from '../types';

const MOCK_NEEDS: Need[] = [
  {
    id: '1',
    category: 'Professional',
    description: 'Looking for a software architect to review system design',
    postedBy: 'Marcus Johnson',
    postedAt: new Date('2024-01-15'),
    trustLevelRequired: 'trusted'
  },
  {
    id: '2',
    category: 'Personal',
    description: 'Need recommendations for family therapist',
    postedBy: 'Sarah Chen',
    postedAt: new Date('2024-01-18'),
    trustLevelRequired: 'close'
  },
  {
    id: '3',
    category: 'Skill Share',
    description: 'Can teach Spanish, looking to learn Python',
    postedBy: 'Elena Rodriguez',
    postedAt: new Date('2024-01-20'),
    trustLevelRequired: 'known'
  },
  {
    id: '4',
    category: 'Professional',
    description: 'Seeking mentorship in product management transition',
    postedBy: 'David Kim',
    postedAt: new Date('2024-01-22'),
    trustLevelRequired: 'trusted'
  }
];

const CATEGORIES = ['All', 'Professional', 'Personal', 'Skill Share', 'Community'];

export default function Search() {
  const [needs, setNeeds] = useState<Need[]>(MOCK_NEEDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPostForm, setShowPostForm] = useState(false);
  const [newNeed, setNewNeed] = useState({
    category: 'Professional',
    description: '',
    trustLevelRequired: 'known' as TrustLevel
  });

  const handlePostNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNeed.description.trim()) {
      const need: Need = {
        id: String(needs.length + 1),
        category: newNeed.category,
        description: newNeed.description,
        postedBy: 'You',
        postedAt: new Date(),
        trustLevelRequired: newNeed.trustLevelRequired
      };
      setNeeds([...needs, need]);
      setNewNeed({ category: 'Professional', description: '', trustLevelRequired: 'known' });
      setShowPostForm(false);
    }
  };

  const filteredNeeds = needs.filter(need => {
    const matchesSearch = need.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         need.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || need.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTrustLevelColor = (level: TrustLevel): string => {
    const colors = {
      core: 'text-emerald-400',
      close: 'text-blue-400',
      trusted: 'text-amber-400',
      known: 'text-zinc-400'
    };
    return colors[level];
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-zinc-100 mb-2">Search by Need</h1>
          <p className="text-zinc-400">
            Find connections based on what matters, not popularity
          </p>
        </div>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
        >
          {showPostForm ? 'Cancel' : 'Post a Need'}
        </button>
      </div>

      {/* Post Need Form */}
      {showPostForm && (
        <div className="mb-6 border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">Share Your Need</h2>
          <form onSubmit={handlePostNeed} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Category</label>
              <select
                value={newNeed.category}
                onChange={(e) => setNewNeed({ ...newNeed, category: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
              >
                {CATEGORIES.filter(c => c !== 'All').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Description</label>
              <textarea
                value={newNeed.description}
                onChange={(e) => setNewNeed({ ...newNeed, description: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                rows={3}
                placeholder="Describe your need or what you can offer"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Trust Level Required</label>
              <select
                value={newNeed.trustLevelRequired}
                onChange={(e) => setNewNeed({ ...newNeed, trustLevelRequired: e.target.value as TrustLevel })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
              >
                <option value="known">Known</option>
                <option value="trusted">Trusted</option>
                <option value="close">Close</option>
                <option value="core">Core</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
            >
              Post Need
            </button>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by need or skill..."
            className="w-full px-4 py-3 border border-zinc-800 bg-zinc-950 text-zinc-100 focus:border-zinc-600 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border transition-colors ${
                selectedCategory === category
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredNeeds.length === 0 ? (
          <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
            <p className="text-zinc-500 mb-2">No needs found</p>
            <p className="text-sm text-zinc-600">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-zinc-400 mb-4">
              {filteredNeeds.length} {filteredNeeds.length === 1 ? 'result' : 'results'} found
            </div>
            {filteredNeeds.map(need => (
              <div key={need.id} className="border border-zinc-800 p-6 bg-zinc-950">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300">
                        {need.category}
                      </span>
                      <span className={`text-sm font-medium ${getTrustLevelColor(need.trustLevelRequired)}`}>
                        {need.trustLevelRequired.charAt(0).toUpperCase() + need.trustLevelRequired.slice(1)} level required
                      </span>
                    </div>
                    <p className="text-lg text-zinc-100">
                      {need.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                  <div className="text-sm text-zinc-400">
                    Posted by {need.postedBy} on {need.postedAt.toLocaleDateString()}
                  </div>
                  <button 
                    className="px-4 py-2 bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors"
                    onClick={() => {
                      if (window.confirm('Do you want to respond to this need? This will share your contact information with the poster.')) {
                        alert('Response sent! The connection has been notified.');
                      }
                    }}
                  >
                    Respond
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
