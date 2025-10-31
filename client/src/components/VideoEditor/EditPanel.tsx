import React from "react";
import { Scissors, Sparkles, Sun, Volume2, Trash2, Clock } from "lucide-react";

interface EditAction {
  id: string;
  action: string;
  startTime?: number;
  endTime?: number;
  value?: number;
  timestamp: Date;
}

interface EditPanelProps {
  selectedRange: { start: number; end: number } | null;
  onApplyEdit: (action: string, value?: number) => void;
  editActions: EditAction[];
  onRemoveEdit: (id: string) => void;
}

export const EditPanel: React.FC<EditPanelProps> = ({
  selectedRange,
  onApplyEdit,
  editActions,
  onRemoveEdit,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "cut_section":
        return <Scissors className="w-4 h-4" />;
      case "blur":
        return <Sparkles className="w-4 h-4" />;
      case "brightness":
        return <Sun className="w-4 h-4" />;
      case "volume":
        return <Volume2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionName = (action: string) => {
    switch (action) {
      case "cut_section":
        return "Cut Section";
      case "blur":
        return "Blur Effect";
      case "brightness":
        return "Brightness";
      case "volume":
        return "Volume";
      default:
        return action;
    }
  };

  return (
    <div className="space-y-4">
      {/* Manual Edit Controls */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Manual Edits</h3>

        {selectedRange ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              Selected: {formatTime(selectedRange.start)} -{" "}
              {formatTime(selectedRange.end)}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onApplyEdit("cut_section")}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <Scissors className="w-4 h-4" />
                <span>Cut</span>
              </button>

              <button
                onClick={() => onApplyEdit("blur")}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-4 h-4" />
                <span>Blur</span>
              </button>

              <button
                onClick={() => onApplyEdit("brightness", 1.2)}
                className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <Sun className="w-4 h-4" />
                <span>Brighten</span>
              </button>

              <button
                onClick={() => onApplyEdit("volume", 1.5)}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm transition-colors flex items-center justify-center space-x-1"
              >
                <Volume2 className="w-4 h-4" />
                <span>Volume+</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Select a range on the timeline to apply edits
          </p>
        )}
      </div>

      {/* Edit History */}
      {editActions.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Edit History</h3>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {editActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {getActionIcon(action.action)}
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {getActionName(action.action)}
                    </div>
                    {action.startTime !== undefined &&
                      action.endTime !== undefined && (
                        <div className="text-xs text-gray-500">
                          {formatTime(action.startTime)} -{" "}
                          {formatTime(action.endTime)}
                        </div>
                      )}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveEdit(action.id)}
                  className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
