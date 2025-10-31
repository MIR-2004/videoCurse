import subprocess
import cv2
from ffmpeg_utils import ffmpeg_trim
from opencv_utils import adjust_contrast, adjust_brightness

def process_video(input_path, actions, output_path):
    temp_path = input_path

    for act in actions.get("actions", []):
        action = act["action"]
        value = act["value"]
        unit = act.get("unit", "")

        if action == "trim":
            temp_path = ffmpeg_trim(temp_path, output_path, value)

        elif action == "adjust_contrast":
            adjust_contrast(temp_path, output_path, value)
            temp_path = output_path

        elif action == "brightness":
            adjust_brightness(temp_path, output_path, value)
            temp_path = output_path

    return output_path
