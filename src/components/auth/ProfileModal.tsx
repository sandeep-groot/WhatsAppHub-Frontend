"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile } from "@/modules/auth/client/hooks";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { updateProfile } = useUpdateProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [firstNameVal, setFirstNameVal] = useState("");
  const [lastNameVal, setLastNameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarLetter = (displayName[0] ?? "U").toUpperCase();

  useEffect(() => {
    if (isOpen && user) {
      setFirstNameVal(user.firstName || "");
      setLastNameVal(user.lastName || "");
      setEmailVal(user.email || "");
      setSaveError(null);
      setSaveSuccess(null);
      setIsEditMode(false);
    }
  }, [isOpen, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await updateProfile({
        firstName: firstNameVal,
        lastName: lastNameVal,
        email: emailVal,
      });
      setSaveSuccess("Profile updated successfully!");
      setIsEditMode(false);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Profile" : "Profile Details"}
      size="md"
      showCloseButton={true}
    >
      <div className="p-6">
        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-sm font-medium animate-pulse">
            {saveSuccess}
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400 text-sm font-medium">
            {saveError}
          </div>
        )}

        {isEditMode ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstNameVal}
                onChange={(e) => setFirstNameVal(e.target.value)}
                placeholder="e.g. Platform"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastNameVal}
                onChange={(e) => setLastNameVal(e.target.value)}
                placeholder="e.g. Admin"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="e.g. admin@praxion.local"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSaving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Avatar section */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700">
              <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {avatarLetter}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-base">
                  {displayName}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  First Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                  {user?.firstName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Last Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                  {user?.lastName || "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Assigned Roles
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user?.roles?.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-500/20 transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
