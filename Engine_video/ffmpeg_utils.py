import subprocess
import re
from pathlib import Path
import shutil

def safe_filename(name):
    # Replace unsafe chars with underscore
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', name)

def ffmpeg_trim(input_path, output_path, seconds):
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Always make a fresh safe output filename
    safe_name = safe_filename(input_path.stem)
    output_path = Path(output_path.parent) / f"{safe_name}_trimmed.mp4"

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(seconds),
        "-i", str(input_path),
        "-c", "copy",
        str(output_path)
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        print("FFmpeg error:", e.stderr.decode())
        raise

    return str(output_path)
