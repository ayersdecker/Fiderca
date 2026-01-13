import { useState } from 'react';
import type { Connection, TrustLevel } from '../types';

const MOCK_CONNECTIONS: Connection[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    trustLevel: 'core',
    connectedAt: new Date('2024-01-15'),
    notes: 'Close friend from college'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    trustLevel: 'close',
    connectedAt: new Date('2024-03-20'),
    notes: 'Mentor in career transition'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    trustLevel: 'trusted',
    connectedAt: new Date('2024-06-10')
  },
  {
    id: '4',
    name: 'David Kim',
    trustLevel: 'known',
    connectedAt: new Date('2024-08-01')
  }
];

const TRUST_LEVEL_INFO: Record<TrustLevel, { label: string; description: string; color: string }> = {
  core: {
    label: 'Core',
    description: 'Your innermost circle - family and closest friends',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  close: {
    label: 'Close',
    description: 'Close friends and trusted colleagues',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  trusted: {
    label: 'Trusted',
    description: 'People you trust but don\'t know deeply',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  known: {
    label: 'Known',
    description: 'Acquaintances and new connections',
    color: 'bg-stone-100 text-stone-800 border-stone-300'
  }
};

export default function Connections() {
  const [connections] = useState<Connection[]>(MOCK_CONNECTIONS);
  const [selectedTrustLevel, setSelectedTrustLevel] = useState<TrustLevel | 'all'>('all');

  const filteredConnections = selectedTrustLevel === 'all' 
    ? connections 
    : connections.filter(c => c.trustLevel === selectedTrustLevel);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Connections</h1>
        <p className="text-stone-600">
          Your intentional network, organized by trust levels
        </p>
      </div>

      {/* Trust Level Legend */}
      <div className="mb-8 p-6 bg-white border border-stone-200">
        <h2 className="text-lg font-medium text-stone-900 mb-4">Trust Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(TRUST_LEVEL_INFO) as [TrustLevel, typeof TRUST_LEVEL_INFO[TrustLevel]][]).map(([level, info]) => (
            <div key={level} className="flex items-start gap-3">
              <div className={`px-3 py-1 border text-sm font-medium ${info.color}`}>
                {info.label}
              </div>
              <p className="text-sm text-stone-600">{info.description}</p>
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
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
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
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
            }`}
          >
            {TRUST_LEVEL_INFO[level].label}
          </button>
        ))}
      </div>

      {/* Connections List */}
      <div className="space-y-4">
        {filteredConnections.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            No connections found
          </div>
        ) : (
          filteredConnections.map(connection => (
            <div key={connection.id} className="border border-stone-200 p-6 bg-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-medium text-stone-900">
                    {connection.name}
                  </h3>
                  <div className={`inline-block mt-2 px-3 py-1 border text-sm font-medium ${
                    TRUST_LEVEL_INFO[connection.trustLevel].color
                  }`}>
                    {TRUST_LEVEL_INFO[connection.trustLevel].label}
                  </div>
                </div>
                <div className="text-sm text-stone-500">
                  Connected {connection.connectedAt.toLocaleDateString()}
                </div>
              </div>
              {connection.notes && (
                <p className="mt-3 text-stone-600">{connection.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
