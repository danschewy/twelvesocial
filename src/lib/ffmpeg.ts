import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// Define a temporary directory for generated clips
// Ensure this directory exists or is created by your application
const TEMP_CLIP_DIR = path.join(process.cwd(), "tmp", "generated-clips");

// Ensure the temporary directory exists
if (!fs.existsSync(TEMP_CLIP_DIR)) {
  fs.mkdirSync(TEMP_CLIP_DIR, { recursive: true });
}

interface ClipData {
  filePath: string;
  fileName: string;
  // Potentially add more metadata like duration if needed
}

/**
 * Try different FFmpeg configurations to handle various deployment environments
 */
async function tryFFmpegCommand(
  sourceUrl: string,
  startTime: number,
  duration: number,
  outputFilePath: string,
  attempt: number = 1
): Promise<void> {
  return new Promise((resolve, reject) => {
    let ffmpegArgs: string[];
    let env = { ...process.env };

    if (attempt === 1) {
      // First attempt: Optimized for containerized environments
      ffmpegArgs = [
        "-y",
        "-loglevel", "error",
        "-nostdin",
        "-hide_banner",
        "-i", sourceUrl,
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-avoid_negative_ts", "make_zero",
        outputFilePath,
      ];

      // Set environment variables to avoid PulseAudio issues
      env = {
        ...env,
        PULSE_RUNTIME_PATH: "/tmp/pulse-runtime",
        PULSE_STATE_PATH: "/tmp/pulse-state",
        PULSE_MACHINE_ID: "dummy",
        SDL_AUDIODRIVER: "dummy",
      };
    } else if (attempt === 2) {
      // Second attempt: Minimal configuration without audio processing
      ffmpegArgs = [
        "-y",
        "-loglevel", "error",
        "-nostdin",
        "-hide_banner",
        "-i", sourceUrl,
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-an", // No audio
        outputFilePath,
      ];
    } else {
      // Third attempt: Stream copy (fastest but may not work with all HLS streams)
      ffmpegArgs = [
        "-y",
        "-loglevel", "error",
        "-nostdin",
        "-hide_banner",
        "-i", sourceUrl,
        "-ss", startTime.toString(),
        "-t", duration.toString(),
        "-c", "copy",
        outputFilePath,
      ];
    }

    console.log(`FFmpeg attempt ${attempt}: ffmpeg ${ffmpegArgs.join(" ")}`);

    const ffmpegProcess = spawn("ffmpeg", ffmpegArgs, { env });
    let stdErrOutput = "";

    ffmpegProcess.stdout.on("data", (data) => {
      console.log(`FFmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.error(`FFmpeg stderr: ${data}`);
      stdErrOutput += data.toString();
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`FFmpeg attempt ${attempt} succeeded. Clip saved to ${outputFilePath}`);
        resolve();
      } else {
        console.error(`FFmpeg attempt ${attempt} failed with code ${code}.`);
        console.error("FFmpeg stderr output:", stdErrOutput);
        
        if (attempt < 3) {
          console.log(`Trying FFmpeg attempt ${attempt + 1}...`);
          tryFFmpegCommand(sourceUrl, startTime, duration, outputFilePath, attempt + 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(
            new Error(
              `All FFmpeg attempts failed. Last error: ${
                stdErrOutput || "Unknown error"
              }. Exit code: ${code}`
            )
          );
        }
      }
    });

    ffmpegProcess.on("error", (err) => {
      console.error(`Failed to start FFmpeg process (attempt ${attempt}):`, err);
      
      if (attempt < 3) {
        console.log(`Trying FFmpeg attempt ${attempt + 1}...`);
        tryFFmpegCommand(sourceUrl, startTime, duration, outputFilePath, attempt + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Extracts a clip from a video source (ideally an HLS stream) using FFmpeg.
 * @param sourceUrl The URL of the video source (e.g., HLS playlist m3u8 file).
 * @param startTime The start time of the clip in seconds.
 * @param endTime The end time of the clip in seconds.
 * @param outputFileName The desired name for the output file (e.g., 'clip-1.mp4').
 * @returns A promise that resolves with the path to the generated clip file.
 */
export async function extractClip(
  sourceUrl: string,
  startTime: number,
  endTime: number,
  outputFileName: string
): Promise<ClipData> {
  const outputFilePath = path.join(TEMP_CLIP_DIR, outputFileName);
  const duration = endTime - startTime;

  if (duration <= 0) {
    throw new Error("End time must be after start time.");
  }

  try {
    await tryFFmpegCommand(sourceUrl, startTime, duration, outputFilePath);
    return { filePath: outputFilePath, fileName: outputFileName };
  } catch (error) {
    console.error("All FFmpeg attempts failed:", error);
    throw error;
  }
}
