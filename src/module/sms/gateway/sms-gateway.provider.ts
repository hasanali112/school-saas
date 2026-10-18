import { HttpService } from '@nestjs/axios';
import type { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '@config/app/app.config';
import { smsConfig } from '@config/sms/sms.config';
import { FailoverSmsGateway } from './failover-sms.gateway';
import { HttpSmsGateway } from './http-sms.gateway';
import { LogSmsGateway } from './log-sms.gateway';
import { SMS_GATEWAY } from './sms.gateway';
import type { SmsGateway } from './sms.gateway';

/**
 * Builds the gateway chain from config: primary (+ optional secondary) HTTP adapters
 * behind failover, or the logging stand-in when nothing is configured (dev only).
 */
export const smsGatewayProvider: Provider = {
  provide: SMS_GATEWAY,
  inject: [smsConfig.KEY, appConfig.KEY, HttpService],
  useFactory: (
    sms: ConfigType<typeof smsConfig>,
    app: ConfigType<typeof appConfig>,
    http: HttpService,
  ): SmsGateway => {
    const { primary, secondary, senderId } = sms;
    if (!primary) return new LogSmsGateway(app.isProduction);
    return new FailoverSmsGateway(
      new HttpSmsGateway(http, { name: 'primary', ...primary, senderId }),
      secondary &&
        new HttpSmsGateway(http, { name: 'secondary', ...secondary, senderId }),
    );
  },
};
