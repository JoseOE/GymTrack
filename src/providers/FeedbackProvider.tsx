import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { AppToast } from '@/components/feedback/AppToast';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import type { ConfirmOptions, ToastOptions } from '@/components/feedback/types';

type ActiveToast = ToastOptions & { id: number };
type FeedbackContextValue = {
  showToast: (options: ToastOptions) => void;
  confirm: (options: ConfirmOptions) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const showToast = useCallback((options: ToastOptions) => setToast({ ...options, id: Date.now() }), []);
  const confirm = useCallback((options: ConfirmOptions) => { setDialogLoading(false); setDialog(options); }, []);
  const closeToast = useCallback(() => setToast(null), []);
  const closeDialog = useCallback(() => { if (!dialogLoading) setDialog(null); }, [dialogLoading]);
  const handleConfirm = useCallback(async () => {
    if (!dialog) return;
    setDialogLoading(true);
    try {
      await dialog.onConfirm();
      setDialog(null);
    } catch (reason) {
      showToast({ type: 'error', title: 'No se pudo completar', message: reason instanceof Error ? reason.message : 'Inténtalo nuevamente.' });
      setDialog(null);
    } finally {
      setDialogLoading(false);
    }
  }, [dialog, showToast]);

  const value = useMemo(() => ({ showToast, confirm }), [confirm, showToast]);
  return <FeedbackContext.Provider value={value}>{children}{toast ? <AppToast key={toast.id} onDismiss={closeToast} toast={toast} /> : null}<ConfirmDialog loading={dialogLoading} onCancel={closeDialog} onConfirm={() => void handleConfirm()} options={dialog} /></FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de FeedbackProvider.');
  return context;
}
