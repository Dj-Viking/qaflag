import axios, { AxiosRequestConfig } from 'axios';
import { HttpResponse } from '../models/http-response';
import { HttpBody } from '../types/http.types';
import { RequestInterface } from '../types/request.interface';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { AxiosMock } from './axios-mock';

export const Mock = new AxiosMock(axios);

export type AxiosRequest = AxiosRequestConfig<HttpBody> & {
  jar?: CookieJar;
};

export const fetchWithAxios = async (
  req: RequestInterface,
): Promise<HttpResponse<HttpBody, AxiosRequest>> => {
  // https://axios-http.com/docs/req_config
  const axiosRequest: AxiosRequest = {
    method: req.method,
    url: req.url.href,
    baseURL: req.baseUrl,
    //transformRequest: [(data, headers) => data],
    //transformResponse: [data => data],
    headers: req.headers,
    params: req.queryString,
    data: req.data,
    timeout: req.timeout,
    withCredentials: true,
    auth: req.auth,
    responseType: req.responseType,
    responseEncoding: req.responseEncoding,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: 500000,
    maxBodyLength: 500000,
    validateStatus: status => {
      //return status >= 200 && status < 300; // default
      return true;
    },
    maxRedirects: req.maxRedirects,
    socketPath: null,
    //httpAgent: new http.Agent({ keepAlive: true }),
    //httpsAgent: new https.Agent({ keepAlive: true }),
    proxy: req.proxy,
    decompress: true,
  };
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));
  const start = Date.now();
  const response = await client.request(axiosRequest);
  return new HttpResponse(response, start);
};
