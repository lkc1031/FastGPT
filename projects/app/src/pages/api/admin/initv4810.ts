import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoAppVersion } from '@fastgpt/service/core/app/version/schema';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';
import { POST } from '@fastgpt/service/common/api/plusRequest';

/* 初始化發佈的版本 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authCert({ req, authRoot: true });

    await MongoAppVersion.updateMany(
      {},
      {
        $set: {
          isPublish: true
        }
      }
    );

    if (FastGPTProUrl) {
      await POST('/admin/init/4810');
    }

    jsonRes(res, {
      message: 'success'
    });
  } catch (error) {
    console.log(error);

    jsonRes(res, {
      code: 500,
      error
    });
  }
}
