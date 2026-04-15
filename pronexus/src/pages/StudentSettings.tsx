import React, { useState, useEffect } from 'react';
import { StudentSidebar } from '../components/StudentSidebar';
import { StudentHeader } from '../components/StudentHeader';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User, Mail, Hash, Phone, GraduationCap,
  Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function StudentSettings() {
  const { profile } = useAuthContext();

  const [batchName, setBatchName] = useState<string | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changing, setChanging] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.batch_id) return;
    supabase
      .from('batches')
      .select('name')
      .eq('id', profile.batch_id)
      .single()
      .then(({ data }) => {
        if (data) setBatchName(data.name);
      });
  }, [profile?.batch_id]);

  const validate = (): string | null => {
    if (!currentPassword) return 'Current password is required.';
    if (!newPassword) return 'New password is required.';
    if (newPassword.length < 6) return 'New password must be at least 6 characters.';
    if (newPassword === currentPassword) return 'New password must be different from current password.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setChanging(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'self-change',
            currentPassword,
            newPassword,
          }),
        }
      );
      const result = await res.json();
      if (!res.ok || result.error) throw new Error(result.error || 'Failed to change password');

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setChanging(false);
    }
  };

  const profileFields = [
    { icon: User, label: 'Full Name', value: profile?.full_name || '—' },
    { icon: Mail, label: 'Email', value: profile?.email || '—' },
    { icon: Hash, label: 'Roll No.', value: profile?.roll_no || '—' },
    { icon: Phone, label: 'Contact', value: profile?.contact || '—' },
    { icon: GraduationCap, label: 'Batch', value: batchName || (profile?.batch_id ? 'Loading...' : 'Unassigned') },
  ];

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <StudentSidebar />
      <StudentHeader />

      <main className="pl-56 pt-14 p-8 w-full">
        <div className="max-w-2xl mx-auto pb-24 space-y-8">

          {/* Page Title */}
          <div className="animate-slide-up">
            <h2 className="text-[1.5rem] font-headline font-bold tracking-tight text-on-surface mb-1">
              Settings
            </h2>
            <p className="text-on-surface-variant text-sm">
              View your profile and manage your account.
            </p>
          </div>

          {/* ─── Profile Card ─── */}
          <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant/10">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                Profile Information
              </h3>
            </div>

            <div className="p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/10">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-xl font-bold text-on-primary-container">
                  {(profile?.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold text-on-surface">
                    {profile?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">
                    Student
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {profileFields.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-on-surface-variant/60" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                        {label}
                      </p>
                      <p className="text-sm text-on-surface truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Change Password Card ─── */}
          <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant/10 flex items-center gap-2">
              <ShieldCheck size={14} className="text-on-surface-variant" />
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                Change Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
                    placeholder="Enter current password"
                    className="w-full bg-surface-container-high border-none h-10 pl-9 pr-10 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                    placeholder="Min 6 characters"
                    className="w-full bg-surface-container-high border-none h-10 pl-9 pr-10 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {newPassword && newPassword.length < 6 && (
                  <p className="text-[10px] text-error mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-on-surface-variant mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    placeholder="Re-enter new password"
                    className="w-full bg-surface-container-high border-none h-10 pl-9 pr-10 rounded-md text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[10px] text-error mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-md text-sm flex items-start gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="p-3 bg-primary-fixed/20 text-primary rounded-md text-sm flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  Password changed successfully!
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changing || !currentPassword || !newPassword || !confirmPassword}
                  className="px-6 py-2.5 primary-gradient text-white text-xs font-bold uppercase tracking-widest rounded ghost-shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {changing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
}
