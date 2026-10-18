import { HttpService } from '@nestjs/axios';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import type { RawAxiosRequestHeaders } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { SmsDelivery } from '../../domain/sms';
import { SmsGatewayPort } from '../../port/sms-gateway.port';

export interface HttpSmsGatewayOptions {
  /** Label written to the delivery log (`primary` / `secondary`). */
  name: string;
  url: string;
  apiKey?: string;
  senderId?: string;
}

export interface GatewayRequest {
  to: string;
  message: string;
  senderId?: string;
}

interface GatewayResponse {
  messageId?: string;
}

/**
 * Generic JSON-over-HTTPS adapter: POST { to, message, senderId } with a bearer key.
 * Vendor-specific shapes (Bangla operators differ) get their own adapter beside this one.
 * Built by the module factory, one instance per configured gateway, so it is not a provider.
 */
export class HttpSmsGateway implements SmsGatewayPort {
  private readonly logger = new Logger(HttpSmsGateway.name);
  private readonly headers: RawAxiosRequestHeaders;

  constructor(
    private readonly http: HttpService,
    private readonly options: HttpSmsGatewayOptions,
  ) {
    this.headers = options.apiKey
      ? { Authorization: `Bearer ${options.apiKey}` }
      : {};
  }

  async send(phone: string, message: string): Promise<SmsDelivery> {
    const body: GatewayRequest = {
      to: phone,
      message,
      senderId: this.options.senderId,
    };
    try {
      const { data } = await firstValueFrom(
        this.http.post<GatewayResponse>(this.options.url, body, {
          headers: this.headers,
        }),
      );
      return { providerMessageId: data?.messageId, gateway: this.options.name };
    } catch (error) {
      // Log the gateway's view (status + body) but never the message text: it may hold an OTP.
      const axiosError = error as AxiosError;
      this.logger.error(
        `SMS gateway ${this.options.name} failed for ${phone}: ${axiosError.response?.status ?? axiosError.code ?? 'unknown'}`,
        axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : undefined,
      );
      throw new ServiceUnavailableException('SMS delivery failed');
    }
  }
}
