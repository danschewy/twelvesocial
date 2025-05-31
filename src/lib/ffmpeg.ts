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
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(TEMP_CLIP_DIR, outputFileName);
    const duration = endTime - startTime;

    if (duration <= 0) {
      return reject(new Error("End time must be after start time."));
    }

    // FFmpeg command arguments
    // -i <sourceUrl>: input file
    // -ss <startTime>: seek to start time
    // -t <duration>: record for duration
    // -c copy: stream copy (no re-encoding, fast if possible)
    //    Note: -c copy might not always work with HLS streams if precise cutting is needed
    //          or if the segments are not perfectly aligned.
    //          If issues arise, re-encoding might be necessary (e.g., -c:v libx264 -c:a aac).
    // -y: overwrite output file if it exists
    // -loglevel error: suppress verbose output, only show errors
    const ffmpegArgs = [
      "-y", // Overwrite output files without asking
      "-loglevel",
      "error", // Only log errors
      "-i",
      sourceUrl,
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(), // Use -t for duration instead of -to, as -to with -ss can be tricky with HLS
      // '-c', 'copy', // Try stream copy first for speed
      // If stream copy fails or gives inaccurate clips with HLS, consider re-encoding:
      "-c:v",
      "libx264", // Video codec
      "-c:a",
      "aac", // Audio codec
      "-strict",
      "experimental", // For aac
      outputFilePath,
    ];

    console.log(`Executing FFmpeg: ffmpeg ${ffmpegArgs.join(" ")}`);

    const ffmpegProcess = spawn("ffmpeg", ffmpegArgs);

    let stdErrOutput = "";

    ffmpegProcess.stdout.on("data", (data) => {
      // FFmpeg usually outputs progress to stderr, but stdout might have some info.
      console.log(`FFmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.error(`FFmpeg stderr: ${data}`);
      stdErrOutput += data.toString(); // Capture stderr for error reporting
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log(
          `FFmpeg process exited successfully. Clip saved to ${outputFilePath}`
        );
        resolve({ filePath: outputFilePath, fileName: outputFileName });
      } else {
        console.error(`FFmpeg process exited with code ${code}.`);
        console.error("FFmpeg stderr output:", stdErrOutput);
        reject(
          new Error(
            `FFmpeg failed: ${
              stdErrOutput || "Unknown error"
            }. Exit code: ${code}`
          )
        );
      }
    });

    ffmpegProcess.on("error", (err) => {
      console.error("Failed to start FFmpeg process:", err);
      reject(err);
    });
  });
}
