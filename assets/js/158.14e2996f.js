(window.webpackJsonp=window.webpackJsonp||[]).push([[158],{627:function(s,a,t){"use strict";t.r(a);var e=t(2),n=Object(e.a)({},(function(){var s=this,a=s._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("Boxx"),s._v(" "),a("p",[s._v("工作中常用到的linux命令备份，方便查看。")]),s._v(" "),a("p"),a("div",{staticClass:"table-of-contents"},[a("ul",[a("li",[a("a",{attrs:{href:"#工具"}},[s._v("工具")])]),a("li",[a("a",{attrs:{href:"#文件内容查找"}},[s._v("文件内容查找")])]),a("li",[a("a",{attrs:{href:"#根据pid查程序目录"}},[s._v("根据pid查程序目录")])]),a("li",[a("a",{attrs:{href:"#tomcat"}},[s._v("Tomcat")])]),a("li",[a("a",{attrs:{href:"#权限"}},[s._v("权限")])]),a("li",[a("a",{attrs:{href:"#文件复制-移动-大小"}},[s._v("文件复制/移动/大小")])]),a("li",[a("a",{attrs:{href:"#上传下载"}},[s._v("上传下载")])]),a("li",[a("a",{attrs:{href:"#压缩解压"}},[s._v("压缩解压")])]),a("li",[a("a",{attrs:{href:"#建立软链接"}},[s._v("建立软链接")])]),a("li",[a("a",{attrs:{href:"#更改环境变量"}},[s._v("更改环境变量")])]),a("li",[a("a",{attrs:{href:"#端口-防火墙"}},[s._v("端口/防火墙")])]),a("li",[a("a",{attrs:{href:"#禁ip"}},[s._v("禁IP")])])])]),a("p"),s._v(" "),a("h2",{attrs:{id:"工具"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#工具"}},[s._v("#")]),s._v(" 工具")]),s._v(" "),a("p",[s._v("自我备份："),a("a",{attrs:{href:"https://note.youdao.com/web/#/file/WEB9a8de91346f2b4dbb81dd5308c02352d/default/WEB07643efa9317a66ad0f564022e4aa0cb/",target:"_blank",rel:"noopener noreferrer"}},[s._v("Xshell + Xftp（已破解）"),a("OutboundLink")],1)]),s._v(" "),a("h2",{attrs:{id:"文件内容查找"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#文件内容查找"}},[s._v("#")]),s._v(" 文件内容查找")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查找文件夹下或某个文件包含某字符的所有文件")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# -r 是递归查找")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# -n 是显示行号")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# -C 5 显示file文件里匹配字串那行以及上下5行")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# -B 5 显示前5行")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# -A 5 显示后5行")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# --include '*.html' 指定后缀名")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-rn")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v('"message"')]),s._v(" ./\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 实时显示日志记录")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("tail")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-100f")]),s._v(" a.log\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# tail和多个grep使用")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("tail")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-100f")]),s._v(" a.log "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" --line-buffer aa "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" bb\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查找包含 2020 的 catalina.out文件所在的行")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("find")]),s._v(" ./ "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-name")]),s._v(" catalina.out "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("xargs")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("2020")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# grep之后，按行统计行数 wc -l")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("find")]),s._v(" ./ "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-name")]),s._v(" catalina.out "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("xargs")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("2020")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("wc")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-l")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查看当前路径下各个目录大小(后面也可以跟指定目录)， -h 以K，M，G为单位，提高信息的可读性。")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("du")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-sh")]),s._v(" *\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查找当前目录下的大文件并倒叙排列")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("du")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-sh")]),s._v(" * "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sort")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-nr")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("head")]),s._v(" \n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br"),a("span",{staticClass:"line-number"},[s._v("19")]),a("br"),a("span",{staticClass:"line-number"},[s._v("20")]),a("br")])]),a("h2",{attrs:{id:"根据pid查程序目录"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#根据pid查程序目录"}},[s._v("#")]),s._v(" 根据pid查程序目录")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ps")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-ef")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" redis\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# root     14145     1  0 Jul08 ?        00:17:14 ./redis-server *:6379")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ls")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-al")]),s._v(" /proc/14145/exe\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# lrwxrwxrwx. 1 root root 0 7月 31 05:10 /proc/14145/exe -> /usr/local/bin/redis-server")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br")])]),a("h2",{attrs:{id:"tomcat"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#tomcat"}},[s._v("#")]),s._v(" Tomcat")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 查看tomcat是否启动，并查看tomcat端口号")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ps")]),s._v(" -ef"),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" tomcat\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("netstat")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-apn")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("7507")]),s._v("  \n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("netstat")]),s._v(" –pan "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" XXXX  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("此处XXXX为pid"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 重启tomcat")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" /home/yx/server8.5.50/apache-tomcat-8.5.40/bin\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sh")]),s._v(" shutdown.sh\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sh")]),s._v(" startup.sh\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 有时关闭服务操作不成功，强制删掉后台进程")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("kill")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-9")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("7010")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 实时查看tomcat运行日志")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" /home/yx/server8.5.50/apache-tomcat-8.5.40/logs\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("tail")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-f")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-n")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("500")]),s._v(" catalina.out "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看日志，同样Ctrl+c退出")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 清缓存")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" /home/yx/server8.5.50/apache-tomcat-8.5.40/work\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("rm")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-rf")]),s._v(" Catalina\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 截取日志 （前提是 catalina.out 日志中的每行都是以日期格式开头的）")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sed")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-n")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'/^2012-05-15/,/^2012-05-16/p'")]),s._v(" catalina.out "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" catalina_20120515.out\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br"),a("span",{staticClass:"line-number"},[s._v("15")]),a("br"),a("span",{staticClass:"line-number"},[s._v("16")]),a("br"),a("span",{staticClass:"line-number"},[s._v("17")]),a("br"),a("span",{staticClass:"line-number"},[s._v("18")]),a("br")])]),a("h2",{attrs:{id:"权限"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#权限"}},[s._v("#")]),s._v(" 权限")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#给文件的所有者加上 x 权限,即可使用:")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("chmod")]),s._v("   u+x   文件\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看文件权限")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ls")]),s._v("  "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-l")]),s._v("   文件\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br")])]),a("blockquote",[a("p",[s._v("参考："),a("a",{attrs:{href:"https://blog.csdn.net/weixin_42711549/article/details/81156370",target:"_blank",rel:"noopener noreferrer"}},[s._v(" 白小黑.."),a("OutboundLink")],1)])]),s._v(" "),a("h2",{attrs:{id:"文件复制-移动-大小"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#文件复制-移动-大小"}},[s._v("#")]),s._v(" 文件复制/移动/大小")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#复制文件夹 -r")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-r")]),s._v(" a文件夹 b新文件夹\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#将/test1目录下的file1复制到/test3 目录，并将文件名改为file2")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("mv")]),s._v(" /test1/file1 /test3/file2\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br")])]),a("h2",{attrs:{id:"上传下载"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#上传下载"}},[s._v("#")]),s._v(" 上传下载")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("yum "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-y")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" lrzsz "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#安装")]),s._v("\nrz "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#上传")]),s._v("\nsz "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#下载")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br")])]),a("h2",{attrs:{id:"压缩解压"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#压缩解压"}},[s._v("#")]),s._v(" 压缩解压")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#压缩指定文件夹为 tar.bz2")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@db phantomjs"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# tar -cjf echarts-convert.tar.bz2 echarts-convert/")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#解压 tar.bz2")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("root@db yx_zb"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# tar -xjvf echarts-convert.tar.bz2")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br")])]),a("h2",{attrs:{id:"建立软链接"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#建立软链接"}},[s._v("#")]),s._v(" 建立软链接")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("ln")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-s")]),s._v(" /usr/PhantomJS/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/bin/phantomjs\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br")])]),a("h2",{attrs:{id:"更改环境变量"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#更改环境变量"}},[s._v("#")]),s._v(" 更改环境变量")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("vim")]),s._v(" /etc/profile "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#编辑")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("source")]),s._v(" /etc/profile "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#重启使环境变量生效")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br")])]),a("h2",{attrs:{id:"端口-防火墙"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#端口-防火墙"}},[s._v("#")]),s._v(" 端口/防火墙")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function"}},[s._v("netstat")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-ntlp")]),s._v("   "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看当前所有tcp端口")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("netstat")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-ntulp")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("grep")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("80")]),s._v("   "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看所有80端口使用情况")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#开放端口： 1.修改 /etc/sysconfig/iptables 文件")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 2.如开放80端口,ACCEPT为开启、DROP为关闭")]),s._v("\niptables "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-A")]),s._v(" INPUT "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" tcp "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--dport")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("80")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-j")]),s._v(" ACCEPT "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#当数据从外部进入服务器为目标端口")]),s._v("\niptables "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-A")]),s._v(" OUTPUT "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" tcp "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("--sport")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("80")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-j")]),s._v(" ACCEPT "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#数据从服务器出去")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" iptables save "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#保证重启服务器后也不会失效")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" iptables restart "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#改完后重启防火墙")]),s._v("\n/sbin/iptables "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-L")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-n")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看开放的端口")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br")])]),a("h2",{attrs:{id:"禁ip"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#禁ip"}},[s._v("#")]),s._v(" 禁IP")]),s._v(" "),a("div",{staticClass:"language-shell line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-shell"}},[a("code",[s._v("iptables "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-A")]),s._v(" INPUT "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-p")]),s._v(" tcp "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-s")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".1.2 "),a("span",{pre:!0,attrs:{class:"token parameter variable"}},[s._v("-j")]),s._v(" DROP\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br")])]),a("Reward")],1)}),[],!1,null,null,null);a.default=n.exports}}]);