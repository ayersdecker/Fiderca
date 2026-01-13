import { useState } from 'react';
import type { Vault } from '../types';

const MOCK_VAULTS: Vault[] = [
  {
    id: '1',
    name: 'Medical Records',
    description: 'Health information and medical history',
    createdAt: new Date('2024-01-10'),
    sharedWith: [
      {
        connectionId: '1',
        grantedAt: new Date('2024-01-10'),
        canRevoke: true
      },
      {
        connectionId: '2',
        grantedAt: new Date('2024-02-15'),
        expiresAt: new Date('2024-12-31'),
        canRevoke: true
      }
    ]
  },
  {
    id: '2',
    name: 'Professional Portfolio',
    description: 'Resume, certifications, and project work',
    createdAt: new Date('2024-03-05'),
    sharedWith: [
      {
        connectionId: '2',
        grantedAt: new Date('2024-03-05'),
        canRevoke: true
      },
      {
        connectionId: '3',
        grantedAt: new Date('2024-05-20'),
        canRevoke: true
      }
    ]
  },
  {
    id: '3',
    name: 'Personal References',
    description: 'Character references and recommendations',
    createdAt: new Date('2024-04-12'),
    sharedWith: []
  }
];

export default function Vaults() {
  const [vaults] = useState<Vault[]>(MOCK_VAULTS);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  const handleRevokeAccess = (vaultId: string, connectionId: string) => {
    // In a real app, this would call an API
    console.log(`Revoking access for connection ${connectionId} from vault ${vaultId}`);
    // Show confirmation dialog before revoking
    if (window.confirm('Are you sure you want to revoke access? This action cannot be undone.')) {
      alert('Access revoked successfully');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-stone-900 mb-2">Vaults</h1>
        <p className="text-stone-600">
          Share information selectively with temporary, revocable access
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vaults List */}
        <div className="lg:col-span-2 space-y-4">
          {vaults.map(vault => (
            <div 
              key={vault.id} 
              className={`border p-6 bg-white cursor-pointer transition-colors ${
                selectedVault?.id === vault.id 
                  ? 'border-stone-900' 
                  : 'border-stone-200 hover:border-stone-400'
              }`}
              onClick={() => setSelectedVault(vault)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-medium text-stone-900">
                    {vault.name}
                  </h3>
                  <p className="text-stone-600 mt-1">{vault.description}</p>
                </div>
                <div className="text-sm text-stone-500">
                  {vault.sharedWith.length} {vault.sharedWith.length === 1 ? 'person' : 'people'}
                </div>
              </div>
              <div className="mt-4 text-sm text-stone-500">
                Created {vault.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Access Details Panel */}
        <div className="lg:col-span-1">
          {selectedVault ? (
            <div className="border border-stone-200 p-6 bg-white sticky top-4">
              <h2 className="text-lg font-medium text-stone-900 mb-4">
                Access Control
              </h2>
              <div className="mb-4">
                <div className="text-sm font-medium text-stone-700 mb-2">
                  {selectedVault.name}
                </div>
                <div className="text-sm text-stone-600">
                  {selectedVault.sharedWith.length === 0 
                    ? 'Not shared with anyone' 
                    : `Shared with ${selectedVault.sharedWith.length} ${selectedVault.sharedWith.length === 1 ? 'person' : 'people'}`
                  }
                </div>
              </div>

              {selectedVault.sharedWith.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-stone-700 mb-2">
                    Active Access
                  </div>
                  {selectedVault.sharedWith.map((access, index) => (
                    <div key={index} className="border border-stone-200 p-3 bg-stone-50">
                      <div className="text-sm text-stone-900 mb-1">
                        Connection #{access.connectionId}
                      </div>
                      <div className="text-xs text-stone-600 mb-2">
                        Granted: {access.grantedAt.toLocaleDateString()}
                        {access.expiresAt && (
                          <div className="mt-1">
                            Expires: {access.expiresAt.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {access.canRevoke && (
                        <button
                          onClick={() => handleRevokeAccess(selectedVault.id, access.connectionId)}
                          className="text-xs px-3 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-stone-200">
                <button className="w-full px-4 py-2 bg-stone-900 text-white hover:bg-stone-700 transition-colors">
                  Grant Access
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-stone-200 p-6 bg-white text-center text-stone-500">
              Select a vault to manage access
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
