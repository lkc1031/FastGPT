import { NextAPI } from '@/service/middleware/entry';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { type NextApiRequest, type NextApiResponse } from 'next';

/* 
  簡單版遷移：直接升級到最新鏡像，會去除 MongoDatasetData 裏的索引。直接執行這個腳本。
  無縫遷移：
    1. 移動 User 表中的 avatar 字段到 TeamMember 表中。
*/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authCert({ req, authRoot: true });
  await moveUserAvatar();
  return { success: true };
}

export default NextAPI(handler);

const moveUserAvatar = async () => {
  try {
    const users = await MongoUser.find({}, '_id avatar');
    console.log('Total users:', users.length);
    let success = 0;
    for await (const user of users) {
      // @ts-ignore
      if (!user.avatar) continue;
      try {
        await mongoSessionRun(async (session) => {
          await MongoTeamMember.updateMany(
            {
              userId: user._id
            },
            {
              $set: {
                avatar: (user as any).avatar // 刪除 avatar 字段, 因爲 Type 改了，所以這裏不能直接寫 user.avatar
              }
            },
            { session }
          );
          // @ts-ignore
          user.avatar = undefined;
          await user.save({ session });
        });
        success++;
        console.log('Move avatar success:', success);
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
};
