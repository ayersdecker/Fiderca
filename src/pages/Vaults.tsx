import { useState } from 'react';
import type { Vault } from '../types';
import { useUserData } from '../contexts/UserDataContext';

export default function Vaults() {
  const { vaults, connections, addVault, updateVault } = useUserData();
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVault, setNewVault] = useState({
    name: '',
    description: ''
  });

  const handleAddVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVault.name.trim()) {
      addVault({
        name: newVault.name,
        description: newVault.description
      });
      setNewVault({ name: '', description: '' });
      setShowAddForm(false);
    }
  };

  const handleRevokeAccess = (vaultId: string, connectionId: string) => {
    if (window.confirm('Are you sure you want to revoke access? This action cannot be undone.')) {
      const vault = vaults.find(v => v.id === vaultId);
      if (vault) {
        updateVault(vaultId, {
          sharedWith: vault.sharedWith.filter(access => access.connectionId !== connectionId)
        });
        if (selectedVault?.id === vaultId) {
          setSelectedVault({
            ...vault,
            sharedWith: vault.sharedWith.filter(access => access.connectionId !== connectionId)
          });
        }
      }
    }
  };

  const handleGrantAccess = (vaultId: string) => {
    const connectionId = window.prompt('Enter connection ID to grant access:');
    if (connectionId) {
      const vault = vaults.find(v => v.id === vaultId);
      if (vault) {
        updateVault(vaultId, {
          sharedWith: [
            ...vault.sharedWith,
            {
              connectionId,
              grantedAt: new Date(),
              canRevoke: true
            }
          ]
        });
        if (selectedVault?.id === vaultId) {
          setSelectedVault({
            ...vault,
            sharedWith: [
              ...vault.sharedWith,
              {
                connectionId,
                grantedAt: new Date(),
                canRevoke: true
              }
            ]
          });
        }
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-zinc-100 mb-2">Vaults</h1>
          <p className="text-zinc-400">
            Share information selectively with temporary, revocable access
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Create Vault'}
        </button>
      </div>

      {/* Add Vault Form */}
      {showAddForm && (
        <div className="mb-6 border border-zinc-800 p-6 bg-zinc-950">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">New Vault</h2>
          <form onSubmit={handleAddVault} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                type="text"
                value={newVault.name}
                onChange={(e) => setNewVault({ ...newVault, name: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                placeholder="e.g., Medical Records"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Description</label>
              <textarea
                value={newVault.description}
                onChange={(e) => setNewVault({ ...newVault, description: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                rows={3}
                placeholder="Describe what this vault contains"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            >
              Create Vault
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vaults List */}
        <div className="lg:col-span-2 space-y-4">
          {vaults.map(vault => (
            <div 
              key={vault.id} 
              className={`border p-6 bg-zinc-950 cursor-pointer transition-colors ${
                selectedVault?.id === vault.id 
                  ? 'border-zinc-100' 
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
              onClick={() => setSelectedVault(vault)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-medium text-zinc-100">
                    {vault.name}
                  </h3>
                  <p className="text-zinc-400 mt-1">{vault.description}</p>
                </div>
                <div className="text-sm text-zinc-500">
                  {vault.sharedWith.length} {vault.sharedWith.length === 1 ? 'person' : 'people'}
                </div>
              </div>
              <div className="mt-4 text-sm text-zinc-500">
                Created {vault.createdAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Access Details Panel */}
        <div className="lg:col-span-1">
          {selectedVault ? (
            <div className="border border-zinc-800 p-6 bg-zinc-950 sticky top-4">
              <h2 className="text-lg font-medium text-zinc-100 mb-4">
                Access Control
              </h2>
              <div className="mb-4">
                <div className="text-sm font-medium text-zinc-300 mb-2">
                  {selectedVault.name}
                </div>
                <div className="text-sm text-zinc-400">
                  {selectedVault.sharedWith.length === 0 
                    ? 'Not shared with anyone' 
                    : `Shared with ${selectedVault.sharedWith.length} ${selectedVault.sharedWith.length === 1 ? 'person' : 'people'}`
                  }
                </div>
              </div>

              {selectedVault.sharedWith.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-zinc-300 mb-2">
                    Active Access
                  </div>
                  {selectedVault.sharedWith.map((access, index) => (
                    <div key={index} className="border border-zinc-800 p-3 bg-zinc-900">
                      <div className="text-sm text-zinc-100 mb-1">
                        Connection #{access.connectionId}
                      </div>
                      <div className="text-xs text-zinc-400 mb-2">
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
                          className="text-xs px-3 py-1 bg-red-900 text-red-200 hover:bg-red-800 transition-colors"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => handleGrantAccess(selectedVault.id)}
                  className="w-full px-4 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  Grant Access
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-zinc-800 p-6 bg-zinc-950 text-center text-zinc-500">
              Select a vault to manage access
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
