import React, { useState, useCallback } from "react";
import { VideoUpload } from "./VideoUpload";
import { VideoPlayer } from "./VideoPlayer";
import { EditPanel } from "./EditPanel";
import { Wand2, Download, Save } from "lucide-react";

interface EditAction {
  id: string;
  action: string;
  startTime?: number;
  endTime?: number;
  value?: number;
  timestamp: Date;
}

interface VideoFile {
  file: File;
  url: string;
  name: string;
  duration: number;
}

export const VideoEditor: React.FC = () => {
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [editActions, setEditActions] = useState<EditAction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(
    null
  );

  const handleVideoUpload = useCallback(async (file: File) => {
    setIsUploading(true);

    try {
      // Create object URL for immediate preview
      const url = URL.createObjectURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      setUploadedVideo({
        file,
        url: result.url || url, // Use server URL if available, fallback to object URL
        name: file.name,
        duration: 0, // Will be set by video player
      });
    } catch (error) {
      console.error("Upload error:", error);
      // Fallback to local preview
      const url = URL.createObjectURL(file);
      setUploadedVideo({
        file,
        url,
        name: file.name,
        duration: 0,
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRangeSelect = useCallback((start: number, end: number) => {
    setSelectedRange({ start, end });
  }, []);

  const handleApplyEdit = useCallback(
    async (action: string, value?: number) => {
      if (!uploadedVideo || !selectedRange) return;

      const editAction: EditAction = {
        id: Date.now().toString(),
        action,
        startTime: selectedRange.start,
        endTime: selectedRange.end,
        value,
        timestamp: new Date(),
      };

      setEditActions((prev) => [...prev, editAction]);

      // Clear selection after applying edit
      setSelectedRange(null);
    },
    [uploadedVideo, selectedRange]
  );

  const handleAIEdit = useCallback(async () => {
    if (!uploadedVideo) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: uploadedVideo.url,
          filename: uploadedVideo.name,
        }),
      });

      if (!response.ok) {
        throw new Error("AI editing failed");
      }

      const result = await response.json();

      // Add AI-generated actions
      if (result.actions) {
        const aiActions: EditAction[] = result.actions.map(
          (
            action: {
              action: string;
              start_time?: number;
              end_time?: number;
              value?: number;
            },
            index: number
          ) => ({
            id: `ai-${Date.now()}-${index}`,
            action: action.action,
            startTime: action.start_time,
            endTime: action.end_time,
            value: action.value,
            timestamp: new Date(),
          })
        );

        setEditActions((prev) => [...prev, ...aiActions]);
      }
    } catch (error) {
      console.error("AI editing error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedVideo]);

  const handleProcessVideo = useCallback(async () => {
    if (!uploadedVideo || editActions.length === 0) return;

    setIsProcessing(true);

    try {
      const response = await fetch("/api/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: uploadedVideo.url,
          filename: uploadedVideo.name,
          actions: editActions,
        }),
      });

      if (!response.ok) {
        throw new Error("Video processing failed");
      }

      const result = await response.json();
      setProcessedVideoUrl(result.processedVideoUrl);
    } catch (error) {
      console.error("Processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedVideo, editActions]);

  const handleRemoveEdit = useCallback((id: string) => {
    setEditActions((prev) => prev.filter((action) => action.id !== id));
  }, []);

  if (!uploadedVideo) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Video Editor
          </h1>
          <p className="text-gray-600">
            Upload a video to start editing with AI assistance
          </p>
        </div>

        <VideoUpload
          onVideoUpload={handleVideoUpload}
          isUploading={isUploading}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Video Editor
        </h1>
        <p className="text-gray-600">Editing: {uploadedVideo.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <VideoPlayer
            videoUrl={uploadedVideo.url}
            onTimeUpdate={() => {}}
            onDuration={() => {}}
            selectedRange={selectedRange}
            onRangeSelect={handleRangeSelect}
          />

          {/* Processing Preview */}
          {processedVideoUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Processed Video</h3>
              <VideoPlayer
                videoUrl={processedVideoUrl}
                onTimeUpdate={() => {}}
                onDuration={() => {}}
                selectedRange={null}
                onRangeSelect={() => {}}
              />
              <div className="mt-4 flex space-x-2">
                <a
                  href={processedVideoUrl}
                  download
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Edit Panel */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              <span>AI Assistant</span>
            </h3>

            <button
              onClick={handleAIEdit}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>AI Auto-Edit</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              AI will analyze your video and suggest edits automatically
            </p>
          </div>

          {/* Manual Edit Controls */}
          <EditPanel
            selectedRange={selectedRange}
            onApplyEdit={handleApplyEdit}
            editActions={editActions}
            onRemoveEdit={handleRemoveEdit}
          />

          {/* Process Video */}
          {editActions.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Process Video</h3>

              <button
                onClick={handleProcessVideo}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Apply Edits</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                {editActions.length} edit{editActions.length !== 1 ? "s" : ""}{" "}
                to apply
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
