import type { ApiRequestProps, ApiResponseType } from '@fastgpt/service/type/next';
import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { authAppByTmbId } from '@fastgpt/service/support/permission/app/auth';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { MongoMcpKey } from '@fastgpt/service/support/mcp/schema';
import { type McpAppType } from '@fastgpt/global/support/mcp/type';

export type createQuery = {};

export type createBody = {
  name: string;
  apps: McpAppType[];
};

export type createResponse = {};

async function handler(
  req: ApiRequestProps<createBody, createQuery>,
  res: ApiResponseType<any>
): Promise<createResponse> {
  const { teamId, tmbId, permission } = await authUserPer({
    req,
    authToken: true,
    authApiKey: true
  });

  if (!permission.hasApikeyCreatePer) {
    return Promise.reject(TeamErrEnum.unPermission);
  }

  let { name, apps } = req.body;

  if (!apps.length) {
    return Promise.reject(CommonErrEnum.missingParams);
  }

  // Count mcp length
  const totalMcp = await MongoMcpKey.countDocuments({ teamId });
  if (totalMcp >= 100) {
    return Promise.reject('暫時只支持100個MCP服務');
  }

  // 對 apps 中的 id 進行去重，確保每個應用只出現一次
  const uniqueAppIds = new Set();
  apps = apps.filter((app) => {
    if (uniqueAppIds.has(app.appId)) {
      return false; // 過濾掉重複的 app id
    }
    uniqueAppIds.add(app.appId);
    return true;
  });

  // Check app read permission
  await Promise.all(
    apps.map((app) =>
      authAppByTmbId({
        tmbId,
        appId: app.appId,
        per: ReadPermissionVal
      })
    )
  );

  await MongoMcpKey.create({
    teamId,
    tmbId,
    name,
    apps
  });

  return {};
}

export default NextAPI(handler);
