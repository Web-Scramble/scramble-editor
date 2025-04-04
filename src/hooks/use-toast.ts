
import { useState, useEffect } from "react";

type ToastProps = {
  id: string;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

const TOAST_DURATION = 5000;

type ToastActionProps = {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((currentToasts) => currentToasts.slice(1));
      }, toasts[0].duration || TOAST_DURATION);

      return () => clearTimeout(timer);
    }
  }, [toasts]);

  function toast({
    title,
    description,
    action,
    variant = "default",
    duration = TOAST_DURATION,
  }: ToastActionProps) {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((currentToasts) => [
      ...currentToasts,
      { id, title, description, action, variant, duration },
    ]);

    return {
      id,
      dismiss: () => setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id)),
    };
  }

  return {
    toasts,
    toast,
    dismiss: (toastId: string) => setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId)),
  };
}

// Export a named toast function for convenience
export const toast = (props: ToastActionProps) => {
  const { toast: toastFn } = useToast();
  return toastFn(props);
};
