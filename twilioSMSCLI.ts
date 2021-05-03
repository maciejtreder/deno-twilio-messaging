import yargs from 'https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts';
import * as _ from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';
import { TwilioSMS, SMSRequest } from 'https://raw.githubusercontent.com/maciejtreder/deno-twilio-messaging/step1/twilioSMS.ts';

interface Arguments {
    from: string;
    to: string;
    body: string;
    sid: string;
    apikey: string;
    secret: string;
}

let inputArgs: Arguments = yargs(Deno.args)
    .alias('f', 'from')
    .alias('t', 'to')
    .alias('b', 'body')
    .alias('i', 'sid')
    .alias('k', 'apikey')
    .alias('s', 'secret').argv;

let errorMessages: {[k: string]: string} = {
    from: 'Provide the message sender (From:) value using --from [-f] parameter',
    to: 'Provide the message receiver (To:) value using --to [-t] parameter',
    body: 'Provide the message body value using --body [-b] parameter',
    apikey: 'Provide your Twilio API key SID using --apikey [-k] parameter',
    sid: 'Provide your Twilio account SID using --sid [-i] parameter',
    secret: 'Provide your Twilio API key secret using --secret [-s] parameter'
};

inputArgs = _.defaults(inputArgs, {
    sid: Deno.env.get('TWILIO_ACCOUNT_SID'),
    apikey: Deno.env.get('TWILIO_API_KEY'),
    secret: Deno.env.get('TWILIO_API_SECRET'),
    from: Deno.env.get('TWILIO_PHONE_NUMBER')
});
inputArgs = <any> _.pickBy(inputArgs, _.identity);


let errors: string[] = _.difference(_.keys(errorMessages), _.keys(inputArgs));
if (errors.length > 0) {
    errors.forEach(error => console.log(errorMessages[error]));
    console.log('Proper program usage is: deno run --allow-env --allow-net twilioSMSCLI.ts --from +123456788 --to +987654321 --body "Hello Deno" --sid ABCD --apikey EFGH --secret IJKL');
    Deno.exit(1)
}

const message: SMSRequest = {
    From: inputArgs.from,
    To: inputArgs.to,
    Body: inputArgs.body,
};
const helper = new TwilioSMS(inputArgs.sid, inputArgs.apikey, inputArgs.secret);
helper.sendSms(message).subscribe(console.log);