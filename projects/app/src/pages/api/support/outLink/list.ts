import { MongoOutLink } from '@fastgpt/service/support/outLink/schema';
import { authApp } from '@fastgpt/service/support/permission/app/auth';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import type { ApiRequestProps } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { type OutLinkSchema } from '@fastgpt/global/support/outLink/type';
import type { PublishChannelEnum } from '@fastgpt/global/support/outLink/constant';

export const ApiMetadata = {
  name: '獲取應用內所有 Outlink',
  author: 'Finley',
  version: '0.1.0'
};

export type OutLinkListQuery = {
  appId: string; // 應用 ID
  type: `${PublishChannelEnum}`;
};

export type OutLinkListBody = {};

// 應用內全部 Outlink 列表
export type OutLinkListResponse = OutLinkSchema[];

// 查詢應用的所有 OutLink
export async function handler(
  req: ApiRequestProps<OutLinkListBody, OutLinkListQuery>
): Promise<OutLinkListResponse> {
  const { appId, type } = req.query;
  await authApp({
    req,
    authToken: true,
    appId,
    per: ManagePermissionVal
  });

  const data = await MongoOutLink.find({
    appId,
    type: type
  }).sort({
    _id: -1
  });

  return data;
}

export default NextAPI(handler);
