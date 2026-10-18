import { HttpService } from '@nestjs/axios';
import { ServiceUnavailableException } from '@nestjs/common';
import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { createMock } from '@test/utils/create-mock';
import { containing } from '@test/utils/matchers';
import { GatewayRequest, HttpSmsGateway } from './http-sms.gateway';

const options = {
  name: 'primary',
  url: 'https://sms.test/send',
  apiKey: 'k',
  senderId: 'EduSmart',
};

describe('HttpSmsGateway', () => {
  let gateway: HttpSmsGateway;
  let http: jest.Mocked<HttpService>;

  beforeEach(() => {
    http = createMock<HttpService>();
    gateway = new HttpSmsGateway(http, options);
  });

  it('posts to the configured URL with bearer key and reports its own name', async () => {
    http.post.mockReturnValue(
      of({ data: { messageId: 'm-1' } } as AxiosResponse),
    );

    const result = await gateway.send('01700000000', 'hello');

    expect(http.post).toHaveBeenCalledWith(
      'https://sms.test/send',
      { to: '01700000000', message: 'hello', senderId: 'EduSmart' },
      { headers: { Authorization: 'Bearer k' } },
    );
    expect(result).toEqual({ providerMessageId: 'm-1', gateway: 'primary' });
  });

  it('sends without an Authorization header when no key is configured', async () => {
    http.post.mockReturnValue(of({ data: {} } as AxiosResponse));
    await new HttpSmsGateway(http, { name: 'p', url: options.url }).send(
      '01700000000',
      'x',
    );
    expect(http.post).toHaveBeenCalledWith(
      options.url,
      containing<GatewayRequest>({ to: '01700000000' }),
      { headers: {} },
    );
  });

  it('maps a gateway failure to 503 without leaking the message', async () => {
    const error = new AxiosError('boom', 'ECONNREFUSED', {
      headers: new AxiosHeaders(),
    });
    http.post.mockReturnValue(throwError(() => error));

    await expect(
      gateway.send('01700000000', 'secret 123456'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
