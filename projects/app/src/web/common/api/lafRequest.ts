import axios, {
  type Method,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosProgressEvent
} from 'axios';
import { useUserStore } from '@/web/support/user/useUserStore';
import { putUpdateTeam } from '@/web/support/user/team/api';
import { type LafAccountType } from '@fastgpt/global/support/user/team/type';

interface ConfigType {
  headers?: { [key: string]: string };
  timeout?: number;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  cancelToken?: AbortController;
  maxQuantity?: number;
}
interface ResponseDataType {
  error: string | null;
  data: any;
}

const maxQuantityMap: Record<
  string,
  {
    amount: number;
    sign: AbortController;
  }
> = {};

function requestStart({ url, maxQuantity }: { url: string; maxQuantity?: number }) {
  if (!maxQuantity) return;
  const item = maxQuantityMap[url];

  if (item) {
    if (item.amount >= maxQuantity && item.sign) {
      item.sign.abort();
      delete maxQuantityMap[url];
    }
  } else {
    maxQuantityMap[url] = {
      amount: 1,
      sign: new AbortController()
    };
  }
}
function requestFinish({ url }: { url: string }) {
  const item = maxQuantityMap[url];
  if (item) {
    item.amount--;
    if (item.amount <= 0) {
      delete maxQuantityMap[url];
    }
  }
}

/**
 * 請求開始
 */
function startInterceptors(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${useUserStore.getState().userInfo?.team?.lafAccount?.token || ''}`;
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
function checkRes(
  res: ResponseDataType,
  url: string,
  data: any,
  requestConfig: ConfigType,
  method: Method
) {
  if (res === undefined) {
    console.log('error->', res, 'res is empty');
    return Promise.reject('服務器異常');
  } else if (res.error) {
    return responseError(data.error, url, data, requestConfig, method);
  }

  return res.data;
}

/**
 * 響應錯誤
 */
function responseError(
  err: any,
  url: string,
  data: any,
  requestConfig: ConfigType,
  method: Method
) {
  console.log('error->', '請求錯誤', err);

  if (!err) {
    return Promise.reject({ message: '未知錯誤' });
  }
  if (typeof err === 'string') {
    return Promise.reject({ message: err });
  }

  if (err?.response?.data) {
    const code = err?.response?.data?.statusCode;
    if (code === 401) {
      return POST<string>(`/v1/auth/pat2token`, {
        pat: useUserStore.getState().userInfo?.team?.lafAccount?.pat
      })
        .then((res) => {
          putUpdateTeam({
            lafAccount: {
              ...useUserStore.getState().userInfo?.team?.lafAccount,
              token: res
            } as LafAccountType
          });
          return request(url, data, requestConfig, method);
        })
        .catch((err) => {
          return Promise.reject({ message: '登錄憑證過期' });
        });
    }
    return Promise.reject(err?.response?.data);
  }
  return Promise.reject(err);
}

/* 創建請求實例 */
const instance = axios.create({
  timeout: 60000, // 超時時間
  headers: {
    'content-type': 'application/json'
  }
});

/* 請求攔截 */
instance.interceptors.request.use(startInterceptors, (err) => Promise.reject(err));
/* 響應攔截 */
instance.interceptors.response.use(responseSuccess, (err) => Promise.reject(err));

function request(url: string, data: any, requestConfig: ConfigType, method: Method): any {
  const { cancelToken, maxQuantity, ...config } = requestConfig;

  /* 去空 */
  for (const key in data) {
    if (data[key] === null || data[key] === undefined) {
      delete data[key];
    }
  }

  requestStart({ url, maxQuantity });

  return instance
    .request({
      baseURL: '/api/lafApi',
      url,
      method,
      data: ['POST', 'PUT'].includes(method) ? data : null,
      params: !['POST', 'PUT'].includes(method) ? data : null,
      signal: cancelToken?.signal,
      ...config // 用戶自定義配置，可以覆蓋前面的配置
    })
    .then((res) => checkRes(res.data, url, data, requestConfig, method))
    .catch((err) => responseError(err, url, data, requestConfig, method))
    .finally(() => requestFinish({ url }));
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
