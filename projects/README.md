# 目錄說明

該目錄爲 FastGPT 主項目。

- app fastgpt 核心應用。
- sandbox 沙盒項目，用於運行工作流裏的代碼執行 （需求python環境爲python:3.11，額外安裝的包請於requirements.txt填寫，在運行時會讀取安裝。

  - 注意個別安裝的包可能需要額外安裝庫（如pandas需要安裝libffi））。

  - 新加入python的包遇見超時或者權限攔截的問題(確定不是自己的語法問題)，請進入docker容器內部執行以下指令：

  ```shell
    docker exec -it 《替換成容器名》 /bin/bash
    chmod -x testSystemCall.sh
    bash ./testSystemCall.sh
  ```

  然後將新的數組替換或追加到src下sandbox的constants.py中的SYSTEM_CALLS數組即可
