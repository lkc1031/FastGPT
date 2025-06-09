import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serviceSideProps } from '@/web/common/i18n/utils';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { Box } from '@chakra-ui/react';
import { TrackEventName } from '@/web/common/system/constants';
import { useToast } from '@fastgpt/web/hooks/useToast';

function Error() {
  const router = useRouter();
  const { toast } = useToast();
  const { lastRoute, llmModelList, embeddingModelList } = useSystemStore();

  useEffect(() => {
    setTimeout(() => {
      window.umami?.track(TrackEventName.pageError, {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        appName: navigator.appName,
        lastRoute,
        route: router.asPath
      });
    }, 1000);

    let modelError = false;
    if (llmModelList.length === 0) {
      modelError = true;
      toast({
        title: '未配置語言模型',
        status: 'error'
      });
    } else if (!llmModelList.some((item) => item.datasetProcess)) {
      modelError = true;
      toast({
        title: '未配置知識庫文件處理模型',
        status: 'error'
      });
    }
    if (embeddingModelList.length === 0) {
      modelError = true;
      toast({
        title: '未配置索引模型',
        status: 'error'
      });
    }

    setTimeout(() => {
      if (modelError) {
        router.push('/account/model');
      } else {
        router.push('/dashboard/apps');
      }
    }, 2000);
  }, []);

  return (
    <Box whiteSpace={'pre-wrap'}>
      {`出現未捕獲的異常。
1. 私有部署用戶，90%是由於模型配置不正確/模型未啓用導致。。
2. 部分系統不兼容相關API。大部分是蘋果的safari 瀏覽器導致，可以嘗試更換 chrome。
3. 請關閉瀏覽器翻譯功能，部分翻譯導致頁面崩潰。

排除3後，打開控制檯的 console 查看具體報錯信息。
如果提示 xxx undefined 的話，就是模型配置不正確，檢查：
1. 請確保系統內每個系列模型至少有一個可用，可以在【賬號-模型提供商】中檢查。
2. 請確保至少有一個知識庫文件處理模型（語言模型中有一個開關），否則知識庫創建會報錯。
2. 檢查模型中一些“對象”參數是否異常（數組和對象），如果爲空，可以嘗試給個空數組或空對象。
`}
    </Box>
  );
}

export async function getServerSideProps(context: any) {
  return {
    props: { ...(await serviceSideProps(context)) }
  };
}

export default Error;
