import { useState } from 'react';
import type { Vault, Connection } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

export default function Vaults() {
  const { user } = useAuth();
  const { vaults, sharedVaults, connections, addVault, updateVault } = useUserData();
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGrantAccessModal, setShowGrantAccessModal] = useState(false);
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

  const handleRevokeAccess = async (vaultId: string, connectionId: string) => {
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
    setSelectedVault(vaults.find(v => v.id === vaultId) || null);
    setShowGrantAccessModal(true);
  };

  const handleSelectConnection = async (connection: Connection) => {
    if (!selectedVault) return;
    
    // Check if already has access
    if (selectedVault.sharedWith.some(access => access.connectionId === connection.id)) {
      alert('This connection already has access to this vault.');
      return;
    }

    const newAccess = {
      connectionId: connection.id,
      grantedAt: new Date(),
      canRevoke: true
    };

    // Update the vault's sharedWith array
    updateVault(selectedVault.id, {
      sharedWith: [
        ...selectedVault.sharedWith,
        newAccess
      ]
    });
    
    setShowGrantAccessModal(false);
    // Update selected vault to show new access
    setSelectedVault({
      ...selectedVault,
      sharedWith: [...selectedVault.sharedWith, newAccess]
    });
  };

  const getConnectionById = (connectionId: string): Connection | undefined => {
    return connections.find(c => c.id === connectionId);
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-zinc-100 mb-2">Vaults</h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Share information selectively with temporary, revocable access
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Create Vault'}
        </button>
      </div>

      {/* Add Vault Form */}
      {showAddForm && (
        <div className="mb-6 border border-zinc-800 p-4 sm:p-6 bg-zinc-950">
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
        <div className="lg:col-span-2 space-y-6">
          {/* My Vaults */}
          <div>
            <h2 className="text-lg font-medium text-zinc-100 mb-4">My Vaults</h2>
            {vaults.length === 0 ? (
              <div className="border border-zinc-800 p-8 bg-zinc-950 text-center">
                <p className="text-zinc-400 mb-2">No vaults yet</p>
                <p className="text-sm text-zinc-500">Create your first vault to start sharing information securely</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vaults.map(vault => (
                  <div 
                    key={vault.id} 
                    className={`border p-4 sm:p-6 bg-zinc-950 cursor-pointer transition-colors ${
                      selectedVault?.id === vault.id && !selectedVault?.ownerId
                        ? 'border-zinc-100' 
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                    onClick={() => setSelectedVault(vault)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg sm:text-xl font-medium text-zinc-100">
                          {vault.name}
                        </h3>
                        <p className="text-sm sm:text-base text-zinc-400 mt-1">{vault.description}</p>
                      </div>
                      <div className="text-sm text-zinc-500">
                        {vault.sharedWith.length} {vault.sharedWith.length === 1 ? 'person' : 'people'}
                      </div>
                    </div>
                    <div className="mt-4 text-xs sm:text-sm text-zinc-500">
                      Created {vault.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared With Me */}
          {sharedVaults.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-zinc-100 mb-4">Shared With Me</h2>
              <div className="space-y-4">
                {sharedVaults.map(vault => (
                  <div 
                    key={`${vault.ownerId}-${vault.id}`}
                    className={`border p-4 sm:p-6 bg-zinc-950 cursor-pointer transition-colors ${
                      selectedVault?.id === vault.id && selectedVault?.ownerId === vault.ownerId
                        ? 'border-emerald-700' 
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                    onClick={() => setSelectedVault(vault)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg sm:text-xl font-medium text-zinc-100">
                            {vault.name}
                          </h3>
                          <span className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 text-xs border border-emerald-800">
                            Shared
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-zinc-400 mt-1">{vault.description}</p>
                        <p className="text-xs text-zinc-500 mt-2">Shared by {vault.ownerName}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-xs sm:text-sm text-zinc-500">
                      Created {vault.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Access Details Panel */}
        <div className="lg:col-span-1">
          {selectedVault ? (
            <div className="border border-zinc-800 p-4 sm:p-6 bg-zinc-950 sticky top-4">
              <h2 className="text-base sm:text-lg font-medium text-zinc-100 mb-4">
                {selectedVault.ownerId ? 'Shared Vault' : 'Access Control'}
              </h2>
              <div className="mb-4">
                <div className="text-sm font-medium text-zinc-300 mb-2">
                  {selectedVault.name}
                </div>
                {selectedVault.ownerId ? (
                  <div className="text-sm text-zinc-400">
                    Shared by {selectedVault.ownerName}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">
                    {selectedVault.sharedWith.length === 0 
                      ? 'Not shared with anyone' 
                      : `Shared with ${selectedVault.sharedWith.length} ${selectedVault.sharedWith.length === 1 ? 'person' : 'people'}`
                    }
                  </div>
                )}
              </div>

              {!selectedVault.ownerId && selectedVault.sharedWith.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-zinc-300 mb-2">
                    Active Access
                  </div>
                  {selectedVault.sharedWith.map((access, index) => {
                    const connection = getConnectionById(access.connectionId);
                    return (
                      <div key={index} className="border border-zinc-800 p-3 bg-zinc-900">
                        {connection ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={connection.picture}
                                alt={connection.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="text-sm text-zinc-100">{connection.name}</div>
                                <div className="text-xs text-zinc-400">{connection.email}</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-zinc-100 mb-1">
                            Connection #{access.connectionId}
                          </div>
                        )}
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
                    );
                  })}
                </div>
              )}

              {!selectedVault.ownerId && (
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <button 
                    onClick={() => handleGrantAccess(selectedVault.id)}
                    className="w-full px-4 py-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm sm:text-base"
                  >
                    Grant Access
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-zinc-800 p-6 bg-zinc-950 text-center text-zinc-500">
              Select a vault to manage access
            </div>
          )}
        </div>
      </div>

      {/* Grant Access Modal */}
      {showGrantAccessModal && selectedVault && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-zinc-100">
                  Grant Access to {selectedVault.name}
                </h2>
                <button
                  onClick={() => setShowGrantAccessModal(false)}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {connections.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p>No connections yet.</p>
                  <p className="text-sm text-zinc-500 mt-2">Add connections to share vaults with them.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-zinc-400 mb-4">
                    Select a connection to grant access:
                  </p>
                  {connections.map((connection) => {
                    const alreadyHasAccess = selectedVault.sharedWith.some(
                      access => access.connectionId === connection.id
                    );
                    return (
                      <button
                        key={connection.id}
                        onClick={() => !alreadyHasAccess && handleSelectConnection(connection)}
                        disabled={alreadyHasAccess}
                        className={`w-full p-3 border flex items-center gap-3 transition-colors ${
                          alreadyHasAccess
                            ? 'border-zinc-800 bg-zinc-950 opacity-50 cursor-not-allowed'
                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                        }`}
                      >
                        <img
                          src={connection.picture}
                          alt={connection.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-zinc-100">
                            {connection.name}
                          </div>
                          <div className="text-xs text-zinc-400">{connection.email}</div>
                        </div>
                        {alreadyHasAccess && (
                          <span className="text-xs text-emerald-400">Has Access</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
