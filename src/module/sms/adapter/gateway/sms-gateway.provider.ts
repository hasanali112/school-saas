import { HttpService } from '@nestjs/axios';
import type { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '@config/app/app.config';
import { smsConfig } from '@config/sms/sms.config';
import { FailoverSmsGateway } from './failover-sms.gateway';
import { HttpSmsGateway } from './http-sms.gateway';
import { LogSmsGateway } from './log-sms.gateway';
import { SmsGatewayPort } from '../../port/sms-gateway.port';

/**
 * Builds the gateway chain from config: primary (+ optional secondary) HTTP adapters
 * behind failover, or the logging stand-in when nothing is configured (dev only).
 */
export const smsGatewayProvider: Provider = {
  provide: SmsGatewayPort,
  inject: [smsConfig.KEY, appConfig.KEY, HttpService],
  useFactory: (
    sms: ConfigType<typeof smsConfig>,
    app: ConfigType<typeof appConfig>,
    http: HttpService,
  ): SmsGatewayPort => {
    const { primary, secondary, senderId } = sms;
    if (!primary) return new LogSmsGateway(app.isProduction);
    return new FailoverSmsGateway(
      new HttpSmsGateway(http, { name: 'primary', ...primary, senderId }),
      secondary &&
        new HttpSmsGateway(http, { name: 'secondary', ...secondary, senderId }),
    );
  },
};
