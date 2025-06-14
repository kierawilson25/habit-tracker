'use client';
import { useEffect } from 'react';

type Props = {
  message: string;
  visible: boolean;
  onClose: () => void;
};

export default function Toast({ message, visible, onClose }: Props) {
  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(onClose, 3000); // auto-hide after 3s
      return () => clearTimeout(timeout);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
    </div>
  );
}
