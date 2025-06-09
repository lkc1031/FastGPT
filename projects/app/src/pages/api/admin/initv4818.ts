import { NextAPI } from '@/service/middleware/entry';
import { delay } from '@fastgpt/global/common/system/utils';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { jiebaSplit } from '@fastgpt/service/common/string/jieba/index';
import { MongoDatasetDataText } from '@fastgpt/service/core/dataset/data/dataTextSchema';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { type NextApiRequest, type NextApiResponse } from 'next';

/* 
  簡單版遷移：直接升級到最新鏡像，會去除 MongoDatasetData 裏的索引。直接執行這個腳本。
  無縫遷移：
    1. 先用 4.8.18-tmp 版本，會同時有 MongoDatasetData 和 MongoDatasetDataText 兩個表和索引，依然是 MongoDatasetData 生效。會同步更新兩張表數據。
    2. 執行升級腳本，不要刪除 MongoDatasetData 裏的數據。
    3. 切換正式版鏡像，讓 MongoDatasetDataText 生效。
    4. 刪除 MongoDatasetData 裏的索引和多餘字段。（4819 再刪
    5. 移動 User 表中的 avatar 字段到 TeamMember 表中。
*/
let success = 0;
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authCert({ req, authRoot: true });

  const batchSize = req.body.batchSize || 500;
  success = 0;

  const start = Date.now();
  await initData(batchSize);
  // await restore();
  console.log('Init data time:', Date.now() - start);

  success = 0;

  // batchUpdateFields();

  return { success: true };
}

export default NextAPI(handler);

const restore = async () => {
  try {
    const data = await MongoDatasetData.findOne({ fullTextToken: { $exists: false } });
    if (!data) return;

    data.fullTextToken = await jiebaSplit({ text: `${data.q}\n${data.a}`.trim() });
    await data.save();

    success++;
    console.log('Success:', success);

    await restore();
  } catch (error) {
    console.log(error);
    await delay(500);
    await restore();
  }
};

const initData = async (batchSize: number) => {
  while (true) {
    try {
      // 找到沒有初始化的數據
      const dataList = await MongoDatasetData.find(
        {
          initFullText: { $exists: false }
        },
        '_id teamId datasetId collectionId fullTextToken'
      )
        .limit(batchSize)
        .lean();

      if (dataList.length === 0) break;

      try {
        await MongoDatasetDataText.insertMany(
          dataList.map((item) => ({
            teamId: item.teamId,
            datasetId: item.datasetId,
            collectionId: item.collectionId,
            dataId: item._id,
            fullTextToken: item.fullTextToken
          })),
          { ordered: false, lean: true }
        );
      } catch (error: any) {
        if (error.code === 11000) {
          console.log('Duplicate key error');
        } else {
          throw error;
        }
      }

      // 把成功插入的新數據的 dataId 更新爲已初始化
      await MongoDatasetData.updateMany(
        { _id: { $in: dataList.map((item) => item._id) } },
        // FullText tmp
        // { $set: { initFullText: true } }
        { $set: { initFullText: true }, $unset: { fullTextToken: 1 } }
      );

      success += dataList.length;
      console.log('Success:', success);

      // await initData(batchSize);
    } catch (error: any) {
      console.log(error, '===');
      await delay(500);
      // await initData(batchSize);
    }
  }
};

// const batchUpdateFields = async (batchSize = 2000) => {
//   // Find documents that still have these fields
//   const documents = await MongoDatasetData.find({ initFullText: { $exists: true } }, '_id')
//     .limit(batchSize)
//     .lean();

//   if (documents.length === 0) return;

//   // Update in batches
//   await MongoDatasetData.updateMany(
//     { _id: { $in: documents.map((doc) => doc._id) } },
//     {
//       $unset: {
//         initFullText: 1
//         // fullTextToken: 1
//       }
//     }
//   );

//   success += documents.length;
//   console.log('Delete success:', success);
//   await batchUpdateFields(batchSize);
// };
