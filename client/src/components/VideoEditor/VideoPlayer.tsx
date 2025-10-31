import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Scissors,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate: (currentTime: number) => void;
  onDuration: (duration: number) => void;
  selectedRange: { start: number; end: number } | null;
  onRangeSelect: (start: number, end: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  onTimeUpdate,
  onDuration,
  selectedRange,
  onRangeSelect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);

  const playerRef = useRef<ReactPlayer | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loadedSeconds: number;
  }) => {
    setCurrentTime(state.playedSeconds);
    onTimeUpdate(state.playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
    onDuration(duration);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    if (isSelecting) {
      if (selectionStart === null) {
        setSelectionStart(newTime);
      } else {
        const start = Math.min(selectionStart, newTime);
        const end = Math.max(selectionStart, newTime);
        onRangeSelect(start, end);
        setSelectionStart(null);
        setIsSelecting(false);
      }
    } else {
      playerRef.current?.seekTo(newTime, "seconds");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerRef.current?.seekTo(newTime, "seconds");
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative aspect-video">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          onProgress={handleProgress}
          onDuration={handleDuration}
          controls={false}
        />

        {/* Selection Overlay */}
        {selectedRange && (
          <div
            className="absolute top-0 bg-blue-500 bg-opacity-30 border-2 border-blue-500"
            style={{
              left: `${(selectedRange.start / duration) * 100}%`,
              width: `${
                ((selectedRange.end - selectedRange.start) / duration) * 100
              }%`,
              height: "100%",
            }}
          >
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
              {formatTime(selectedRange.start)} -{" "}
              {formatTime(selectedRange.end)}
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4 bg-gray-900">
        <div
          ref={timelineRef}
          className="relative h-8 bg-gray-700 rounded cursor-pointer mb-4"
          onClick={handleTimelineClick}
        >
          {/* Progress Bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 w-1 h-full bg-white"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />

          {/* Selection Range */}
          {selectedRange && (
            <div
              className="absolute top-0 h-full bg-yellow-400 bg-opacity-50"
              style={{
                left: `${(selectedRange.start / duration) * 100}%`,
                width: `${
                  ((selectedRange.end - selectedRange.start) / duration) * 100
                }%`,
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSkip(-10)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsSelecting(!isSelecting);
                setSelectionStart(null);
              }}
              className={`p-2 rounded ${
                isSelecting ? "bg-yellow-600" : "hover:bg-gray-700"
              }`}
            >
              <Scissors className="w-5 h-5" />
            </button>

            <span className="text-xs text-gray-400">
              {isSelecting
                ? "Click timeline to select range"
                : "Select range for editing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
