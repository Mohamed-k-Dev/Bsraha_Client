import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Bell, Shield, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Toggle, Spinner } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils';

export function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Privacy preferences (local state, demo)
  const [defaultAnonymous, setDefaultAnonymous] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showReactions, setShowReactions] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    await updateUser({ displayName, bio });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];
  const [active, setActive] = useState('profile');

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-light text-ink-900">
          Set<span className="italic font-medium">tings</span>
        </h1>
        <p className="mt-2 text-ink-500 text-pretty">Manage your account, privacy, and preferences.</p>
      </motion.div>

      {/* Section tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all shrink-0',
              active === s.id ? 'bg-ink-900 text-paper-50' : 'bg-paper-50 text-ink-600 border border-ink-200 hover:border-ink-400'
            )}
          >
            <s.icon className="h-4 w-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* Profile section */}
      {active === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user?.displayName ?? ''} seed={user?.avatarSeed ?? ''} size="xl" />
              <div>
                <div className="font-display text-lg font-semibold text-ink-800">{user?.displayName}</div>
                <div className="text-sm text-ink-400 font-mono">@{user?.username}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Display name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 200))} rows={3} className="input resize-none" placeholder="Tell people what you are about..." />
                <p className="mt-1 text-xs text-ink-400 font-mono">{bio.length}/200</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="btn btn-ember text-sm px-5 py-2.5">
                  {saving ? <Spinner size="sm" /> : 'Save changes'}
                </button>
                {saved && <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-moss-600">Saved!</motion.span>}
              </div>
            </div>
          </div>

          <div className="card p-6 border-red-200/50">
            <h3 className="font-display font-semibold text-ink-800 mb-2">Danger zone</h3>
            <p className="text-sm text-ink-500 mb-4">Log out of your account on this device.</p>
            <button onClick={handleLogout} className="btn text-sm px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 transition">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </motion.div>
      )}

      {/* Privacy section */}
      {active === 'privacy' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SettingRow
            icon={<EyeOff className="h-5 w-5" />}
            title="Send as Anonymous by default"
            desc="New messages you send will default to anonymous. You can still toggle per message."
          >
            <Toggle checked={defaultAnonymous} onChange={setDefaultAnonymous} label="Default anonymous" />
          </SettingRow>
          <SettingRow
            icon={<Eye className="h-5 w-5" />}
            title="Public profile"
            desc="Allow others to find your profile and see your published messages."
          >
            <Toggle checked={publicProfile} onChange={setPublicProfile} label="Public profile" />
          </SettingRow>
          <SettingRow
            icon={<Shield className="h-5 w-5" />}
            title="Show reactions on public messages"
            desc="Display reaction counts on your published messages to everyone."
          >
            <Toggle checked={showReactions} onChange={setShowReactions} label="Show reactions" />
          </SettingRow>
        </motion.div>
      )}

      {/* Notifications section */}
      {active === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SettingRow
            icon={<Mail className="h-5 w-5" />}
            title="Email notifications"
            desc="Get an email when you receive a new message or reply."
          >
            <Toggle checked={emailNotifs} onChange={setEmailNotifs} label="Email notifications" />
          </SettingRow>
          <SettingRow
            icon={<Bell className="h-5 w-5" />}
            title="In-app notifications"
            desc="See notifications in the app for messages, replies, and reactions."
          >
            <Toggle checked={true} onChange={() => {}} label="In-app notifications" />
          </SettingRow>
        </motion.div>
      )}
    </div>
  );
}

function SettingRow({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
          {icon}
        </div>
        <div>
          <h3 className="font-display font-semibold text-ink-800">{title}</h3>
          <p className="text-sm text-ink-500 text-pretty mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}
