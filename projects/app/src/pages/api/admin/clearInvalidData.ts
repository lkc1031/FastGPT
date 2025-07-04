import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { addHours } from 'date-fns';
import { MongoImage } from '@fastgpt/service/common/file/image/schema';
import { MongoDatasetCollection } from '@fastgpt/service/core/dataset/collection/schema';
import {
  checkInvalidDatasetFiles,
  checkInvalidDatasetData,
  checkInvalidVector
} from '@/service/common/system/cronTask';

let deleteImageAmount = 0;
async function checkInvalidImg(start: Date, end: Date, limit = 50) {
  const images = await MongoImage.find(
    {
      createTime: {
        $gte: start,
        $lte: end
      },
      'metadata.relatedId': { $exists: true }
    },
    '_id teamId metadata'
  );
  console.log('total images', images.length);
  let index = 0;

  for await (const image of images) {
    try {
      // 1. 檢測是否有對應的集合
      const collection = await MongoDatasetCollection.findOne(
        {
          teamId: image.teamId,
          'metadata.relatedImgId': image.metadata?.relatedId
        },
        '_id'
      ).lean();

      if (!collection) {
        await image.deleteOne();
        deleteImageAmount++;
      }

      index++;

      index % 100 === 0 && console.log(index);
    } catch (error) {
      console.log(error);
    }
  }

  console.log(`檢測完成，共刪除 ${deleteImageAmount} 個無效圖片`);
}

/* pg 中的數據搬到 mongo dataset.datas 中，並做映射 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await authCert({ req, authRoot: true });
    const { start = -2, end = -360 * 24 } = req.body as { start: number; end: number };

    (async () => {
      try {
        console.log('執行髒數據清理任務');
        // 360天 ~ 2小時前
        const endTime = addHours(new Date(), start);
        const startTime = addHours(new Date(), end);
        await checkInvalidDatasetFiles(startTime, endTime);
        await checkInvalidImg(startTime, endTime);
        await checkInvalidDatasetData(startTime, endTime);
        await checkInvalidVector(startTime, endTime);
        console.log('執行髒數據清理任務完畢');
      } catch (error) {
        console.log('執行髒數據清理任務出錯了');
      }
    })();

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
