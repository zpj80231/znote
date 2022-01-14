---
title: EasyExcel
date: 2022-01-10
tags:
  - poi
  - 分布式
categories:
  - 后端 Back-end 
isShowComments: false
---

<Boxx/>

操作Excel实现导入导出是个非常常见的需求，之前介绍了一款非常好用的工具[EasyPoi](https://mp.weixin.qq.com/s?__biz=MzU1Nzg4NjgyMw==&mid=2247494886&idx=1&sn=7b9a4ff5aacc7d5f109ea8ee2babd06a&scene=21#wechat_redirect) 。有读者提出在数据量大的情况下，EasyPoi占用内存大，性能不够好。今天给大家推荐一款性能更好的Excel导入导出工具`EasyExcel`，希望对大家有所帮助！

<!-- more -->

[[toc]]

## EasyExcel简介

官方文档：[传送门](https://www.yuque.com/easyexcel/doc/easyexcel)

EasyExcel是一款阿里开源的Excel导入导出工具，具有处理快速、占用内存小、使用方便的特点，在Github上已有`22k+`Star，可见其非常流行。

EasyExcel读取75M(46W行25列)的Excel，仅需使用64M内存，耗时20s，极速模式还可以更快！

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPPOgicZGBhTXVylI0Ro3QYVBot3plnibKOplMP3JMZDW7y3Mrxia4biaOdQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 集成

> 在SpringBoot中集成EasyExcel非常简单，仅需一个依赖即可。

```xml
<!--EasyExcel相关依赖-->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.0.5</version>
</dependency>
```

## 使用

> EasyExcel和EasyPoi的使用非常类似，都是通过注解来控制导入导出。接下来我们以会员信息和订单信息的导入导出为例，分别实现下简单的单表导出和具有一对多关系的复杂导出。

### 简单导出

> 我们以会员信息的导出为例，来体验下EasyExcel的导出功能。

- 首先创建一个会员对象`Member`，封装会员信息，这里使用了EasyExcel的注解；

```java
/**
 * 购物会员
 * Created by macro on 2021/10/12.
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class Member {
    @ExcelProperty("ID")
    @ColumnWidth(10)
    private Long id;
    @ExcelProperty("用户名")
    @ColumnWidth(20)
    private String username;
    @ExcelIgnore
    private String password;
    @ExcelProperty("昵称")
    @ColumnWidth(20)
    private String nickname;
    @ExcelProperty("出生日期")
    @ColumnWidth(20)
    @DateTimeFormat("yyyy-MM-dd")
    private Date birthday;
    @ExcelProperty("手机号")
    @ColumnWidth(20)
    private String phone;
    @ExcelIgnore
    private String icon;
    @ExcelProperty(value = "性别", converter = GenderConverter.class)
    @ColumnWidth(10)
    private Integer gender;
}
```

- 上面代码使用到了EasyExcel的核心注解，我们分别来了解下：

- - @ExcelProperty：核心注解，`value`属性可用来设置表头名称，`converter`属性可以用来设置类型转换器；
  - @ColumnWidth：用于设置表格列的宽度；
  - @DateTimeFormat：用于设置日期转换格式。

- 在EasyExcel中，如果你想实现枚举类型到字符串的转换（比如gender属性中，`0->男`，`1->女`），需要自定义转换器，下面为自定义的`GenderConverter`代码实现；

```java
/**
 * excel性别转换器
 * Created by macro on 2021/12/29.
 */
public class GenderConverter implements Converter<Integer> {
    @Override
    public Class<?> supportJavaTypeKey() {
        //对象属性类型
        return Integer.class;
    }

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        //CellData属性类型
        return CellDataTypeEnum.STRING;
    }

    @Override
    public Integer convertToJavaData(ReadConverterContext<?> context) throws Exception {
        //CellData转对象属性
        String cellStr = context.getReadCellData().getStringValue();
        if (StrUtil.isEmpty(cellStr)) return null;
        if ("男".equals(cellStr)) {
            return 0;
        } else if ("女".equals(cellStr)) {
            return 1;
        } else {
            return null;
        }
    }

    @Override
    public WriteCellData<?> convertToExcelData(WriteConverterContext<Integer> context) throws Exception {
        //对象属性转CellData
        Integer cellValue = context.getValue();
        if (cellValue == null) {
            return new WriteCellData<>("");
        }
        if (cellValue == 0) {
            return new WriteCellData<>("男");
        } else if (cellValue == 1) {
            return new WriteCellData<>("女");
        } else {
            return new WriteCellData<>("");
        }
    }
}
```

- 接下来我们在Controller中添加一个接口，用于导出会员列表到Excel，还需给响应头设置下载excel的属性，具体代码如下；

```java
/**
 * EasyExcel导入导出测试Controller
 * Created by macro on 2021/10/12.
 */
@Controller
@Api(tags = "EasyExcelController", description = "EasyExcel导入导出测试")
@RequestMapping("/easyExcel")
public class EasyExcelController {

    @SneakyThrows(IOException.class)
    @ApiOperation(value = "导出会员列表Excel")
    @RequestMapping(value = "/exportMemberList", method = RequestMethod.GET)
    public void exportMemberList(HttpServletResponse response) {
        setExcelRespProp(response, "会员列表");
        List<Member> memberList = LocalJsonUtil.getListFromJson("json/members.json", Member.class);
        EasyExcel.write(response.getOutputStream())
                .head(Member.class)
                .excelType(ExcelTypeEnum.XLSX)
                .sheet("会员列表")
                .doWrite(memberList);
    }
    
  /**
   * 设置excel下载响应头属性
   */
  private void setExcelRespProp(HttpServletResponse response, String rawFileName) throws UnsupportedEncodingException {
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setCharacterEncoding("utf-8");
    String fileName = URLEncoder.encode(rawFileName, "UTF-8").replaceAll("\\+", "%20");
    response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
  }
}
```

- 运行项目，通过Swagger测试接口，注意在Swagger中访问接口无法直接下载，需要点击返回结果中的`下载按钮`才行，访问地址：http://localhost:8088/swagger-ui/

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPZISsZHpGyffQfH2uyibcS33PbmBnkUu66yj3lNX2iawx0GeEKvuicuhqg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

- 下载完成后，查看下文件，一个标准的Excel文件已经被导出了。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPib0rDK6jCyIicUUU04hrzgk2Bozlcibia7mGVjg321RLzN40ay5ictocjUQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 简单导入

> 接下来我们以会员信息的导入为例，来体验下EasyExcel的导入功能。

- 在Controller中添加会员信息导入的接口，这里需要注意的是使用`@RequestPart`注解修饰文件上传参数，否则在Swagger中就没法显示上传按钮了；

```java
/**
 * EasyExcel导入导出测试Controller
 * Created by macro on 2021/10/12.
 */
@Controller
@Api(tags = "EasyExcelController", description = "EasyExcel导入导出测试")
@RequestMapping("/easyExcel")
public class EasyExcelController {
    
    @SneakyThrows
    @ApiOperation("从Excel导入会员列表")
    @RequestMapping(value = "/importMemberList", method = RequestMethod.POST)
    @ResponseBody
    public CommonResult importMemberList(@RequestPart("file") MultipartFile file) {
        List<Member> memberList = EasyExcel.read(file.getInputStream())
                .head(Member.class)
                .sheet()
                .doReadSync();
        return CommonResult.success(memberList);
    }
}
```

- 然后在Swagger中测试接口，选择之前导出的Excel文件即可，导入成功后会返回解析到的数据。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPLNzwPyib9vVMtpdpYEpEBMalXSMd4eWvlTZ6LkFADcE4c8IagvTgzCQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 复杂导出

> 当然EasyExcel也可以实现更加复杂的导出，比如导出一个嵌套了商品信息的订单列表，下面我们来实现下！

#### 使用EasyPoi实现

之前我们使用过EasyPoi实现该功能，由于EasyPoi本来就支持嵌套对象的导出，直接使用内置的`@ExcelCollection`注解即可实现，非常方便也符合面向对象的思想。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPDB9FpZfsRI0PAnuFNYWBdWzjXBy7KWYOeR9WTJca1WCz3mQpKPVzGw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 寻找方案

> 由于EasyExcel本身并不支持这种一对多的信息导出，所以我们得自行实现下，这里分享一个我平时常用的`快速查找解决方案`的办法。

我们可以直接从开源项目的`issues`里面去搜索，比如搜索下`一对多`，会直接找到`有无一对多导出比较优雅的方案`这个issue。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPBpb1ficPxcBzZ5IXNYBsNhiabnXYibEaFC5jE7xhntsWIheXj4tqGoHUA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

从此issue的回复我们可以发现，项目维护者建议`创建自定义合并策略`来实现，有位回复的老哥已经给出了实现代码，接下来我们就用这个方案来实现下。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPAgptLpIEWgicS4P3V8uKEiaJwicupic3ANicoJLh1CMvluz814LJSfbnZqg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 解决思路

为什么自定义单元格合并策略能实现一对多的列表信息的导出呢？首先我们来看下将嵌套数据平铺，不进行合并导出的Excel。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPtfP6pF6pIMaH2UzWoZVD7MyVOLz6ib1X8m3S7YZOzsslUAvgZXVp68w/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

看完之后我们很容易理解解决思路，只要把`订单ID`相同的列中需要合并的列给合并了，就可以实现这种一对多嵌套信息的导出了。

#### 实现过程

- 首先我们得把原来嵌套的订单商品信息给平铺了，创建一个专门的导出对象`OrderData`，包含订单和商品信息，二级表头可以通过设置`@ExcelProperty`的value为数组来实现；

```java
/**
 * 订单导出
 * Created by macro on 2021/12/30.
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class OrderData {
    @ExcelProperty(value = "订单ID")
    @ColumnWidth(10)
    @CustomMerge(needMerge = true, isPk = true)
    private String id;
    @ExcelProperty(value = "订单编码")
    @ColumnWidth(20)
    @CustomMerge(needMerge = true)
    private String orderSn;
    @ExcelProperty(value = "创建时间")
    @ColumnWidth(20)
    @DateTimeFormat("yyyy-MM-dd")
    @CustomMerge(needMerge = true)
    private Date createTime;
    @ExcelProperty(value = "收货地址")
    @CustomMerge(needMerge = true)
    @ColumnWidth(20)
    private String receiverAddress;
    @ExcelProperty(value = {"商品信息", "商品编码"})
    @ColumnWidth(20)
    private String productSn;
    @ExcelProperty(value = {"商品信息", "商品名称"})
    @ColumnWidth(20)
    private String name;
    @ExcelProperty(value = {"商品信息", "商品标题"})
    @ColumnWidth(30)
    private String subTitle;
    @ExcelProperty(value = {"商品信息", "品牌名称"})
    @ColumnWidth(20)
    private String brandName;
    @ExcelProperty(value = {"商品信息", "商品价格"})
    @ColumnWidth(20)
    private BigDecimal price;
    @ExcelProperty(value = {"商品信息", "商品数量"})
    @ColumnWidth(20)
    private Integer count;
}
```

- 然后将原来嵌套的`Order`对象列表转换为`OrderData`对象列表；

```java
/**
 * EasyExcel导入导出测试Controller
 * Created by macro on 2021/10/12.
 */
@Controller
@Api(tags = "EasyExcelController", description = "EasyExcel导入导出测试")
@RequestMapping("/easyExcel")
public class EasyExcelController {
    private List<OrderData> convert(List<Order> orderList) {
        List<OrderData> result = new ArrayList<>();
        for (Order order : orderList) {
            List<Product> productList = order.getProductList();
            for (Product product : productList) {
                OrderData orderData = new OrderData();
                BeanUtil.copyProperties(product,orderData);
                BeanUtil.copyProperties(order,orderData);
                result.add(orderData);
            }
        }
        return result;
    }
}
```

- 再创建一个自定义注解`CustomMerge`，用于标记哪些属性需要合并，哪个是主键；

```java
/**
 * 自定义注解，用于判断是否需要合并以及合并的主键
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface CustomMerge {

    /**
     * 是否需要合并单元格
     */
    boolean needMerge() default false;

    /**
     * 是否是主键,即该字段相同的行合并
     */
    boolean isPk() default false;
}
```

- 再创建自定义单元格合并策略类`CustomMergeStrategy`，当Excel中两列主键相同时，合并被标记需要合并的列；

```java
/**
 * 自定义单元格合并策略
 */
public class CustomMergeStrategy implements RowWriteHandler {
    /**
     * 主键下标
     */
    private Integer pkIndex;

    /**
     * 需要合并的列的下标集合
     */
    private List<Integer> needMergeColumnIndex = new ArrayList<>();

    /**
     * DTO数据类型
     */
    private Class<?> elementType;

    public CustomMergeStrategy(Class<?> elementType) {
        this.elementType = elementType;
    }

    @Override
    public void afterRowDispose(WriteSheetHolder writeSheetHolder, WriteTableHolder writeTableHolder, Row row, Integer relativeRowIndex, Boolean isHead) {
        // 如果是标题,则直接返回
        if (isHead) {
            return;
        }

        // 获取当前sheet
        Sheet sheet = writeSheetHolder.getSheet();

        // 获取标题行
        Row titleRow = sheet.getRow(0);

        if (null == pkIndex) {
            this.lazyInit(writeSheetHolder);
        }

        // 判断是否需要和上一行进行合并
        // 不能和标题合并，只能数据行之间合并
        if (row.getRowNum() <= 1) {
            return;
        }
        // 获取上一行数据
        Row lastRow = sheet.getRow(row.getRowNum() - 1);
        // 将本行和上一行是同一类型的数据(通过主键字段进行判断)，则需要合并
        if (lastRow.getCell(pkIndex).getStringCellValue().equalsIgnoreCase(row.getCell(pkIndex).getStringCellValue())) {
            for (Integer needMerIndex : needMergeColumnIndex) {
                CellRangeAddress cellRangeAddress = new CellRangeAddress(row.getRowNum() - 1, row.getRowNum(),
                        needMerIndex, needMerIndex);
                sheet.addMergedRegionUnsafe(cellRangeAddress);
            }
        }
    }

    /**
     * 初始化主键下标和需要合并字段的下标
     */
    private void lazyInit(WriteSheetHolder writeSheetHolder) {

        // 获取当前sheet
        Sheet sheet = writeSheetHolder.getSheet();

        // 获取标题行
        Row titleRow = sheet.getRow(0);
        // 获取DTO的类型
        Class<?> eleType = this.elementType;

        // 获取DTO所有的属性
        Field[] fields = eleType.getDeclaredFields();

        // 遍历所有的字段，因为是基于DTO的字段来构建excel，所以字段数 >= excel的列数
        for (Field theField : fields) {
            // 获取@ExcelProperty注解，用于获取该字段对应在excel中的列的下标
            ExcelProperty easyExcelAnno = theField.getAnnotation(ExcelProperty.class);
            // 为空,则表示该字段不需要导入到excel,直接处理下一个字段
            if (null == easyExcelAnno) {
                continue;
            }
            // 获取自定义的注解，用于合并单元格
            CustomMerge customMerge = theField.getAnnotation(CustomMerge.class);

            // 没有@CustomMerge注解的默认不合并
            if (null == customMerge) {
                continue;
            }

            for (int index = 0; index < fields.length; index++) {
                Cell theCell = titleRow.getCell(index);
                // 当配置为不需要导出时，返回的为null，这里作一下判断，防止NPE
                if (null == theCell) {
                    continue;
                }
                // 将字段和excel的表头匹配上
                if (easyExcelAnno.value()[0].equalsIgnoreCase(theCell.getStringCellValue())) {
                    if (customMerge.isPk()) {
                        pkIndex = index;
                    }

                    if (customMerge.needMerge()) {
                        needMergeColumnIndex.add(index);
                    }
                }
            }
        }

        // 没有指定主键，则异常
        if (null == this.pkIndex) {
            throw new IllegalStateException("使用@CustomMerge注解必须指定主键");
        }

    }
}
```

- 接下来在Controller中添加导出订单列表的接口，将我们自定义的合并策略`CustomMergeStrategy`给注册上去；

```java
/**
 * EasyExcel导入导出测试Controller
 * Created by macro on 2021/10/12.
 */
@Controller
@Api(tags = "EasyExcelController", description = "EasyExcel导入导出测试")
@RequestMapping("/easyExcel")
public class EasyExcelController {
    
    @SneakyThrows
    @ApiOperation(value = "导出订单列表Excel")
    @RequestMapping(value = "/exportOrderList", method = RequestMethod.GET)
    public void exportOrderList(HttpServletResponse response) {
        List<Order> orderList = getOrderList();
        List<OrderData> orderDataList = convert(orderList);
        setExcelRespProp(response, "订单列表");
        EasyExcel.write(response.getOutputStream())
                .head(OrderData.class)
                .registerWriteHandler(new CustomMergeStrategy(OrderData.class))
                .excelType(ExcelTypeEnum.XLSX)
                .sheet("订单列表")
                .doWrite(orderDataList);
    }
}
```

- 在Swagger中访问接口测试，导出订单列表对应Excel；

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPuCXu6OlyQzxw2Me6fhjKLkEjReLykiclymWlQQckMnYAHfXl6uqRCLg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

- 下载完成后，查看下文件，由于EasyExcel需要自己来实现，对比之前使用EasyPoi来实现麻烦了不少。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPUh4DxbkjCrGhbqPiaHKVicqroEKImPeX5RPFzU6muCicUavNQKM02icdGQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 其他使用

由于EasyExcel的官方文档介绍的比较简单，如果你想要更深入地进行使用的话，建议大家看下官方Demo。

![图片](https://mmbiz.qpic.cn/mmbiz_png/CKvMdchsUwnnPJ3fpicIGX2XY6q8kEVBPU5usFtic3Z4cuMzMbx397CQqtcQUibY55KKM75U6H4sDMWz6ngocMGfg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

## 总结

体验了一把EasyExcel，使用还是挺方便的，性能也很优秀。但是比较常见的一对多导出实现比较复杂，而且功能也不如[EasyPoi]() 强大。如果你的Excel导出数据量不大的话，可以使用EasyPoi，如果数据量大，比较在意性能的话，还是使用EasyExcel吧。

<p style="text-align: right;font-size: 10px;font-style: italic;">
来源于 https://mp.weixin.qq.com/s/1c9ojd9GaUO70IhJu3jO8A
</p>

## 参考资料

- 项目地址：https://github.com/alibaba/easyexcel
- 官方文档：https://www.yuque.com/easyexcel/doc/easyexcel

## 项目源码地址

https://github.com/macrozheng/mall-learning/tree/master/mall-tiny-easyexcel



