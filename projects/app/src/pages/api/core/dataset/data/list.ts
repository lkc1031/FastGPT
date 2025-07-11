import { authDatasetCollection } from '@fastgpt/service/support/permission/dataset/auth';
import { MongoDatasetData } from '@fastgpt/service/core/dataset/data/schema';
import { replaceRegChars } from '@fastgpt/global/common/string/tools';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { type ApiRequestProps } from '@fastgpt/service/type/next';
import { type DatasetDataListItemType } from '@/global/core/dataset/type';
import { parsePaginationRequest } from '@fastgpt/service/common/api/pagination';
import { type PaginationResponse } from '@fastgpt/web/common/fetch/type';

export type GetDatasetDataListProps = {
  searchText?: string;
  collectionId: string;
};

async function handler(
  req: ApiRequestProps<GetDatasetDataListProps>
): Promise<PaginationResponse<DatasetDataListItemType>> {
  let { searchText = '', collectionId } = req.body;
  let { offset, pageSize } = parsePaginationRequest(req);

  pageSize = Math.min(pageSize, 30);

  // 憑證校驗
  const { teamId, collection } = await authDatasetCollection({
    req,
    authToken: true,
    authApiKey: true,
    collectionId,
    per: ReadPermissionVal
  });

  const queryReg = new RegExp(`${replaceRegChars(searchText)}`, 'i');
  const match = {
    teamId,
    datasetId: collection.datasetId,
    collectionId,
    ...(searchText.trim()
      ? {
          $or: [{ q: queryReg }, { a: queryReg }]
        }
      : {})
  };

  const [list, total] = await Promise.all([
    MongoDatasetData.find(match, '_id datasetId collectionId q a chunkIndex')
      .sort({ chunkIndex: 1, updateTime: -1 })
      .skip(offset)
      .limit(pageSize)
      .lean(),
    MongoDatasetData.countDocuments(match)
  ]);

  return {
    list,
    total
  };
}

export default NextAPI(handler);
