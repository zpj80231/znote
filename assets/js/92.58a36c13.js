(window.webpackJsonp=window.webpackJsonp||[]).push([[92],{559:function(s,t,a){"use strict";a.r(t);var n=a(2),e=Object(n.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("Boxx"),s._v(" "),t("p",[s._v("添加资源加载接口定义类：Resource，及核心实现：DefaultResourceLoader；")]),s._v(" "),t("p",[s._v("添加加载Bean定义接口：BeanDefinitionReader，及核心实现xml解析：XmlBeanDefinitionReader")]),s._v(" "),t("p",[s._v("与现有容器结合：通过构造参数的方式将容器注入到xml加载器中，将加载到资源解析给指定容器")]),s._v(" "),t("p"),t("div",{staticClass:"table-of-contents"},[t("ul",[t("li",[t("a",{attrs:{href:"#从外部资源加载-bean"}},[s._v("从外部资源加载 Bean")]),t("ul",[t("li",[t("a",{attrs:{href:"#定义一些职责和能力"}},[s._v("定义一些职责和能力：")])]),t("li",[t("a",{attrs:{href:"#具体的实现"}},[s._v("具体的实现：")])]),t("li",[t("a",{attrs:{href:"#将实现加入原有的逻辑中"}},[s._v("将实现加入原有的逻辑中：")])]),t("li",[t("a",{attrs:{href:"#测试"}},[s._v("测试：")])])])]),t("li",[t("a",{attrs:{href:"#外部资源和现有容器整合"}},[s._v("外部资源和现有容器整合")]),t("ul",[t("li",[t("a",{attrs:{href:"#定义一些职责和能力"}},[s._v("定义一些职责和能力：")])]),t("li",[t("a",{attrs:{href:"#具体的实现"}},[s._v("具体的实现：")])]),t("li",[t("a",{attrs:{href:"#将实现加入原有的逻辑中"}},[s._v("将实现加入原有的逻辑中：")])]),t("li",[t("a",{attrs:{href:"#测试"}},[s._v("测试：")])])])])])]),t("p"),s._v(" "),t("h2",{attrs:{id:"从外部资源加载-bean"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#从外部资源加载-bean"}},[s._v("#")]),s._v(" 从外部资源加载 Bean")]),s._v(" "),t("p",[s._v("在 Bean 的实例化和属性填充完成后，我们已经可以通过在代码里手动 new 对象的方式实现一个简单的 Bean 容器。")]),s._v(" "),t("p",[s._v("为了方便的从外部配置、加载 Bean，抽取一个工具类可以从不同位置获取 定义 Bean 的配置文件信息。")]),s._v(" "),t("h3",{attrs:{id:"定义一些职责和能力"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#定义一些职责和能力"}},[s._v("#")]),s._v(" 定义一些职责和能力：")]),s._v(" "),t("ol",[t("li",[s._v("Resource：InputStream getInputStream() throws IOException; 定义资源接口；")]),s._v(" "),t("li",[s._v("ResourceLoader：Resource getResource(String location); 定义资源包装接口，根据入参自动匹配相应的资源（Resource）；")])]),s._v(" "),t("h3",{attrs:{id:"具体的实现"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#具体的实现"}},[s._v("#")]),s._v(" 具体的实现：")]),s._v(" "),t("ol",[t("li",[s._v("ClassPathResource：可以从类路径下读取资源；")]),s._v(" "),t("li",[s._v("FileSystemResource：可以从指定路径或指定文件读取资源；")]),s._v(" "),t("li",[s._v("UrlResource：可以从指定url读取资源；")]),s._v(" "),t("li",[s._v("DefaultResourceLoader：根据location自动匹配相应的资源；")])]),s._v(" "),t("h3",{attrs:{id:"将实现加入原有的逻辑中"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#将实现加入原有的逻辑中"}},[s._v("#")]),s._v(" 将实现加入原有的逻辑中：")]),s._v(" "),t("ul",[t("li",[s._v("无")])]),s._v(" "),t("h3",{attrs:{id:"测试"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#测试"}},[s._v("#")]),s._v(" 测试：")]),s._v(" "),t("div",{staticClass:"language-java line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DefaultResourceLoaderTest")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n\n   "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("private")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("ResourceLoader")]),s._v(" resourceLoader"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n   "),t("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Before")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("void")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("init")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n      resourceLoader "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DefaultResourceLoader")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n   "),t("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Test")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("void")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("test_classpath")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("throws")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("IOException")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Resource")]),s._v(" resource "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" resourceLoader"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("getResource")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"classpath:spring.xml"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("InputStream")]),s._v(" inputStream "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" resource"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("getInputStream")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("String")]),s._v(" content "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("IoUtil")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("readUtf8")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("inputStream"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"===== classpath ====="')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("content"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"===== classpath ====="')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n   "),t("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Test")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("void")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("test_file")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("throws")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("IOException")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Resource")]),s._v(" resource "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" resourceLoader"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("getResource")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"src/main/resources/spring.xml"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("InputStream")]),s._v(" inputStream "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" resource"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("getInputStream")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("String")]),s._v(" content "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("IoUtil")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("readUtf8")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("inputStream"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"===== file ====="')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("content"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("System")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("out"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("println")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"===== file ====="')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br"),t("span",{staticClass:"line-number"},[s._v("20")]),t("br"),t("span",{staticClass:"line-number"},[s._v("21")]),t("br"),t("span",{staticClass:"line-number"},[s._v("22")]),t("br"),t("span",{staticClass:"line-number"},[s._v("23")]),t("br"),t("span",{staticClass:"line-number"},[s._v("24")]),t("br"),t("span",{staticClass:"line-number"},[s._v("25")]),t("br"),t("span",{staticClass:"line-number"},[s._v("26")]),t("br"),t("span",{staticClass:"line-number"},[s._v("27")]),t("br"),t("span",{staticClass:"line-number"},[s._v("28")]),t("br"),t("span",{staticClass:"line-number"},[s._v("29")]),t("br"),t("span",{staticClass:"line-number"},[s._v("30")]),t("br")])]),t("h2",{attrs:{id:"外部资源和现有容器整合"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#外部资源和现有容器整合"}},[s._v("#")]),s._v(" 外部资源和现有容器整合")]),s._v(" "),t("p",[s._v("从外部资源获取到 Bean 的配置信息后，需要解析配置信息与现有的 Bean 容器结合，增强容器的能力（省去了在代码中手动添加 Bean 的过程）。")]),s._v(" "),t("h3",{attrs:{id:"定义一些职责和能力-2"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#定义一些职责和能力-2"}},[s._v("#")]),s._v(" 定义一些职责和能力：")]),s._v(" "),t("ol",[t("li",[s._v("BeanDefinitionReader：定义加载Bean定义接口，从各个资源加载为 BeanDefinition；")])]),s._v(" "),t("h3",{attrs:{id:"具体的实现-2"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#具体的实现-2"}},[s._v("#")]),s._v(" 具体的实现：")]),s._v(" "),t("ol",[t("li",[s._v("AbstractBeanDefinitionReader：一个抽线类默认实现，主要提供对 getRegistry()、getResourceLoader() 的默认实现，子类只需关心加载Bean定义即可；")]),s._v(" "),t("li",[s._v("XmlBeanDefinitionReader：从 xml 文件读取 bean，转换为 BeanDefinition，并注册到指定的 BeanDefinitionRegistry （DefaultListableBeanFactory 已经具备了这个能力）；")])]),s._v(" "),t("h3",{attrs:{id:"将实现加入原有的逻辑中-2"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#将实现加入原有的逻辑中-2"}},[s._v("#")]),s._v(" 将实现加入原有的逻辑中：")]),s._v(" "),t("ul",[t("li",[s._v("无")])]),s._v(" "),t("h3",{attrs:{id:"测试-2"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#测试-2"}},[s._v("#")]),s._v(" 测试：")]),s._v(" "),t("div",{staticClass:"language-java line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-java"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("class")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("XmlBeanDefinitionReaderTest")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n\n   "),t("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[s._v("@Test")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("void")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("test_xml")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 核心容器")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DefaultListableBeanFactory")]),s._v(" beanFactory "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DefaultListableBeanFactory")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 读取 xml 解析为 Bean")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("XmlBeanDefinitionReader")]),s._v(" reader "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("XmlBeanDefinitionReader")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("beanFactory"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      reader"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("loadBeanDefinitions")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"classpath:spring.xml"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 获取指定 Bean")]),s._v("\n      "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Dog")]),s._v(" dog "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Dog")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" beanFactory"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("getBean")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"dog"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n      dog"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("printName")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n   "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br")])]),t("Reward")],1)}),[],!1,null,null,null);t.default=e.exports}}]);