#!/bin/bash
#自动下载壁纸，保存文件夹中

# 获取当前完整日期，格式为YYYYMMDD
full_date=$(date +"%Y%m%d")
current_date=$(date +"%Y%m")

# 设置Bing每日壁纸的API链接
url="https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"

# 获取API返回的JSON数据
response=$(curl -s -H "Accept: application/json" --insecure "$url")

# 从JSON数据中提取图片基本链接
imgurl_base=$(echo "$response" | grep -oP '(?<="urlbase":")[^"]*')

# 拼接完整的图片链接
imgurl="https://cn.bing.com${imgurl_base}_1920x1080.jpg"

# 指定图片保存路径并使用完整日期作为文件名
save_path="/www/wwwroot/www.xxx.com/img/${full_date}.jpg"

# 如果年月目录不存在，则创建
mkdir -p "/www/wwwroot/www.xxx.com/img"

# 如果图片链接不为空，则下载图片并保存到指定路径
if [ -n "$imgurl_base" ]; then
    # 下载图片并保存到指定路径
    curl -s -o "$save_path" "$imgurl"
    echo "已成功下载壁纸：${save_path}"
else
    # 如果获取图片链接失败，则输出错误信息并退出脚本
    echo "获取Bing壁纸链接失败，请检查网络连接或API是否可用"
    exit 1
fi
