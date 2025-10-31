import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Video, AlertCircle } from "lucide-react";

interface VideoUploadProps {
  onVideoUpload: (file: File) => void;
  isUploading: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideoUpload,
  isUploading,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadError(null);
        onVideoUpload(file);
      }
    },
    [onVideoUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"],
    },
    multiple: false,
    onError: (error) => {
      setUploadError(error.message);
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />

        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg font-medium text-gray-600">
                Uploading video...
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                {isDragActive ? (
                  <Upload className="w-8 h-8 text-blue-600" />
                ) : (
                  <Video className="w-8 h-8 text-gray-600" />
                )}
              </div>

              {isDragActive ? (
                <p className="text-lg font-medium text-blue-600">
                  Drop your video here!
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    Drag & drop your video here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports: MP4, AVI, MOV, WMV, FLV, WebM, MKV
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}
    </div>
  );
};
