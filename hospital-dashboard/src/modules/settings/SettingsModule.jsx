import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';
import EmptyState from '../../components/common/EmptyState';

const ALL_SECTIONS = [
  { id: 'hospitalProfile', label: 'Hospital', adminOnly: true },
  { id: 'adminAccount', label: 'Account' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'communications', label: 'Email & SMS', adminOnly: true },
  { id: 'governance', label: 'Audit & Roles', adminOnly: true },
];

export default function SettingsModule() {
  const { user } = useAuth();
  const { settings, saveSettings, updatePassword, loading } = useHospital();
  const [activeSection, setActiveSection] = useState('hospitalProfile');
  const [draft, setDraft] = useState(settings);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingSection, setSavingSection] = useState('');

  const readOnly = user?.role !== 'admin';
  const permissions = useMemo(() => draft?.rolePermissions || {}, [draft]);
  const sections = useMemo(() => ALL_SECTIONS.filter(s => !s.adminOnly || user?.role === 'admin'), [user?.role]);

  function updateSection(sectionKey, field, value) {
    setDraft((current) => ({
      ...current,
      [sectionKey]: {
        ...(current?.[sectionKey] || {}),
        [field]: value,
      },
    }));
  }

  function validateSection(sectionKey) {
    if (!draft) {
      return 'Settings data is not ready yet.';
    }

    if (sectionKey === 'hospitalProfile') {
      if (!draft.hospitalProfile.hospitalName || !draft.hospitalProfile.contactEmail.includes('@')) {
        return 'Hospital name and a valid email are required.';
      }
    }

    if (sectionKey === 'adminAccount') {
      if (!draft.adminAccount.fullName || !draft.adminAccount.email.includes('@')) {
        return 'Admin account name and email are required.';
      }
    }

    if (sectionKey === 'backup') {
      if (Number(draft.backup.retentionDays) <= 0) {
        return 'Backup retention must be greater than zero.';
      }
    }

    return '';
  }

  async function handleSave(sectionKey) {
    const validationError = validateSection(sectionKey);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSavingSection(sectionKey);
    try {
      if (sectionKey === 'communications') {
        await saveSettings(
          { emailSettings: draft.emailSettings, smsSettings: draft.smsSettings },
          user?.name || 'Admin',
        );
      } else if (sectionKey === 'backup') {
        await saveSettings(
          { backup: draft.backup, apiIntegration: draft.apiIntegration },
          user?.name || 'Admin',
        );
      } else if (sectionKey === 'governance') {
        await saveSettings(
          { rolePermissions: draft.rolePermissions },
          user?.name || 'Admin',
        );
      } else {
        await saveSettings({ [sectionKey]: draft[sectionKey] }, user?.name || 'Admin');
      }
      toast.success('Settings saved successfully');
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to save settings');
    } finally {
      setSavingSection('');
    }
  }

  async function handlePasswordSave() {
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password confirmation does not match');
      return;
    }

    setSavingSection('password');
    try {
      await updatePassword(
        { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
        user?.name || 'Admin',
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (requestError) {
      toast.error(requestError.message || 'Password update failed');
    } finally {
      setSavingSection('');
    }
  }

  if (loading || !draft) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface p-6 dark:border-outline dark:bg-surface">
        <p className="text-body-md text-on-surface-variant">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px,1fr]">
      <aside className="rounded-2xl border border-outline-variant bg-surface p-4 shadow-sm dark:border-outline dark:bg-surface">
        <h1 className="mb-3 text-headline-lg text-primary dark:text-primary-fixed">Settings</h1>
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`w-full rounded-xl px-4 py-3 text-left text-body-md font-bold transition-colors ${
                activeSection === section.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-container-low text-on-surface dark:bg-on-primary-fixed '
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        {activeSection === 'hospitalProfile' ? (
          <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-headline-lg text-on-surface ">Hospital Profile Settings</h2>
                <p className="text-body-md text-on-surface-variant">Core organization identity and public communication details.</p>
              </div>
              <button type="button" onClick={() => handleSave('hospitalProfile')} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                {savingSection === 'hospitalProfile' ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ['hospitalName', 'Hospital Name'],
                ['registrationNumber', 'Registration Number'],
                ['contactEmail', 'Contact Email'],
                ['contactPhone', 'Contact Phone'],
                ['website', 'Website'],
                ['address', 'Address'],
              ].map(([field, label]) => (
                <label key={field} className={`space-y-1 ${field === 'address' ? 'md:col-span-2' : ''}`}>
                  <span className="text-label-md uppercase text-on-surface-variant">{label}</span>
                  <input
                    value={draft.hospitalProfile[field]}
                    onChange={(event) => updateSection('hospitalProfile', field, event.target.value)}
                    className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
                  />
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'adminAccount' ? (
          <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-headline-lg text-on-surface ">Admin Account Settings</h2>
                <p className="text-body-md text-on-surface-variant">Profile information used across approvals, audit logs, and communication.</p>
              </div>
              <button type="button" onClick={() => handleSave('adminAccount')} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                {savingSection === 'adminAccount' ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ['fullName', 'Full Name'],
                ['designation', 'Designation'],
                ['email', 'Email'],
                ['phone', 'Phone'],
              ].map(([field, label]) => (
                <label key={field} className="space-y-1">
                  <span className="text-label-md uppercase text-on-surface-variant">{label}</span>
                  <input
                    value={draft.adminAccount[field]}
                    onChange={(event) => updateSection('adminAccount', field, event.target.value)}
                    className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
                  />
                </label>
              ))}
            </div>

            {/* Change Password Sub-section */}
            <div className="mt-8 border-t border-outline-variant pt-6 dark:border-outline">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-headline-md font-bold text-on-surface ">Change Password</h3>
                  <p className="text-body-md text-on-surface-variant">Update the security credentials for this administrator account.</p>
                </div>
                <button type="button" onClick={handlePasswordSave} className="rounded-lg bg-secondary px-4 py-2 text-body-md font-bold text-white">
                  {savingSection === 'password' ? 'Updating...' : 'Update Password'}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-label-md uppercase text-on-surface-variant">Current Password</span>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm(prev => ({ ...prev, currentPassword: event.target.value }))}
                    className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-label-md uppercase text-on-surface-variant">New Password</span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm(prev => ({ ...prev, newPassword: event.target.value }))}
                    className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-label-md uppercase text-on-surface-variant">Confirm New Password</span>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm(prev => ({ ...prev, confirmPassword: event.target.value }))}
                    className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed "
                  />
                </label>
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === 'notifications' ? (
          <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-headline-lg text-on-surface ">Notification Preferences</h2>
                <p className="text-body-md text-on-surface-variant">Control workflow approvals, billing events, daily digests, and outreach alerts.</p>
              </div>
              <button type="button" onClick={() => handleSave('notifications')} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                {savingSection === 'notifications' ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(draft.notifications).map(([field, value]) => (
                <label key={field} className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-3 dark:border-outline">
                  <span className="text-body-md text-on-surface ">{field}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => updateSection('notifications', field, event.target.checked)}
                  />
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {activeSection === 'communications' ? (
          <section className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-headline-lg text-on-surface ">Email & SMS Settings</h2>
                <p className="text-body-md text-on-surface-variant">Manage sender identity, provider settings, and reminder delivery.</p>
              </div>
              <button type="button" onClick={() => handleSave('communications')} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                {savingSection === 'communications' ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-outline-variant p-4 dark:border-outline">
                <h3 className="text-headline-md text-on-surface ">Email Settings</h3>
                {Object.entries(draft.emailSettings).map(([field, value]) => (
                  <label key={field} className="space-y-1">
                    <span className="text-label-md uppercase text-on-surface-variant">{field}</span>
                    <input value={value} onChange={(event) => updateSection('emailSettings', field, event.target.value)} className="w-full rounded-xl border border-outline-variant px-4 py-2 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed " />
                  </label>
                ))}
              </div>
              <div className="space-y-4 rounded-xl border border-outline-variant p-4 dark:border-outline">
                <h3 className="text-headline-md text-on-surface ">SMS Settings</h3>
                {Object.entries(draft.smsSettings).map(([field, value]) => (
                  <label key={field} className="flex items-center justify-between rounded-xl border border-outline-variant px-4 py-3 dark:border-outline">
                    <span className="text-body-md text-on-surface ">{field}</span>
                    {typeof value === 'boolean' ? (
                      <input type="checkbox" checked={value} onChange={(event) => updateSection('smsSettings', field, event.target.checked)} />
                    ) : (
                      <input value={value} onChange={(event) => updateSection('smsSettings', field, event.target.value)} className="rounded-lg border border-outline-variant px-3 py-1 text-body-md outline-none focus:border-primary dark:border-outline dark:bg-on-primary-fixed " />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeSection === 'governance' ? (
          <section className="space-y-6 rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm dark:border-outline dark:bg-surface">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-headline-lg text-on-surface ">Audit Logs & Role Permissions</h2>
                <p className="text-body-md text-on-surface-variant">Review sensitive actions and manage role-based access policies.</p>
              </div>
              {!readOnly ? (
                <button type="button" onClick={() => handleSave('governance')} className="rounded-lg bg-primary px-4 py-2 text-body-md font-bold text-white">
                  {savingSection === 'governance' ? 'Saving...' : 'Save'}
                </button>
              ) : null}
            </div>

            {!readOnly ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {Object.entries(permissions).map(([role, grants]) => (
                  <div key={role} className="rounded-xl border border-outline-variant p-4 dark:border-outline">
                    <h3 className="text-headline-md capitalize text-on-surface ">{role}</h3>
                    <div className="mt-3 space-y-2">
                      {grants.map((grant, index) => (
                        <label key={grant} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked
                            onChange={(event) => {
                              setDraft((current) => {
                                const nextRolePermissions = { ...(current.rolePermissions || {}) };
                                const nextGrants = [...(nextRolePermissions[role] || [])];
                                if (!event.target.checked) {
                                  nextRolePermissions[role] = nextGrants.filter((item) => item !== grant);
                                } else if (!nextGrants.includes(grant)) {
                                  nextGrants.splice(index, 0, grant);
                                  nextRolePermissions[role] = nextGrants;
                                }
                                return { ...current, rolePermissions: nextRolePermissions };
                              });
                            }}
                          />
                          <span className="text-body-md text-on-surface ">{grant}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="lock" title="Read-only access" description="Only administrators can update role permission management settings." />
            )}

            <div className="rounded-xl border border-outline-variant p-4 dark:border-outline">
              <h3 className="text-headline-md text-on-surface ">Audit Logs</h3>
              <div className="mt-4 space-y-3">
                {draft.auditLogs?.map((log) => (
                  <div key={log.id} className="rounded-xl bg-surface-container-low p-4 dark:bg-on-primary-fixed">
                    <p className="text-body-md font-bold text-on-surface ">{log.actor}</p>
                    <p className="text-body-md text-on-surface-variant">{log.action}</p>
                    <p className="mt-1 text-label-md text-outline">{log.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
