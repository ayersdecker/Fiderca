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
  const [needs] = useState<Need[]>(MOCK_NEEDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredNeeds = needs.filter(need => {
    const matchesSearch = need.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         need.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || need.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTrustLevelColor = (level: TrustLevel): string => {
    const colors = {
      core: 'text-emerald-600',
      close: 'text-blue-600',
      trusted: 'text-amber-600',
      known: 'text-stone-600'
    };
    return colors[level];
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Search by Need</h1>
        <p className="text-stone-600">
          Find connections based on what matters, not popularity
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by need or skill..."
            className="w-full px-4 py-3 border border-stone-300 focus:border-stone-900 focus:outline-none bg-white text-stone-900"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 border transition-colors ${
                selectedCategory === category
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
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
          <div className="text-center py-12 border border-stone-200 bg-white">
            <p className="text-stone-500 mb-2">No needs found</p>
            <p className="text-sm text-stone-400">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-stone-600 mb-4">
              {filteredNeeds.length} {filteredNeeds.length === 1 ? 'result' : 'results'} found
            </div>
            {filteredNeeds.map(need => (
              <div key={need.id} className="border border-stone-200 p-6 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-stone-100 border border-stone-300 text-sm font-medium text-stone-800">
                        {need.category}
                      </span>
                      <span className={`text-sm font-medium ${getTrustLevelColor(need.trustLevelRequired)}`}>
                        {need.trustLevelRequired.charAt(0).toUpperCase() + need.trustLevelRequired.slice(1)} level required
                      </span>
                    </div>
                    <p className="text-lg text-stone-900">
                      {need.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                  <div className="text-sm text-stone-600">
                    Posted by {need.postedBy} on {need.postedAt.toLocaleDateString()}
                  </div>
                  <button 
                    className="px-4 py-2 bg-stone-900 text-white hover:bg-stone-700 transition-colors"
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

      {/* Post Your Need */}
      <div className="mt-8 border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-medium text-stone-900 mb-2">
          Share Your Need
        </h2>
        <p className="text-stone-600 mb-4">
          Let your trusted connections know how they can help
        </p>
        <button className="px-6 py-3 bg-stone-900 text-white hover:bg-stone-700 transition-colors">
          Post a Need
        </button>
      </div>
    </div>
  );
}
