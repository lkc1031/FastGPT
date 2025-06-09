#!/bin/bash
docker-compose pull
docker-compose up -d

echo "Docker Compose 重新拉取鏡像完成！"

# 刪除本地舊鏡像
images=$(docker images --format "{{.ID}} {{.Repository}}" | grep fastgpt)

# 將鏡像 ID 和名稱放入數組中
IFS=$'\n' read -rd '' -a image_array <<<"$images"

# 遍歷數組並刪除所有舊的鏡像
for ((i=1; i<${#image_array[@]}; i++))
do
    image=${image_array[$i]}
    image_id=${image%% *}
    docker rmi $image_id
done
