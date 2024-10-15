(window.webpackJsonp=window.webpackJsonp||[]).push([[157],{624:function(a,s,e){"use strict";e.r(s);var t=e(2),r=Object(t.a)({},(function(){var a=this,s=a._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[s("Boxx"),a._v(" "),s("p",[a._v("工作中常用到的 k8s 命令备份，方便查看。")]),a._v(" "),s("p"),s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#查看指定命名空间下的所有节点"}},[a._v("查看指定命名空间下的所有节点")])]),s("li",[s("a",{attrs:{href:"#进入某一节点"}},[a._v("进入某一节点")])]),s("li",[s("a",{attrs:{href:"#删除某一节点"}},[a._v("删除某一节点")])]),s("li",[s("a",{attrs:{href:"#查看pod暴露的端口号"}},[a._v("查看pod暴露的端口号")])]),s("li",[s("a",{attrs:{href:"#移动文件至pod内部"}},[a._v("移动文件至pod内部")])]),s("li",[s("a",{attrs:{href:"#修改configmap"}},[a._v("修改ConfigMap")])]),s("li",[s("a",{attrs:{href:"#其他参考"}},[a._v("其他参考")])])])]),s("p"),a._v(" "),s("h2",{attrs:{id:"查看指定命名空间下的所有节点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#查看指定命名空间下的所有节点"}},[a._v("#")]),a._v(" 查看指定命名空间下的所有节点")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[a._v("kubectl get pod "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br")])]),s("h2",{attrs:{id:"进入某一节点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#进入某一节点"}},[a._v("#")]),a._v(" 进入某一节点")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[a._v("kubectl "),s("span",{pre:!0,attrs:{class:"token builtin class-name"}},[a._v("exec")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-it")]),a._v(" test-pod-statefulset-1 /bin/bash "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br")])]),s("h2",{attrs:{id:"删除某一节点"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#删除某一节点"}},[a._v("#")]),a._v(" 删除某一节点")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[a._v("kubectl delete test-pod-statefulset-1 "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br")])]),s("h2",{attrs:{id:"查看pod暴露的端口号"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#查看pod暴露的端口号"}},[a._v("#")]),a._v(" 查看pod暴露的端口号")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[a._v("kubectl get svc "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br")])]),s("h2",{attrs:{id:"移动文件至pod内部"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#移动文件至pod内部"}},[a._v("#")]),a._v(" 移动文件至pod内部")]),a._v(" "),s("p",[a._v("移到文件到容器中pod的pvc目录下后重启pod，pvc目录中的文件不会丢失")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[a._v("kubectl "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("cp")]),a._v(" ./aaa test-pod-statefulset-1:/bbb/sdf\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br")])]),s("h2",{attrs:{id:"修改configmap"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#修改configmap"}},[a._v("#")]),a._v(" 修改ConfigMap")]),a._v(" "),s("p",[a._v("同理修改：pod、svc、statefulset、cm（cm代表ConfigMap）")]),a._v(" "),s("div",{staticClass:"language-shell line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-shell"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# 查看ConfigMap")]),a._v("\nkubectl get cm "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" obp\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# 编辑")]),a._v("\nkubectl edit cm test-pod-config "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("# 删除")]),a._v("\nkubectl delete cm test-pod-config "),s("span",{pre:!0,attrs:{class:"token parameter variable"}},[a._v("-n")]),a._v(" znote\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br")])]),s("h2",{attrs:{id:"其他参考"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#其他参考"}},[a._v("#")]),a._v(" 其他参考")]),a._v(" "),s("p",[s("a",{attrs:{href:"https://www.cnblogs.com/benjamin77/p/12446781.html",target:"_blank",rel:"noopener noreferrer"}},[a._v("k8s中部署发布应用"),s("OutboundLink")],1)])],1)}),[],!1,null,null,null);s.default=r.exports}}]);