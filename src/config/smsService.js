const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID; // Optional
const client = new twilio(accountSid, authToken);

exports.sendInvitationSMS = async (phone) => {
  const message = `Hey! Join me on WhatsApp Expo App. Click here to register: https://yourapp.link`;

  try {
    const response = await client.messages.create({
      body: message,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
    });
    console.log("SMS sent successfully:", response.sid);
    return response;
  } catch (error) {
    console.error("Failed to send SMS:", error.message);
    throw new Error("Failed to send SMS");
  }
};
