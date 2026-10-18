export interface SmsGatewayConfig {
  url: string;
  apiKey?: string;
}

export interface SmsConfig {
  primary?: SmsGatewayConfig;
  secondary?: SmsGatewayConfig;
  senderId?: string;
  deliveryReportSecret?: string;
  segmentCostPaisa: number;
}
