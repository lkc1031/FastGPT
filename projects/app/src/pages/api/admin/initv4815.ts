import type { NextApiRequest, NextApiResponse } from 'next';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { NextAPI } from '@/service/middleware/entry';
import { MongoApp } from '@fastgpt/service/core/app/schema';

/* 初始化發佈的版本 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authCert({ req, authRoot: true });

  // scheduledTriggerConfig爲 null 的，都轉成 unExist
  return MongoApp.updateMany(
    {
      $or: [
        { scheduledTriggerConfig: { $eq: null } },
        { 'scheduledTriggerConfig.cronString': { $eq: '' } }
      ]
    },
    {
      $unset: {
        scheduledTriggerConfig: '',
        scheduledTriggerNextTime: ''
      }
    }
  );
}

export default NextAPI(handler);
