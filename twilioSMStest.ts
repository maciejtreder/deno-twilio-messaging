import { TwilioSMS, SMSRequest } from 'https://raw.githubusercontent.com/maciejtreder/deno-twilio-messaging/step1/twilioSMS.ts';

const accountSid: string = <string>(
  Deno.env.get('TWILIO_ACCOUNT_SID')
);
const keySid: string = <string>(
  Deno.env.get('TWILIO_API_KEY')
);
const secret: string = <string>(
  Deno.env.get('TWILIO_API_SECRET')
);
const phoneNumber: string = <string>(
  Deno.env.get('TWILIO_PHONE_NUMBER')
);

const message: SMSRequest = {
  From: phoneNumber,
  To: '+12345678910',
  Body: 'Welcome to Twilio and Deno 🦕',
};

const helper = new TwilioSMS(accountSid, keySid, secret);
helper.sendSms(message).subscribe(console.log);
