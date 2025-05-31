import { NextRequest, NextResponse } from "next/server";
import { twilioClient, twilioPhoneNumber } from "@/lib/twilio";

interface SendTextMessageBody {
  toPhoneNumber: string;
  // mediaUrl is removed as we are sending the URL in the text body
  messageBody: string; // This will contain the public URL from DO Spaces
}

interface SendTextMessageErrorResponse {
  error: string;
  details?: string | object | null;
}

interface SendTextMessageSuccessResponse {
  success: true;
  messageSid: string;
  statusMessage: string;
}

interface TwilioError extends Error {
  code?: number | string; // Twilio error codes can be numbers or strings
  moreInfo?: string;
  status?: number; // HTTP status code
  // Add other properties if you observe them in Twilio error objects
}

export async function POST(request: NextRequest) {
  if (!twilioClient || !twilioPhoneNumber) {
    console.error(
      "Twilio client or phone number is not configured. Check environment variables."
    );
    return NextResponse.json<SendTextMessageErrorResponse>(
      { error: "SMS service is not configured on the server." }, // Changed MMS to SMS
      { status: 500 }
    );
  }

  try {
    const reqBody = (await request.json()) as SendTextMessageBody;
    const { toPhoneNumber, messageBody } = reqBody;

    if (!toPhoneNumber) {
      return NextResponse.json<SendTextMessageErrorResponse>(
        { error: "Recipient phone number (toPhoneNumber) is required." },
        { status: 400 }
      );
    }
    if (!messageBody) {
      return NextResponse.json<SendTextMessageErrorResponse>(
        { error: "Message body (messageBody) is required." }, // This will be the URL
        { status: 400 }
      );
    }
    // Basic phone number validation (you might want a more robust library for this)
    if (!/^\+[1-9]\d{1,14}$/.test(toPhoneNumber)) {
      return NextResponse.json<SendTextMessageErrorResponse>(
        {
          error:
            "Invalid recipient phone number format. Please use E.164 format (e.g., +12223334444).",
        },
        { status: 400 }
      );
    }
    if (!/^\+[1-9]\d{1,14}$/.test(twilioPhoneNumber)) {
      console.error(
        "Twilio phone number from environment is invalid: ",
        twilioPhoneNumber
      );
      return NextResponse.json<SendTextMessageErrorResponse>(
        { error: "SMS service is misconfigured (invalid sender number)." },
        { status: 500 }
      );
    }

    console.log(
      `Sending SMS with URL to: ${toPhoneNumber}, from: ${twilioPhoneNumber}, body: ${messageBody}`
    );

    // Send as SMS (no mediaUrl property)
    const textMessage = await twilioClient.messages.create({
      from: twilioPhoneNumber,
      to: toPhoneNumber,
      body: messageBody, // The messageBody now contains the public URL from DO Spaces
    });

    const statusMessage = "SMS with video URL sent successfully.";
    console.log(`${statusMessage} SID:`, textMessage.sid);

    return NextResponse.json<SendTextMessageSuccessResponse>(
      {
        success: true,
        messageSid: textMessage.sid,
        statusMessage: statusMessage,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error sending SMS via Twilio:", error);
    let errorMessage = "Failed to send SMS.";
    let errorDetails: string | object | null = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      const twilioError = error as TwilioError;
      if (twilioError.code) {
        errorDetails = {
          code: twilioError.code,
          moreInfo: twilioError.moreInfo,
        };
      }
    }

    return NextResponse.json<SendTextMessageErrorResponse>(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
