import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getCircle, getCircleMembers, isCircleMember } from '../services/circles';
import { subscribeToUpdates, createUpdate, deleteUpdate } from '../services/updates';
import { subscribeToTasks, createTask, toggleTaskStatus, deleteTask } from '../services/tasks';
import { subscribeToFiles, uploadFile, deleteFile } from '../services/files';
import { getCircleInvites, createInvite } from '../services/invites';
import type { Circle, CircleMember, Update, Task, CircleFile, CircleInvite } from '../types/circles';

type Tab = 'updates' | 'tasks' | 'files' | 'members';

export default function CircleDetail() {
  const { circleId } = useParams<{ circleId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('updates');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  
  // Data states
  const [updates, setUpdates] = useState<Update[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<CircleFile[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [invites, setInvites] = useState<CircleInvite[]>([]);
  
  // Form states
  const [newUpdate, setNewUpdate] = useState('');
  const [newTask, setNewTask] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (circleId && user) {
      loadCircle();
      checkMembership();
    }
  }, [circleId, user]);

  useEffect(() => {
    if (circleId && isMember) {
      // Subscribe to real-time updates
      const unsubUpdates = subscribeToUpdates(circleId, setUpdates);
      const unsubTasks = subscribeToTasks(circleId, setTasks);
      const unsubFiles = subscribeToFiles(circleId, setFiles);
      
      return () => {
        unsubUpdates();
        unsubTasks();
        unsubFiles();
      };
    }
  }, [circleId, isMember]);

  const loadCircle = async () => {
    if (!circleId) return;
    
    try {
      setLoading(true);
      const circleData = await getCircle(circleId);
      if (circleData) {
        setCircle(circleData);
      } else {
        setError('Circle not found');
      }
    } catch (err) {
      console.error('Error loading circle:', err);
      setError('Failed to load circle');
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!circleId || !user) return;
    
    try {
      const memberStatus = await isCircleMember(circleId, user.sub);
      setIsMember(memberStatus);
      
      if (!memberStatus) {
        setError('You are not a member of this circle');
      }
    } catch (err) {
      console.error('Error checking membership:', err);
    }
  };

  const loadMembers = async () => {
    if (!circleId) return;
    try {
      const membersData = await getCircleMembers(circleId);
      setMembers(membersData);
      
      const invitesData = await getCircleInvites(circleId);
      setInvites(invitesData);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'members' && circleId && isMember) {
      loadMembers();
    }
  }, [activeTab, circleId, isMember]);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleId || !user || !newUpdate.trim()) return;
    
    try {
      await createUpdate(circleId, user.sub, newUpdate.trim());
      setNewUpdate('');
    } catch (err) {
      console.error('Error creating update:', err);
      alert('Failed to create update');
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!circleId || !confirm('Delete this update?')) return;
    
    try {
      await deleteUpdate(circleId, updateId);
    } catch (err) {
      console.error('Error deleting update:', err);
      alert('Failed to delete update');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleId || !user || !newTask.trim()) return;
    
    try {
      await createTask(circleId, newTask.trim(), user.sub);
      setNewTask('');
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!circleId) return;
    
    try {
      await toggleTaskStatus(circleId, taskId);
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!circleId || !confirm('Delete this task?')) return;
    
    try {
      await deleteTask(circleId, taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!circleId || !user || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      await uploadFile(circleId, user.sub, file);
      e.target.value = ''; // Reset input
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!circleId || !confirm('Delete this file?')) return;
    
    try {
      await deleteFile(circleId, fileId);
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete file');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circleId || !user || !inviteEmail.trim()) return;
    
    try {
      await createInvite(circleId, inviteEmail.trim(), user.sub);
      setInviteEmail('');
      alert('Invite sent!');
      loadMembers(); // Reload to show new invite
    } catch (err: unknown) {
      console.error('Error sending invite:', err);
      const message = err instanceof Error ? err.message : 'Failed to send invite';
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (error || !circle || !isMember) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-zinc-950 border border-zinc-800">
        <h2 className="text-xl font-medium text-zinc-100 mb-2">Access Denied</h2>
        <p className="text-zinc-400 mb-4">{error || 'You do not have access to this circle'}</p>
        <button
          onClick={() => navigate('/circles')}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors"
        >
          Back to Circles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/circles')}
            className="text-sm text-zinc-400 hover:text-zinc-300 mb-2"
          >
            ← Back to Circles
          </button>
          <h1 className="text-3xl font-light text-zinc-100">{circle.name}</h1>
          <p className="text-sm text-zinc-500">{circle.type}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-6">
          {(['updates', 'tasks', 'files', 'members'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {/* Create Update Form */}
            <form onSubmit={handleCreateUpdate} className="p-4 bg-zinc-950 border border-zinc-800">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                placeholder="Share an update with your circle..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newUpdate.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Update
                </button>
              </div>
            </form>

            {/* Updates Feed */}
            {updates.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
                <p className="text-zinc-500">No updates yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updates.map((update) => (
                  <div key={update.id} className="p-4 bg-zinc-950 border border-zinc-800">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {update.authorPhotoURL && (
                          <img
                            src={update.authorPhotoURL}
                            alt={update.authorName}
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium text-zinc-100">{update.authorName}</div>
                          <div className="text-xs text-zinc-500">
                            {update.createdAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {update.authorId === user?.sub && (
                        <button
                          onClick={() => handleDeleteUpdate(update.id)}
                          className="text-xs text-zinc-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-zinc-300 whitespace-pre-wrap">{update.text}</p>
                    {update.imageUrl && (
                      <img
                        src={update.imageUrl}
                        alt="Update"
                        className="mt-3 max-w-full rounded border border-zinc-800"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {/* Create Task Form */}
            <form onSubmit={handleCreateTask} className="p-4 bg-zinc-950 border border-zinc-800">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a task..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newTask.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
              </div>
            </form>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
                <p className="text-zinc-500">No tasks yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-zinc-950 border border-zinc-800 flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          task.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-xs text-zinc-600">
                        {task.assignedToName && `Assigned to ${task.assignedToName} • `}
                        Created by {task.createdByName}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-xs text-zinc-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Upload File */}
            <div className="p-4 bg-zinc-950 border border-zinc-800">
              <label className="block">
                <span className="sr-only">Choose file</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-emerald-700 file:text-zinc-100 hover:file:bg-emerald-600 file:cursor-pointer disabled:opacity-50"
                />
              </label>
              {uploading && <p className="mt-2 text-sm text-zinc-500">Uploading...</p>}
            </div>

            {/* Files List */}
            {files.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800 bg-zinc-950">
                <p className="text-zinc-500">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-zinc-950 border border-zinc-800 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-400 hover:text-emerald-300"
                      >
                        {file.filename}
                      </a>
                      <div className="text-xs text-zinc-600">
                        Uploaded by {file.uploaderName} on {file.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    {file.uploaderId === user?.sub && (
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-xs text-zinc-500 hover:text-red-400 ml-4"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Invite Member Form */}
            <form onSubmit={handleInvite} className="p-4 bg-zinc-950 border border-zinc-800">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Invite by Email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="submit"
                  disabled={!inviteEmail.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invite
                </button>
              </div>
            </form>

            {/* Pending Invites */}
            {invites.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Pending Invites</h3>
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div key={invite.id} className="p-3 bg-zinc-950 border border-zinc-800">
                      <div className="text-zinc-100">{invite.email}</div>
                      <div className="text-xs text-zinc-600">
                        Invited by {invite.invitedByName} on {invite.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members List */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Members ({members.length})
              </h3>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.uid}
                    className="p-4 bg-zinc-950 border border-zinc-800 flex items-center gap-3"
                  >
                    {member.photoURL && (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-zinc-100">{member.displayName}</div>
                      <div className="text-xs text-zinc-600">{member.email}</div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                      {member.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
