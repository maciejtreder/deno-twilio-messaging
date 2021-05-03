import {
  from,
  timer,
} from 'https://cdn.skypack.dev/rxjs@6.6.6';
import {
  flatMap,
  distinct,
  takeWhile,
  takeUntil,
} from 'https://cdn.skypack.dev/rxjs@6.6.6/operators';
import * as base64 from 'https://denopkg.com/chiefbiiko/base64/mod.ts';

export interface SMSRequest {
  From: string;
  To: string;
  Body: string;
}

export class TwilioSMS {
  private authorizationHeader: string;

  constructor(
    private accountSID: string,
    keySID: string,
    secret: string
  ) {
    this.authorizationHeader =
      'Basic ' +
      base64.fromUint8Array(
        new TextEncoder().encode(keySID + ':' + secret)
      );
  }

  public sendSms(payload: SMSRequest) {
    return from(
      this.postSMSRequest(
        <{ [key: string]: string }>(<unknown>payload)
      )
    ).pipe(
      flatMap((uri: string) => this.pollRequestStatus(uri))
    );
  }

  private async postSMSRequest(payload: {
    [key: string]: string;
  }): Promise<string> {
    const request = fetch(
      'https://api.twilio.com/2010-04-01/Accounts/' +
        this.accountSID +
        '/Messages.json',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded;charset=UTF-8',
          Authorization: this.authorizationHeader,
        },
        body: Object.keys(payload)
          .map((key) => {
            return (
              encodeURIComponent(key) +
              '=' +
              encodeURIComponent(payload[key])
            );
          })
          .join('&'),
      }
    )
      .then((resp) => resp.json())
      .then((resp) => resp.uri);

    return await request;
  }

  private pollRequestStatus(
    uri: string
  ) {
    const timeout = timer(10 * 1000);

    return timer(0, 500).pipe(
      flatMap(() => {
        return from(
          fetch('https://api.twilio.com' + uri, {
            headers: {
              Authorization: this.authorizationHeader,
            },
          })
            .then((resp) => resp.json())
            .then((resp) => resp.status)
        );
      }),
      distinct(),
      takeWhile(
        (status: string) => status != 'delivered',
        true
      ),
      takeUntil(timeout)
    );
  }
}
