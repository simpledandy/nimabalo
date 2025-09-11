import { useState, useCallback } from 'react';

interface ConfirmationConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary' | 'secondary';
  icon?: string;
}

interface ConfirmationState {
  isOpen: boolean;
  config: ConfirmationConfig;
  onConfirm: (() => void) | null;
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    config: {},
    onConfirm: null,
  });

  const confirm = useCallback((
    onConfirm: () => void,
    config: ConfirmationConfig = {}
  ) => {
    setState({
      isOpen: true,
      config,
      onConfirm,
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    close();
  }, [state.onConfirm, close]);

  return {
    isOpen: state.isOpen,
    config: state.config,
    confirm,
    close,
    handleConfirm,
  };
}
