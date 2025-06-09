import type { Method, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

type ConfigType = {};
type ResponseDataType = {
  code: number;
  message: string;
  data: any;
};

/**
 * 請求開始
 */
function startInterceptors(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (config.headers) {
  }

  return config;
}

/**
 * 請求成功,檢查請求頭
 */
function responseSuccess(response: AxiosResponse<ResponseDataType>) {
  return response;
}
/**
 * 響應數據檢查
 */
function checkRes(data: ResponseDataType) {
  if (data === undefined) {
    console.log('error->', data, 'data is empty');
    return Promise.reject('服務器異常');
  } else if (data.code < 200 || data.code >= 400) {
    return Promise.reject(data);
  }
  return data.data;
}

/**
 * 響應錯誤
 */
function responseError(err: any) {
  console.log('error->', '請求錯誤', err);
  const data = err?.response?.data || err;

  if (!err) {
    return Promise.reject({ message: '未知錯誤' });
  }
  if (typeof err === 'string') {
    return Promise.reject({ message: err });
  }
  if (typeof data === 'string') {
    return Promise.reject(data);
  }
}

/* 創建請求實例 */
const instance = axios.create({
  baseURL: `${process.env.FASTGPT_ENDPOINT}/api`,
  timeout: 600000, // 超時時間
  headers: {
    'content-type': 'application/json'
  }
});

/* 請求攔截 */
instance.interceptors.request.use(startInterceptors, (err) => Promise.reject(err));
/* 響應攔截 */
instance.interceptors.response.use(responseSuccess, (err) => Promise.reject(err));

function request(url: string, data: any, config: ConfigType, method: Method): any {
  /* 去空 */
  for (const key in data) {
    if (data[key] === undefined) {
      delete data[key];
    }
  }

  return instance
    .request({
      url,
      method,
      data: ['POST', 'PUT'].includes(method) ? data : undefined,
      params: !['POST', 'PUT'].includes(method) ? data : undefined
    })
    .then((res) => checkRes(res.data))
    .catch((err) => responseError(err));
}

/**
 * api請求方式
 * @param {String} url
 * @param {Any} params
 * @param {Object} config
 * @returns
 */
export function GET<T = undefined>(url: string, params = {}, config: ConfigType = {}): Promise<T> {
  return request(url, params, config, 'GET');
}

export function POST<T = undefined>(url: string, data = {}, config: ConfigType = {}): Promise<T> {
  return request(url, data, config, 'POST');
}

export function PUT<T = undefined>(url: string, data = {}, config: ConfigType = {}): Promise<T> {
  return request(url, data, config, 'PUT');
}

export function DELETE<T = undefined>(url: string, data = {}, config: ConfigType = {}): Promise<T> {
  return request(url, data, config, 'DELETE');
}
