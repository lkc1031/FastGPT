<div align="center">

<a href="https://tryfastgpt.ai/"><img src="/.github/imgs/logo.svg" width="120" height="120" alt="fastgpt logo"></a>

# FastGPT

<p align="center">
  <a href="./README_en.md">English</a> |
  <a href="./README.md">簡體中文</a> |
  <a href="./README_ja.md">日語</a>
</p>

FastGPT 是一個 AI Agent 構建平臺，提供開箱即用的數據處理、模型調用等能力，同時可以通過 Flow 可視化進行工作流編排，從而實現複雜的應用場景！

</div>

<p align="center">
  <a href="https://tryfastgpt.ai/">
    <img height="21" src="https://img.shields.io/badge/在線使用-d4eaf7?style=flat-square&logo=spoj&logoColor=7d09f1" alt="cloud">
  </a>
  <a href="https://doc.tryfastgpt.ai/docs/intro">
    <img height="21" src="https://img.shields.io/badge/相關文檔-7d09f1?style=flat-square" alt="document">
  </a>
  <a href="https://doc.tryfastgpt.ai/docs/development">
    <img height="21" src="https://img.shields.io/badge/本地開發-%23d4eaf7?style=flat-square&logo=xcode&logoColor=7d09f1" alt="development">
  </a>
  <a href="/#-%E7%9B%B8%E5%85%B3%E9%A1%B9%E7%9B%AE">
    <img height="21" src="https://img.shields.io/badge/相關項目-7d09f1?style=flat-square" alt="project">
  </a>
</p>

https://github.com/labring/FastGPT/assets/15308462/7d3a38df-eb0e-4388-9250-2409bd33f6d4

## 🛸 在線使用

- 🌍 國際版：[tryfastgpt.ai](https://tryfastgpt.ai/)

|                                    |                                    |
| ---------------------------------- | ---------------------------------- |
| ![Demo](./.github/imgs/intro1.png) | ![Demo](./.github/imgs/intro2.png) |
| ![Demo](./.github/imgs/intro3.png) | ![Demo](./.github/imgs/intro4.png) |

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 💡 RoadMap

`1` 應用編排能力
   - [x] 對話工作流、插件工作流
   - [x] 工具調用
   - [x] Code sandbox
   - [x] 循環調用
   - [x] 用戶選擇
   - [x] 表單輸入

`2` 知識庫能力
   - [x] 多庫複用，混用
   - [x] chunk 記錄修改和刪除
   - [x] 支持手動輸入，直接分段，QA 拆分導入
   - [x] 支持 txt，md，html，pdf，docx，pptx，csv，xlsx (有需要更多可 PR file loader)，支持 url 讀取、CSV 批量導入
   - [x] 混合檢索 & 重排
   - [x] API 知識庫
   - [ ] 自定義文件讀取服務
   - [ ] 自定義分塊服務
  
`3` 應用調試能力
   - [x] 知識庫單點搜索測試
   - [x] 對話時反饋引用並可修改與刪除
   - [x] 完整上下文呈現
   - [x] 完整模塊中間值呈現
   - [ ] 高級編排 DeBug 模式
  
`4` OpenAPI 接口
   - [x] completions 接口 (chat 模式對齊 GPT 接口)
   - [x] 知識庫 CRUD
   - [x] 對話 CRUD
  
`5` 運營能力
   - [x] 免登錄分享窗口
   - [x] Iframe 一鍵嵌入
   - [x] 聊天窗口嵌入支持自定義 Icon，默認打開，拖拽等功能
   - [x] 統一查閱對話記錄，並對數據進行標註
   
`6` 其他
   - [x] 可視化模型配置。
   - [x] 支持語音輸入和輸出 (可配置語音輸入語音回答)
   - [x] 模糊輸入提示
   - [x] 模板市場

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 👨‍💻 開發

項目技術棧：NextJs + TS + ChakraUI + MongoDB + PostgreSQL (PG Vector 插件)/Milvus

- **⚡ 快速部署**

  > 使用 [Sealos](https://sealos.io) 服務，無需採購服務器、無需域名，支持高併發 & 動態伸縮，並且數據庫應用採用 kubeblocks 的數據庫，在 IO 性能方面，遠超於簡單的 Docker 容器部署。

  [點擊查看 Sealos 一鍵部署 FastGPT 教程](https://doc.tryfastgpt.ai/docs/development/sealos/)

* [快速開始本地開發](https://doc.tryfastgpt.ai/docs/development/intro/)
* [部署 FastGPT](https://doc.tryfastgpt.ai/docs/development/sealos/)
* [系統配置文件說明](https://doc.tryfastgpt.ai/docs/development/configuration/)
* [多模型配置方案](https://doc.tryfastgpt.ai/docs/development/modelconfig/one-api/)
* [版本更新/升級介紹](https://doc.tryfastgpt.ai/docs/development/upgrading/)
* [OpenAPI API 文檔](https://doc.tryfastgpt.ai/docs/development/openapi/)
* [知識庫結構詳解](https://doc.tryfastgpt.ai/docs/guide/knowledge_base/rag/)

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 🏘️ 加入我們

我們正在尋找志同道合的小夥伴，加速 FastGPT 的發展。你可以通過 [FastGPT 2025 招聘](https://fael3z0zfze.feishu.cn/wiki/P7FOwEmPziVcaYkvVaacnVX1nvg)瞭解 FastGPT 的招聘信息。

## 💪 相關項目

- [Laf：3 分鐘快速接入三方應用](https://github.com/labring/laf)
- [Sealos：快速部署集羣應用](https://github.com/labring/sealos)
- [One API：多模型管理，支持 Azure、文心一言等](https://github.com/songquanpeng/one-api)

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 🌿 第三方生態
- [PPIO 派歐雲：一鍵調用高性價比的開源模型 API 和 GPU 容器](https://ppinfra.com/user/register?invited_by=VITYVU&utm_source=github_fastgpt)
- [AI Proxy：國內模型聚合服務](https://sealos.run/aiproxy/?k=fastgpt-github/)
- [SiliconCloud (硅基流動) —— 開源模型在線體驗平臺](https://cloud.siliconflow.cn/i/TR9Ym0c4)
- [COW 個人微信/企微機器人](https://doc.tryfastgpt.ai/docs/use-cases/external-integration/onwechat/)

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 🏘️ 社區交流羣

掃碼加入飛書話題羣：

![](https://oss.laf.run/otnvvf-imgs/fastgpt-feishu1.png)

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 👀 其他

- [保姆級 FastGPT 教程](https://www.bilibili.com/video/BV1n34y1A7Bo/?spm_id_from=333.999.0.0)
- [接入飛書](https://www.bilibili.com/video/BV1Su4y1r7R3/?spm_id_from=333.999.0.0)
- [接入企微](https://www.bilibili.com/video/BV1Tp4y1n72T/?spm_id_from=333.999.0.0)

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 🤝 參與貢獻

我們非常歡迎各種形式的貢獻。如果你對貢獻代碼感興趣，可以查看我們的 GitHub [Issues](https://github.com/labring/FastGPT/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)，大展身手，向我們展示你的奇思妙想。

<a href="https://github.com/labring/FastGPT/graphs/contributors" target="_blank">
  <table>
    <tr>
      <th colspan="2">
        <br><img src="https://contrib.rocks/image?repo=labring/FastGPT"><br><br>
      </th>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=102226726&repo_ids=605673387&image_size=2x3&color_scheme=dark">
          <img alt="Active participants of labring - past 28 days" src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=active&period=past_28_days&owner_id=102226726&repo_ids=605673387&image_size=2x3&color_scheme=light">
        </picture>****
      </td>
      <td rowspan="2">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=new&period=past_28_days&owner_id=102226726&repo_ids=605673387&image_size=4x7&color_scheme=dark">
          <img alt="New trends of labring" src="https://next.ossinsight.io/widgets/official/compose-org-participants-growth/thumbnail.png?activity=new&period=past_28_days&owner_id=102226726&repo_ids=605673387&image_size=4x7&color_scheme=light">
        </picture>
      </td>
    </tr>
    <tr>
      <td>
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=102226726&repo_ids=605673387&image_size=2x3&color_scheme=dark">
          <img alt="New participants of labring - past 28 days" src="https://next.ossinsight.io/widgets/official/compose-org-active-contributors/thumbnail.png?activity=new&period=past_28_days&owner_id=102226726&repo_ids=605673387&image_size=2x3&color_scheme=light">
        </picture>
      </td>
    </tr>
  </table>
</a>

## 🌟 Star History

<a href="https://github.com/labring/FastGPT/stargazers" target="_blank" style="display: block" align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=labring/FastGPT&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=labring/FastGPT&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=labring/FastGPT&type=Date" />
  </picture>
</a>

<a href="#readme">
    <img src="https://img.shields.io/badge/-返回頂部-7d09f1.svg" alt="#" align="right">
</a>

## 使用協議

本倉庫遵循 [FastGPT Open Source License](./LICENSE) 開源協議。

1. 允許作爲後臺服務直接商用，但不允許提供 SaaS 服務。
2. 未經商業授權，任何形式的商用服務均需保留相關版權信息。
3. 完整請查看 [FastGPT Open Source License](./LICENSE)
4. 聯繫方式：Dennis@sealos.io，[點擊查看商業版定價策略](https://doc.tryfastgpt.ai/docs/shopping_cart/intro/)
