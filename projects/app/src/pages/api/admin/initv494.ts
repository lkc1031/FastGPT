import { NextAPI } from '@/service/middleware/entry';
import { retryFn } from '@fastgpt/global/common/system/utils';
import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { upsertWebsiteSyncJobScheduler } from '@fastgpt/service/core/dataset/websiteSync';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { addHours } from 'date-fns';
import { type NextApiRequest, type NextApiResponse } from 'next';

const initWebsiteSyncData = async () => {
  // find out all website dataset
  const datasets = await MongoDataset.find({ type: DatasetTypeEnum.websiteDataset }).lean();

  console.log('更新站點同步的定時器');
  // Add scheduler for all website dataset
  await Promise.all(
    datasets.map((dataset) => {
      if (dataset.autoSync) {
        // 隨機生成一個往後 1～24 小時的時間
        const time = addHours(new Date(), Math.floor(Math.random() * 23) + 1);
        return retryFn(() =>
          upsertWebsiteSyncJobScheduler({ datasetId: String(dataset._id) }, time.getTime())
        );
      }
    })
  );

  console.log('移除站點同步集合的定時器');
  // Remove all nextSyncTime
  await retryFn(() =>
    MongoDatasetCollection.updateMany(
      {
        teamId: datasets.map((dataset) => dataset.teamId),
        datasetId: datasets.map((dataset) => dataset._id)
      },
      {
        $unset: {
          nextSyncTime: 1
        }
      }
    )
  );
};
async function handler(req: NextApiRequest, _res: NextApiResponse) {
  await authCert({ req, authRoot: true });

  await initWebsiteSyncData();

  return { success: true };
}

export default NextAPI(handler);
