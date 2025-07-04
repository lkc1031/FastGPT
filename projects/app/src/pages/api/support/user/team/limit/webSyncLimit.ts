import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';

import { checkWebSyncLimit } from '@fastgpt/service/support/user/utils';
import { authCert } from '@fastgpt/service/support/permission/auth/common';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // 憑證校驗
    const { teamId } = await authCert({ req, authToken: true });

    await checkWebSyncLimit({
      teamId,
      limitMinutes: global.feConfigs?.limit?.websiteSyncLimitMinuted
    });

    jsonRes(res);
  } catch (err) {
    res.status(500);
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
