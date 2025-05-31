import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid) {
  console.warn("TWILIO_ACCOUNT_SID is not set in environment variables.");
}
if (!authToken) {
  console.warn("TWILIO_AUTH_TOKEN is not set in environment variables.");
}
if (!twilioPhoneNumber) {
  console.warn("TWILIO_PHONE_NUMBER is not set in environment variables.");
}

let twilioClient: twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
  console.log("Twilio client initialized.");
} else {
  console.warn(
    "Twilio client not initialized due to missing credentials. MMS sending will not work."
  );
}

export { twilioClient, twilioPhoneNumber };
