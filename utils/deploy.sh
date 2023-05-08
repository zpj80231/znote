##############################################################################
## 现已通过 GitHub Actions 自动部署，只需 'git push' 即可自动部署
## 若不想使用自动部署，可以直接运行命令 'npm run deploy' 本地自动提交部署
##############################################################################

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist/

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'
# --> 这里修改为自己的仓库
git remote add origin git@github.com:zpj80231/znote.git
git checkout -b gh-pages

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:zpj80231/zpj80231.github.io.git gh-pages
# git push origin :gh-pages
git push -u origin gh-pages -f

cd ..
# git init
# git remote add origin git@github.com:zpj80231/znote.git
git add .
git commit -m 'update docs' 
git push origin master


# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -