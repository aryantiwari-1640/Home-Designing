import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useOutletContext } from 'react-router';
import { REDIRECT_DELAY_MS, PROGRESS_INCREMENT } from '../lib/constants';

const Upload = ({ onComplete }: { onComplete: (data: string) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      let currentProgress = 0;

      const interval = setInterval(() => {
        currentProgress += 10; // Increment progress
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete(base64Data); // Call onComplete with Base64 data
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INCREMENT);
    };

    reader.readAsDataURL(file); // Read file as Base64
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (!isSignedIn) return; // Block upload logic if not signed in

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isSignedIn) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return; // Block upload logic if not signed in

    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? 'Click to Upload or just drag and drop'
                : 'Sign in with Puter to Upload'}
            </p>
            <p className="help">Maximum File Size 50 MB</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <h3>{file.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? 'Analyzing Floor Plan' : 'Redirecting'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;