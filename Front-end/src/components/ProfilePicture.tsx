'use client';

import React, { useRef, useState } from 'react';
import { Avatar, Button } from '@/components';

interface ProfilePictureProps {
  currentUrl?: string | null;
  username: string;
  onUpload?: (file: File) => Promise<string | null>;
  editable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  currentUrl,
  username,
  onUpload,
  editable = false,
  size = 'xl',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUpload) return;

    try {
      setError(null);
      setUploading(true);

      // Client-side validation
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload
      const url = await onUpload(file);
      if (!url) {
        throw new Error('Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setPreviewUrl(null);
      console.error('Error uploading profile picture:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar
        src={previewUrl || currentUrl}
        alt={username}
        size={size}
      />

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={handleUploadClick}
            disabled={uploading}
            type="secondary"
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePicture;
