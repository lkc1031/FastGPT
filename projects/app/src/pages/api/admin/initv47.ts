import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoPlugin } from '@fastgpt/service/core/plugin/schema';
import { PluginTypeEnum } from '@fastgpt/global/core/plugin/constants';

/* pg 中的數據搬到 mongo dataset.datas 中，並做映射 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authCert({ req, authRoot: true });

    await MongoPlugin.updateMany(
      { type: { $exists: false } },
      {
        $set: {
          type: PluginTypeEnum.custom
        }
      }
    );
    await MongoPlugin.updateMany(
      { parentId: { $exists: false } },
      {
        $set: {
          parentId: null
        }
      }
    );

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
