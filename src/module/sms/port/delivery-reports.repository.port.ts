import type { DeliveryStatus } from '../domain/sms';

export abstract class DeliveryReportsRepositoryPort {
  /**
   * Provider callbacks carry no tenant, so this matches on the provider id alone
   * (system role). False when nothing matched.
   */
  abstract applyReport(
    providerMessageId: string,
    status: DeliveryStatus,
    error?: string,
  ): Promise<boolean>;
}
