import axios, { type Method, type AxiosResponse } from 'axios';
import { getWebReqUrl } from '@fastgpt/web/common/system/utils';
import {
  type ChannelInfoType,
  type ChannelListResponseType,
  type ChannelLogListItemType,
  type CreateChannelProps
} from '@/global/aiproxy/type';
import type { ChannelStatusEnum } from '@/global/aiproxy/constants';

interface ResponseDataType {
  success: boolean;
  message: string;
  data: any;
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
  } else if (!data.success) {
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

  return Promise.reject(data);
}

/* 創建請求實例 */
const instance = axios.create({
  timeout: 60000, // 超時時間
  headers: {
    'content-type': 'application/json'
  }
});

/* 響應攔截 */
instance.interceptors.response.use(responseSuccess, (err) => Promise.reject(err));

function request(url: string, data: any, method: Method): any {
  /* 去空 */
  for (const key in data) {
    if (data[key] === undefined) {
      delete data[key];
    }
  }

  return instance
    .request({
      baseURL: getWebReqUrl('/api/aiproxy/api'),
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
export function GET<T = undefined>(url: string, params = {}): Promise<T> {
  return request(url, params, 'GET');
}
export function POST<T = undefined>(url: string, data = {}): Promise<T> {
  return request(url, data, 'POST');
}
export function PUT<T = undefined>(url: string, data = {}): Promise<T> {
  return request(url, data, 'PUT');
}
export function DELETE<T = undefined>(url: string, data = {}): Promise<T> {
  return request(url, data, 'DELETE');
}

// ====== API ======
export const getChannelList = () =>
  GET<ChannelListResponseType>('/channels/all', {
    page: 1,
    perPage: 10
  });

export const getChannelProviders = () =>
  GET<
    Record<
      number,
      {
        defaultBaseUrl: string;
        keyHelp: string;
        name: string;
      }
    >
  >('/channels/type_metas');

export const postCreateChannel = (data: CreateChannelProps) =>
  POST(`/createChannel`, {
    type: data.type,
    name: data.name,
    base_url: data.base_url,
    models: data.models,
    model_mapping: data.model_mapping,
    key: data.key,
    priority: 1
  });

export const putChannelStatus = (id: number, status: ChannelStatusEnum) =>
  POST(`/channel/${id}/status`, {
    status
  });
export const putChannel = (data: ChannelInfoType) =>
  PUT(`/channel/${data.id}`, {
    type: data.type,
    name: data.name,
    base_url: data.base_url,
    models: data.models,
    model_mapping: data.model_mapping,
    key: data.key,
    status: data.status,
    priority: data.priority ? Math.max(data.priority, 1) : undefined
  });

export const deleteChannel = (id: number) => DELETE(`/channel/${id}`);

export const getChannelLog = (params: {
  request_id?: string;
  channel?: string;
  model_name?: string;
  code_type?: 'all' | 'success' | 'error';
  start_timestamp: number;
  end_timestamp: number;
  offset: number;
  pageSize: number;
}) =>
  GET<{
    logs: ChannelLogListItemType[];
    total: number;
  }>(`/logs/search`, {
    result_only: true,
    request_id: params.request_id,
    channel: params.channel,
    model_name: params.model_name,
    code_type: params.code_type,
    start_timestamp: params.start_timestamp,
    end_timestamp: params.end_timestamp,
    p: Math.floor(params.offset / params.pageSize) + 1,
    per_page: params.pageSize
  }).then((res) => {
    return {
      list: res.logs,
      total: res.total
    };
  });

export const getLogDetail = (id: number) =>
  GET<{
    request_body: string;
    response_body: string;
  }>(`/logs/detail/${id}`);
