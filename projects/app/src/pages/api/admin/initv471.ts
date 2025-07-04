import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { PgClient } from '@fastgpt/service/common/vectorDB/pg/controller';

/* pg 中的數據搬到 mongo dataset.datas 中，並做映射 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authCert({ req, authRoot: true });

    // 刪除索引
    await PgClient.query(`DROP INDEX IF EXISTS team_dataset_index;`);
    await PgClient.query(`DROP INDEX IF EXISTS team_collection_index;`);
    await PgClient.query(`DROP INDEX IF EXISTS team_id_index;`);

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
