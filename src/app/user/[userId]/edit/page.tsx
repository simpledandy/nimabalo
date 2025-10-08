"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { strings } from '@/lib/strings';
import UsernameInput from '@/components/UsernameInput';
import AvatarPicker from '@/components/AvatarPicker';
import { useConfirmation } from '@/lib/useConfirmation';
import AppModal from '@/components/AppModal';
import PageHeader from '@/components/PageHeader';
import PageLayout from '@/components/PageLayout';
import NotFoundPage from '@/components/NotFoundPage';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface ProfileData {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  created_at: string;
}

export default function EditProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId as string;
  const { user: currentUser, loading: sessionLoading } = useSession();
  const router = useRouter();
  const { isOpen: isConfirmOpen, config: confirmConfig, confirm, close: closeConfirm, handleConfirm } = useConfirmation();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: ''
  });
  
  // Username validation
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);
  
  const [originalData, setOriginalData] = useState<typeof formData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if user owns this profile
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    // Don't do anything while session is loading
    if (sessionLoading) {
      return;
    }
    
    // If no user is logged in, redirect to auth page
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    // If user doesn't own this profile, redirect to homepage
    if (!userId || !isOwnProfile) {
      router.push('/');
      return;
    }
    
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOwnProfile, sessionLoading, currentUser]);

  // Check for unsaved changes
  useEffect(() => {
    if (originalData) {
      const hasChanges = Object.keys(formData).some(
        key => formData[key as keyof typeof formData] !== originalData[key as keyof typeof originalData]
      );
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, originalData]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        setError(strings.userProfile.userNotFound);
        return;
      }

      setProfile(profileData);
      const initialData = {
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        avatar_url: profileData.avatar_url || ''
      };
      setFormData(initialData);
      setOriginalData(initialData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(strings.userProfile.genericError);
    } finally {
      setLoading(false);
    }
  };

  // Username validation - handled by UsernameInput component

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.full_name.trim()) {
        setError(strings.profile.editProfilePage.validation.fullNameRequired);
        return;
      }

      if (formData.full_name.length > 100) {
        setError(strings.profile.editProfilePage.validation.fullNameTooLong);
        return;
      }

      if (formData.bio && formData.bio.length > 500) {
        setError(strings.profile.editProfilePage.validation.bioTooLong);
        return;
      }

      if (formData.website && formData.website.trim()) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(formData.website)) {
          setError(strings.profile.editProfilePage.validation.websiteInvalid);
          return;
        }
      }

      // Check username availability if changed
      if (formData.username !== profile.username) {
        if (!isUsernameValid) {
          setError(strings.profile.usernameSetup.taken);
          return;
        }
      }

      // Update profile
      const updateData = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim().toLowerCase() || null,
        bio: formData.bio.trim() || null,
        location: formData.location.trim() || null,
        website: formData.website.trim() || null,
        avatar_url: formData.avatar_url || null,
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setOriginalData({ ...formData });
      
      // Show success message and redirect after delay
      setTimeout(() => {
        router.push(`/user/${userId}`);
      }, 2000);

    } catch (err) {
      const error = err as Error;
      console.error('Error updating profile:', error);
      setError(error.message || strings.profile.editProfilePage.messages.error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      confirm(
        () => router.push(`/user/${userId}`),
        {
          title: "Saqlanmagan o'zgarishlar",
          message: strings.profile.editProfilePage.messages.unsavedChanges,
          confirmText: "Ha, chiqish",
          cancelText: "Qolish"
        }
      );
    } else {
      router.push(`/user/${userId}`);
    }
  };


  if (loading || sessionLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSkeleton variant="profile" />
            <p className="text-neutral mt-4">
              {sessionLoading ? "Sessiya yuklanmoqda..." : strings.ui.loading}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error && !profile) {
    return (
      <PageLayout>
        <NotFoundPage
          title={strings.userProfile.userNotFound}
          message={error}
          icon="😕"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={strings.profile.editProfilePage.title}
        subtitle={strings.profile.editProfilePage.subtitle}
        backButton={{
          href: `/user/${userId}`,
          text: strings.profile.editProfilePage.backToProfile
        }}
        icon="✏️"
      />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Success Message */}
          {success && (
            <div className="card bg-green-50 border-green-200 text-green-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-bold">{strings.profile.editProfilePage.messages.saved}</h3>
                  {formData.username !== profile?.username && (
                    <p className="text-sm mt-1">
                      {strings.profile.editProfilePage.messages.usernameChanged} 
                      <span className="font-mono">/@{formData.username}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="card bg-red-50 border-red-200 text-red-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Avatar Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <span>🎨</span>
              Profile Avatar
            </h2>
            
            <AvatarPicker
              seed={formData.username || currentUser?.email || 'default'}
              value={formData.avatar_url}
              onChange={(url) => handleInputChange('avatar_url', url)}
            />
          </div>

          {/* Basic Information Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <span>👤</span>
              {strings.profile.editProfilePage.sections.basicInfo}
            </h2>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {strings.profile.editProfilePage.fields.fullName} *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder={strings.profile.editProfilePage.fields.fullNamePlaceholder}
                  className="input w-full"
                  maxLength={100}
                />
              </div>

              {/* Username */}
              <UsernameInput
                value={formData.username}
                onChange={(value: string, valid?: boolean | null) => {
                  handleInputChange('username', value);
                  setIsUsernameValid(valid || null);
                }}
                currentUsername={profile?.username || undefined}
                placeholder={strings.profile.editProfilePage.fields.usernamePlaceholder}
                showSuggestions={true}
                userEmail={currentUser?.email}
                userFullName={currentUser?.user_metadata?.full_name}
              />

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {strings.profile.editProfilePage.fields.bio}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={strings.profile.editProfilePage.fields.bioPlaceholder}
                  className="textarea w-full"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-neutral mt-1">{formData.bio.length}/500</p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {strings.profile.editProfilePage.fields.location}
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={strings.profile.editProfilePage.fields.locationPlaceholder}
                  className="input w-full"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {strings.profile.editProfilePage.fields.website}
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder={strings.profile.editProfilePage.fields.websitePlaceholder}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <span>🔐</span>
              {strings.profile.editProfilePage.sections.account}
            </h2>
            
            <div className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {strings.profile.editProfilePage.fields.email}
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  className="input w-full bg-gray-100 text-gray-600"
                  disabled
                  readOnly
                />
                <p className="text-xs text-neutral mt-1">Email o'zgartirish uchun parolni tiklash orqali bog'laning</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges || (isUsernameValid === false)}
              className="btn flex-1 text-center"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {strings.profile.editProfilePage.buttons.saving}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>💾</span>
                  {strings.profile.editProfilePage.buttons.saveChanges}
                </span>
              )}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn-secondary flex-1 text-center"
            >
              {strings.profile.editProfilePage.buttons.cancel}
            </button>
          </div>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <div className="card bg-yellow-50 border-yellow-200 text-yellow-800">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-sm">{strings.profile.editProfilePage.messages.unsavedChanges}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AppModal
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        icon="⚠️"
        title={confirmConfig.title}
        subtitle={confirmConfig.message}
        showCloseButton={false}
      >
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleConfirm}
            className="btn-danger w-full text-center py-3 font-bold text-lg hover:scale-105 transition-transform"
          >
            {confirmConfig.confirmText}
          </button>
          <button 
            onClick={closeConfirm}
            className="text-neutral hover:text-primary transition-colors py-2 font-medium"
          >
            {confirmConfig.cancelText}
          </button>
        </div>
      </AppModal>
    </PageLayout>
  );
}
