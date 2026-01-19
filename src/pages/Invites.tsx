import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserInvites, acceptInvite, rejectInvite } from '../services/invites';
import type { CircleInvite } from '../types/circles';

export default function Invites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [invites, setInvites] = useState<Array<CircleInvite & { circleId: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      const userInvites = await getUserInvites(user.email);
      setInvites(userInvites);
    } catch (err) {
      console.error('Error loading invites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invite: CircleInvite & { circleId: string }) => {
    if (!user) return;
    
    setProcessing(invite.id);
    try {
      await acceptInvite(invite.circleId, invite.id, user.sub);
      // Navigate to the circle
      navigate(`/circles/${invite.circleId}`);
    } catch (err) {
      console.error('Error accepting invite:', err);
      alert('Failed to accept invite');
      setProcessing(null);
    }
  };

  const handleReject = async (invite: CircleInvite & { circleId: string }) => {
    setProcessing(invite.id);
    try {
      await rejectInvite(invite.circleId, invite.id);
      // Remove from list
      setInvites(invites.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error('Error rejecting invite:', err);
      alert('Failed to reject invite');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-400">Loading invites...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-light text-zinc-100">Circle Invites</h1>
        <p className="mt-1 text-sm text-zinc-400">
          You've been invited to join these circles
        </p>
      </div>

      {invites.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
          <p className="text-zinc-500 mb-4">No pending invites</p>
          <button
            onClick={() => navigate('/circles')}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors"
          >
            View My Circles
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="p-6 bg-zinc-950 border border-zinc-800"
            >
              <h3 className="text-xl font-medium text-zinc-100 mb-1">
                {invite.circleName}
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                {invite.invitedByName} invited you to join this circle
              </p>
              <div className="text-xs text-zinc-600 mb-4">
                Invited on {invite.createdAt.toLocaleDateString()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAccept(invite)}
                  disabled={processing === invite.id}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === invite.id ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleReject(invite)}
                  disabled={processing === invite.id}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing === invite.id ? 'Rejecting...' : 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
