"use client";

import React, { useState } from "react";

interface SocialPostPreviewProps {
  generatedTextPost: string; // This is the descriptive text for the post
  videoClipUrl: string; // This will initially be the local URL (e.g., /api/download-clip?file=...)
  // You might also pass the original video ID or clip details if needed for other actions
}

const SocialPostPreview: React.FC<SocialPostPreviewProps> = ({
  generatedTextPost,
  videoClipUrl,
}) => {
  const [toPhoneNumber, setToPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSendMms = async () => {
    if (!toPhoneNumber) {
      setStatusMessage("Please enter a recipient phone number.");
      setIsError(true);
      return;
    }
    if (!videoClipUrl) {
      setStatusMessage("Video clip URL is missing.");
      setIsError(true);
      return;
    }
    // generatedTextPost is no longer directly sent in the SMS, but we might keep this check
    // if it indicates a state where sending shouldn't occur.
    // For now, we only need videoClipUrl to get the DO Spaces URL.

    setIsSending(true);
    setStatusMessage("Preparing to send link via SMS...");
    setIsError(false);

    try {
      // Step 1: Ensure videoClipUrl is absolute (if it's a local relative path)
      let absoluteLocalClipUrl = videoClipUrl;
      if (videoClipUrl.startsWith("/")) {
        absoluteLocalClipUrl = window.location.origin + videoClipUrl;
      }

      // Step 2: Upload to DigitalOcean Spaces to get a public URL
      setStatusMessage("Uploading video to secure storage for link sharing...");
      const uploadResponse = await fetch("/api/upload-to-space", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: absoluteLocalClipUrl }),
      });

      const uploadResult = await uploadResponse.json();
      if (
        !uploadResponse.ok ||
        !uploadResult.success ||
        !uploadResult.publicUrl
      ) {
        throw new Error(
          uploadResult.error || "Failed to upload video to get public link."
        );
      }

      const publicSpacesUrl = uploadResult.publicUrl;
      setStatusMessage(`Video link: ${publicSpacesUrl}. Now sending SMS...`);

      // Step 3: Send SMS containing the public Spaces URL
      const smsResponse = await fetch("/api/send-mms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhoneNumber: toPhoneNumber.startsWith("+")
            ? toPhoneNumber
            : `+${toPhoneNumber}`,
          messageBody: publicSpacesUrl, // Send the DO Spaces URL as the message body
          // No mediaUrl here, no generatedTextPost here (unless you decide to add it to the SMS body as well)
        }),
      });

      const smsResult = await smsResponse.json();

      if (!smsResponse.ok) {
        throw new Error(
          smsResult.error || `Failed to send SMS (status ${smsResponse.status})`
        );
      }

      setStatusMessage(
        smsResult.statusMessage ||
          `SMS sent successfully! SID: ${smsResult.messageSid}`
      );
      setIsError(false);
      setToPhoneNumber(""); // Clear phone number on success
    } catch (error: unknown) {
      console.error("Error in sending process:", error);
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("An unknown error occurred while sending the SMS.");
      }
      setIsError(true);
    }
    setIsSending(false);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        margin: "20px",
        borderRadius: "8px",
        maxWidth: "500px",
      }}
    >
      <h3 style={{ marginTop: "0" }}>Social Media Post Preview</h3>
      <div
        style={{
          marginBottom: "15px",
          padding: "10px",
          border: "1px solid #eee",
          borderRadius: "4px",
          background: "#f9f9f9",
        }}
      >
        <p style={{ whiteSpace: "pre-wrap", color: "black" }}>
          <strong>Social Post Text (for context):</strong>
          <br />
          {generatedTextPost || "No text generated yet."}
        </p>
        {videoClipUrl && (
          <div style={{ marginTop: "10px" }}>
            <p>
              <strong>Video Clip Preview:</strong>
            </p>
            <video width="100%" controls src={videoClipUrl} key={videoClipUrl}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4>Send Video Link via SMS</h4>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="phoneNumber" style={{ marginRight: "10px" }}>
            Recipient Phone (E.164 e.g., +12223334444):
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={toPhoneNumber}
            onChange={(e) => setToPhoneNumber(e.target.value)}
            placeholder="+12223334444"
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            disabled={isSending}
          />
        </div>
        <button
          onClick={handleSendMms}
          disabled={isSending || !videoClipUrl} // Only need videoClipUrl to proceed now
          style={{
            padding: "10px 15px",
            backgroundColor: isSending ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSending ? "not-allowed" : "pointer",
          }}
        >
          {isSending
            ? statusMessage && statusMessage.startsWith("Uploading")
              ? "Preparing Link..."
              : "Sending Link..."
            : "Send Video Link via SMS"}
        </button>
        {statusMessage && (
          <p style={{ color: isError ? "red" : "green", marginTop: "10px" }}>
            {statusMessage}
          </p>
        )}
      </div>

      {/* TODO: Add other actions like Copy Text, Edit, Share to other platforms */}
    </div>
  );
};

export default SocialPostPreview;
