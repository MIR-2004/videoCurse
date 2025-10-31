import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import { spawn } from "child_process";
import path from "path";

export const processWithPython = async (videoPath: string, actions: any) => {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(videoPath));
  formData.append("actions", JSON.stringify(actions));

  const response = await axios.post(process.env.PYTHON_BACKEND!, formData, {
    headers: formData.getHeaders(),
  });

  return response.data.outputPath;
};

export const videoProcessor = {
  async processVideo(
    inputPath: string,
    outputPath: string,
    actions: any[]
  ): Promise<void> {
    try {
      // Send to Python/FFmpeg backend for processing
      const engineUrl = process.env.ENGINE_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("file", fs.createReadStream(inputPath));
      formData.append("actions", JSON.stringify({ actions }));
      formData.append("output_path", outputPath);

      const response = await axios.post(`${engineUrl}/process`, formData, {
        headers: formData.getHeaders(),
        timeout: 300000, // 5 minutes timeout for video processing
      });

      if (response.data.status !== "success") {
        throw new Error("Video processing failed on engine");
      }

      // The Python engine processes the video directly to the output path
      // No need to stream back since it's on the same filesystem
      console.log(`Video processed successfully: ${response.data.output}`);
    } catch (error) {
      console.error("Video processing error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Video processing failed: ${
            error.response?.data?.detail || error.message
          }`
        );
      }
      throw new Error("Failed to process video");
    }
  },

  async getVideoInfo(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        videoPath,
      ]);

      let output = "";
      let errorOutput = "";

      ffprobe.stdout.on("data", (data: Buffer) => {
        output += data.toString();
      });

      ffprobe.stderr.on("data", (data: Buffer) => {
        errorOutput += data.toString();
      });

      ffprobe.on("close", (code: number) => {
        if (code === 0) {
          try {
            const info = JSON.parse(output);
            resolve({
              duration: parseFloat(info.format.duration) || 0,
              size: parseInt(info.format.size) || 0,
              bitrate: parseInt(info.format.bit_rate) || 0,
              streams: info.streams || [],
            });
          } catch (error) {
            reject(new Error("Failed to parse video info"));
          }
        } else {
          reject(new Error(`ffprobe failed with code ${code}: ${errorOutput}`));
        }
      });

      ffprobe.on("error", (error) => {
        reject(new Error(`ffprobe error: ${error.message}`));
      });
    });
  },
};
