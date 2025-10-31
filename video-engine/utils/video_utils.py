import cv2
import numpy as np
from moviepy.editor import VideoFileClip
from utils.filters import apply_filter

def process_video(input_path, actions, output_path):
    clip = VideoFileClip(input_path)
    frames = []

    for frame in clip.iter_frames(fps=clip.fps, dtype="uint8"):
        frame = apply_filter(frame, actions)
        frames.append(frame)

    # Write processed video
    processed_clip = VideoFileClip(input_path)
    processed_clip = processed_clip.set_make_frame(lambda t: frames[int(t * clip.fps)])
    processed_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
