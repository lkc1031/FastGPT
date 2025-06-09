import { BucketNameEnum } from '@fastgpt/global/common/file/constants';
import { retryFn } from '@fastgpt/global/common/system/utils';
import {
  delFileByFileIdList,
  getGFSCollection
} from '@fastgpt/service/common/file/gridfs/controller';
import { addLog } from '@fastgpt/service/common/system/log';
import {
  deleteDatasetDataVector,
  getVectorDataByTime
} from '@fastgpt/service/common/vectorDB/controller';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
import { MongoDatasetDataText } from '@fastgpt/service/core/dataset/data/dataTextSchema';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import { MongoDatasetTraining } from '@fastgpt/service/core/dataset/training/schema';
import { addDays } from 'date-fns';

/* 
  check dataset.files data. If there is no match in dataset.collections, delete it
  可能異常情況:
  1. 上傳了文件，未成功創建集合
*/
export async function checkInvalidDatasetFiles(start: Date, end: Date) {
  let deleteFileAmount = 0;
  const collection = getGFSCollection(BucketNameEnum.dataset);
  const where = {
    uploadDate: { $gte: start, $lte: end }
  };

  // 1. get all file _id
  const files = await collection
    .find(where, {
      projection: {
        metadata: 1,
        _id: 1
      }
    })
    .toArray();
  addLog.info(`Clear invalid dataset files, total files: ${files.length}`);

  let index = 0;
  for await (const file of files) {
    try {
      // 2. find fileId in dataset.collections
      const hasCollection = await MongoDatasetCollection.countDocuments({
        teamId: file.metadata.teamId,
        fileId: file._id
      });

      // 3. if not found, delete file
      if (hasCollection === 0) {
        await delFileByFileIdList({
          bucketName: BucketNameEnum.dataset,
          fileIdList: [String(file._id)]
        });
        console.log('delete file', file._id);
        deleteFileAmount++;
      }
      index++;
      index % 100 === 0 && console.log(index);
    } catch (error) {
      console.log(error);
    }
  }
  addLog.info(`Clear invalid dataset files finish, remove ${deleteFileAmount} files`);
}

/* 
  Remove 7 days ago chat files
*/
export const removeExpiredChatFiles = async () => {
  let deleteFileAmount = 0;
  const collection = getGFSCollection(BucketNameEnum.chat);

  const expireTime = Number(process.env.CHAT_FILE_EXPIRE_TIME || 7);
  const where = {
    uploadDate: { $lte: addDays(new Date(), -expireTime) }
  };

  // get all file _id
  const files = await collection.find(where, { projection: { _id: 1 } }).toArray();

  // Delete file one by one
  for await (const file of files) {
    try {
      await delFileByFileIdList({
        bucketName: BucketNameEnum.chat,
        fileIdList: [String(file._id)]
      });
      deleteFileAmount++;
    } catch (error) {
      console.log(error);
    }
  }

  addLog.info(`Remove expired chat files finish, remove ${deleteFileAmount} files`);
};

/* 
  檢測無效的 Mongo 數據
  異常情況：
  1. 訓練過程刪除知識庫，可能導致還會有新的數據繼續插入，導致無效。
*/
export async function checkInvalidDatasetData(start: Date, end: Date) {
  // 1. 獲取時間範圍的所有data
  const rows = await MongoDatasetData.find(
    {
      updateTime: {
        $gte: start,
        $lte: end
      }
    },
    '_id teamId datasetId collectionId'
  ).lean();

  // 2. 合併所有的collectionId
  const map = new Map<string, { teamId: string; datasetId: string; collectionId: string }>();
  for (const item of rows) {
    const collectionId = String(item.collectionId);
    if (!map.has(collectionId)) {
      map.set(collectionId, {
        teamId: item.teamId,
        datasetId: item.datasetId,
        collectionId
      });
    }
  }
  const list = Array.from(map.values());
  addLog.info(`Clear invalid dataset data, total collections: ${list.length}`);
  let index = 0;

  for await (const item of list) {
    try {
      // 3. 查看該collection是否存在，不存在，則刪除對應的數據
      const collection = await MongoDatasetCollection.findOne(
        { _id: item.collectionId },
        '_id'
      ).lean();
      if (!collection) {
        console.log('collection is not found', item);

        await retryFn(async () => {
          await MongoDatasetTraining.deleteMany({
            teamId: item.teamId,
            datasetId: item.datasetId,
            collectionId: item.collectionId
          });
          await MongoDatasetDataText.deleteMany({
            teamId: item.teamId,
            datasetId: item.datasetId,
            collectionId: item.collectionId
          });
          await deleteDatasetDataVector({
            teamId: item.teamId,
            datasetIds: [item.datasetId],
            collectionIds: [item.collectionId]
          });
          await MongoDatasetData.deleteMany({
            teamId: item.teamId,
            datasetId: item.datasetId,
            collectionId: item.collectionId
          });
        });
      }
    } catch (error) {}
    if (++index % 100 === 0) {
      console.log(index);
    }
  }
}

export async function checkInvalidVector(start: Date, end: Date) {
  let deletedVectorAmount = 0;
  // 1. get all vector data
  const rows = await getVectorDataByTime(start, end);
  addLog.info(`Clear invalid vector, total vector data: ${rows.length}`);

  let index = 0;

  for await (const item of rows) {
    if (!item.teamId || !item.datasetId || !item.id) {
      addLog.error('error data', item);
      continue;
    }
    try {
      // 2. find dataset.data
      const hasData = await MongoDatasetData.countDocuments({
        teamId: item.teamId,
        datasetId: item.datasetId,
        'indexes.dataId': item.id
      });

      // 3. if not found, delete vector
      if (hasData === 0) {
        await deleteDatasetDataVector({
          teamId: item.teamId,
          id: item.id
        });
        console.log('delete vector data', item.id);
        deletedVectorAmount++;
      }

      index++;
      index % 100 === 0 && console.log(index);
    } catch (error) {
      console.log(error);
    }
  }

  addLog.info(`Clear invalid vector finish, remove ${deletedVectorAmount} data`);
}
