import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';

import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { checkDatasetLimit } from '@fastgpt/service/support/permission/teamLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { size } = req.query as {
      size: string;
    };

    // 憑證校驗
    const { teamId } = await authCert({ req, authToken: true });

    if (!size) {
      return jsonRes(res);
    }

    const numberSize = Number(size);

    await checkDatasetLimit({
      teamId,
      insertLen: numberSize
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
