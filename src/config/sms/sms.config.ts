import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { validateConfig } from '@common/utils/validate/validate-config';
import { SmsConfig, SmsGatewayConfig } from './sms.type';

const MIN_DLR_SECRET_LENGTH = 16;
/** BDT 0.30, the common bulk rate in Bangladesh. */
const DEFAULT_SEGMENT_COST_PAISA = 30;

/** Leave the primary URL unset in development to log SMS instead of sending. */
class SmsEnv {
  @IsOptional()
  @IsUrl({ require_tld: false })
  SMS_GATEWAY_URL?: string;

  @IsOptional()
  @IsString()
  SMS_GATEWAY_API_KEY?: string;

  @IsOptional()
  @IsString()
  SMS_SENDER_ID?: string;

  /** Second provider for failover (F1-12). Optional even in production. */
  @IsOptional()
  @IsUrl({ require_tld: false })
  SMS_SECONDARY_GATEWAY_URL?: string;

  @IsOptional()
  @IsString()
  SMS_SECONDARY_GATEWAY_API_KEY?: string;

  /** Shared secret the providers send back on delivery-report callbacks. */
  @IsOptional()
  @IsString()
  @MinLength(MIN_DLR_SECRET_LENGTH)
  SMS_DELIVERY_REPORT_SECRET?: string;

  /** Default price charged per segment when an institution has no rate of its own. */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  SMS_SEGMENT_COST_PAISA: number = DEFAULT_SEGMENT_COST_PAISA;
}

const gateway = (
  url?: string,
  apiKey?: string,
): SmsGatewayConfig | undefined => (url ? { url, apiKey } : undefined);

export const smsConfig = registerAs('sms', (): SmsConfig => {
  const env = validateConfig(SmsEnv, process.env);
  return {
    primary: gateway(env.SMS_GATEWAY_URL, env.SMS_GATEWAY_API_KEY),
    secondary: gateway(
      env.SMS_SECONDARY_GATEWAY_URL,
      env.SMS_SECONDARY_GATEWAY_API_KEY,
    ),
    senderId: env.SMS_SENDER_ID,
    deliveryReportSecret: env.SMS_DELIVERY_REPORT_SECRET,
    segmentCostPaisa: env.SMS_SEGMENT_COST_PAISA,
  };
});
