import { useState } from 'react';
import { Save, User, Building2, FileText, Bell, Lock, Shield, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Settings() {
  const { profile, settings, updateSettings, setProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    // Document Management Settings
    defaultViewMode: settings.defaultViewMode,
    autoSaveInterval: settings.autoSaveInterval.toString(),
    showVersionHistory: settings.showVersionHistory,
    enableAnnotations: settings.enableAnnotations,
    enableComments: settings.enableComments,
    autoReload: settings.autoReload,
    // Notification Settings
    emailNotifications: settings.emailNotifications,
    documentUpdates: settings.documentUpdates,
    commentNotifications: settings.commentNotifications,
    versionUpdates: settings.versionUpdates,
    // Security Settings
    twoFactorAuth: settings.twoFactorAuth,
    requireApproval: settings.requireApproval,
    documentWatermark: settings.documentWatermark,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update profile in Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      // Update profile in store
      setProfile({
        ...profile!,
        full_name: formData.full_name,
        phone: formData.phone,
      });

      // Update settings in store
      updateSettings({
        defaultViewMode: formData.defaultViewMode as 'grid' | 'list' | 'table',
        autoSaveInterval: parseInt(formData.autoSaveInterval),
        showVersionHistory: formData.showVersionHistory,
        enableAnnotations: formData.enableAnnotations,
        enableComments: formData.enableComments,
        autoReload: formData.autoReload,
        emailNotifications: formData.emailNotifications,
        documentUpdates: formData.documentUpdates,
        commentNotifications: formData.commentNotifications,
        versionUpdates: formData.versionUpdates,
        twoFactorAuth: formData.twoFactorAuth,
        requireApproval: formData.requireApproval,
        documentWatermark: formData.documentWatermark,
      });

      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'document', label: 'Document Management', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#2d3748] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#1E293B] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg border p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'document' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Document Management</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default View Mode
                  </label>
                  <select
                    value={formData.defaultViewMode}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultViewMode: e.target.value as 'grid' | 'list' | 'table' })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                    <option value="table">Table View</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-save Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.autoSaveInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, autoSaveInterval: e.target.value })
                    }
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="autoReload"
                      checked={formData.autoReload}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          autoReload: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoReload"
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Enable Auto-reload
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showVersionHistory"
                      checked={formData.showVersionHistory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showVersionHistory: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="showVersionHistory"
                      className="text-sm text-gray-700"
                    >
                      Show Version History
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enableAnnotations"
                      checked={formData.enableAnnotations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enableAnnotations: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="enableAnnotations"
                      className="text-sm text-gray-700"
                    >
                      Enable Annotations
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="enableComments"
                      checked={formData.enableComments}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          enableComments: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="enableComments"
                      className="text-sm text-gray-700"
                    >
                      Enable Comments
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="emailNotifications"
                    className="text-sm text-gray-700"
                  >
                    Email Notifications
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="documentUpdates"
                    checked={formData.documentUpdates}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentUpdates: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="documentUpdates"
                    className="text-sm text-gray-700"
                  >
                    Document Updates
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="commentNotifications"
                    checked={formData.commentNotifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commentNotifications: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="commentNotifications"
                    className="text-sm text-gray-700"
                  >
                    Comment Notifications
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="versionUpdates"
                    checked={formData.versionUpdates}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        versionUpdates: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="versionUpdates"
                    className="text-sm text-gray-700"
                  >
                    Version Updates
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    checked={formData.twoFactorAuth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        twoFactorAuth: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="twoFactorAuth"
                    className="text-sm text-gray-700"
                  >
                    Enable Two-Factor Authentication
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={formData.requireApproval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requireApproval: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="requireApproval"
                    className="text-sm text-gray-700"
                  >
                    Require Approval for Document Changes
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="documentWatermark"
                    checked={formData.documentWatermark}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentWatermark: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#1E293B] focus:ring-[#1E293B] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="documentWatermark"
                    className="text-sm text-gray-700"
                  >
                    Add Watermark to Documents
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}