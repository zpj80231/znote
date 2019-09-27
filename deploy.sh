#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd publicgb

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'
git remote add origin git@github.com:zpj80231/znote.git
git checkout -b gh-pages

# 如果发布到 https://<USERNAME>.github.io
#git push -f git@github.com:zpj80231/zpj80231.github.io.git gh-pages
#git push origin :gh-pages
git push -u origin gh-pages -f

cd ..
#git init
#git remote add origin git@github.com:zpj80231/znote.git
git add .
git commit -m '添加阿里规范'
git push origin master


# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -