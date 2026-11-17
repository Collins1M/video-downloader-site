"use client";

import { Lock, X } from "lucide-react";

interface AuthConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthConsentModal({ isOpen, onClose }: AuthConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-amber/30 bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-muted hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-amber">
          <div className="rounded-xl bg-amber/10 p-2.5">
            <Lock className="h-6 w-6 text-amber" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Authentication Required</h3>
            <p className="font-mono text-xs text-amber/90">Login / Cookies Needed</p>
          </div>
        </div>

        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-muted">
          This content (such as private posts, stories, or restricted media) is protected and requires authentication to access. Please ensure you are logged in or provide valid session cookies in the backend configuration.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-amber px-5 py-2.5 font-mono text-xs font-semibold text-void transition-all hover:bg-amber-bright active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
