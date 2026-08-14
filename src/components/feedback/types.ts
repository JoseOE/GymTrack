import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type FeedbackIcon = ComponentProps<typeof Ionicons>['name'];
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type DialogTone = 'normal' | 'warning' | 'danger';

export type ToastOptions = {
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: DialogTone;
  icon?: FeedbackIcon;
  onConfirm: () => void | Promise<void>;
};
