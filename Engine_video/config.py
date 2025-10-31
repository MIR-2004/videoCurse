import os

# API Configuration
API_KEY = os.getenv("API_KEY", "your-secure-api-key-123")

# Directory Configuration
INPUT_DIR = os.getenv("INPUT_DIR", "./uploads")
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# FFmpeg Configuration
FFMPEG_TIMEOUT = int(os.getenv("FFMPEG_TIMEOUT", "300"))  # 5 minutes default
FFMPEG_PATH = os.getenv("FFMPEG_PATH")
