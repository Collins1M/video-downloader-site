"use client";

import { ShieldAlert, CheckCircle, X } from "lucide-react";

interface AgeConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AgeConsentModal({ isOpen, onConfirm, onCancel }: AgeConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-amber/30 bg-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 text-ink-muted hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-amber">
          <div className="rounded-xl bg-amber/10 p-2.5">
            <ShieldAlert className="h-6 w-6 text-amber" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">18+ Content Warning</h3>
            <p className="font-mono text-xs text-amber/90">Age Verification Required</p>
          </div>
        </div>

        <p className="mt-4 font-mono text-xs leading-relaxed text-ink-muted">
          This video content is age-restricted or restricted to specific audiences by the platform.
          Please confirm that you meet the legal age requirement (18+) to proceed with analyzing and downloading this video.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-4 py-2.5 font-mono text-xs text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber px-5 py-2.5 font-mono text-xs font-semibold text-void transition-all hover:bg-amber-bright active:scale-95"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
