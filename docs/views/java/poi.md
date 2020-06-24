---
title: "poi多线程多sheet导出Excel,csv"
date: 2018-08-20
tags:
- Java
- poi
- 多线程
categories:
- "后端"
isShowComments: false
---

<Boxx/>

因项目特殊，最近遇到了`Excel导出大数据量`的问题，所以就趁着解决这个问题的机会，把poi导出Excel再整理一遍，方便自己日后总结。

<!-- more -->

[[toc]]

## 概要


Excel：POI 多线程多sheet导出数据

- Excel2003版最大行数是65536，Excel2007最大行数是1048576
- Excel2003版最大列数是256，Excel2007最大列数是16384



## 问题原因

1. 导出大数据量，可能遇到的第一个问题就是后台报：`java.lang.OutOfMemoryError: Java heap space 内存溢出`这个问题

   > 分析：poi导出时，会先把内容写到内存中，最后浏览器从内存中下载，但是数据量太大，会导致内存溢出



## 解决办法：

### 1. 调整jvm/tomcat大小

- 设置jvm：-Xms64m -Xmx512m（依据你物理内存的大小调整）

  > 祥见：<https://www.cnblogs.com/jhcelue/p/6900881.html>



### 2. 通过新版的SXSSFWorkbook来解决

- 自poi3.8以后，可通过新版的SXSSFWorkbook来解决，可通过其构造函数指定在内存中缓存的行数，内存中指定行数满足时会自动缓存在硬盘的临时目录上然后循环下一次，同时，并不会存在页面卡顿的情况；   

  > JAVA使用POI如何导出百万级别数据：
  >
  > <https://www.cnblogs.com/520playboy/p/6275170.html>
  >
  > <https://fanshuyao.iteye.com/blog/2426095>   



### 3. 转csv导出

- CSV是一种通用的、相对简单的文件格式，其文件以纯文本形式存储表格数据（数字和文本）。
- Excel和CSV格式文件的不同之处 => [传送门](https://blog.csdn.net/weixin_39198406/article/details/78705016)

> 手写一个 csv，可先直接运行main()查看结果

```java
package com.zpj.electric.utils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import com.alibaba.druid.util.StringUtils;

/**
 * @className: CSVUtils
 * @date: 2018/7/16
 * @version: 1.0
 */

public class CSVUtils {


    /**
     * 功能说明：获取UTF-8编码文本文件开头的BOM签名。
     * BOM(Byte Order Mark)，是UTF编码方案里用于标识编码的标准标记。例：接收者收到以EF BB BF开头的字节流，就知道是UTF-8编码。
     * @return UTF-8编码文本文件开头的BOM签名
     */
    public static String getBOM() {

        byte b[] = {(byte)0xEF, (byte)0xBB, (byte)0xBF};
        return new String(b);
    }

    /**
     * 生成CVS文件
     * @param exportData
     *       源数据List
     * @param map
     *       csv文件的列表头map
     * @param outPutPath
     *       文件路径
     * @param fileName
     *       文件名称
     * @return
     */
    @SuppressWarnings("rawtypes")
    public static File createCSVFile(List exportData, LinkedHashMap map, String outPutPath,
                                     String fileName) {
        File csvFile = null;
        BufferedWriter csvFileOutputStream = null;
        try {
            File file = new File(outPutPath);
            if (!file.exists()) {
                file.mkdirs();
            }
            //定义文件名格式并创建
            csvFile =new File(outPutPath+fileName+".csv");
            file.createNewFile();
            // UTF-8使正确读取分隔符","
            //如果生产文件乱码，windows下用gbk，linux用UTF-8
            csvFileOutputStream = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(
                    csvFile), "UTF-8"), 1024);

            //写入前段字节流，防止乱码
            csvFileOutputStream.write(getBOM());
            // 写入文件头部
            for (Iterator propertyIterator = map.entrySet().iterator(); propertyIterator.hasNext();) {
                java.util.Map.Entry propertyEntry = (java.util.Map.Entry) propertyIterator.next();
                csvFileOutputStream.write((String) propertyEntry.getValue() != null ? (String) propertyEntry.getValue() : "" );
                if (propertyIterator.hasNext()) {
                    csvFileOutputStream.write(",");
                }
            }
            csvFileOutputStream.newLine();
            // 写入文件内容
            for (Iterator iterator = exportData.iterator(); iterator.hasNext();) {
                Object row = (Object) iterator.next();
                for (Iterator propertyIterator = map.entrySet().iterator(); propertyIterator
                        .hasNext();) {
                    java.util.Map.Entry propertyEntry = (java.util.Map.Entry) propertyIterator
                            .next();
                    String str=row!=null?((String)((Map)row).get( propertyEntry.getKey())):"";

                    if(StringUtils.isEmpty(str)){
                        str="";
                    }else{
                        str=str.replaceAll("\"","\"\"");
                        if(str.indexOf(",")>=0){
                            str="\""+str+"\"";
                        }
                    }
                    csvFileOutputStream.write(str);
                    if (propertyIterator.hasNext()) {
                        csvFileOutputStream.write(",");
                    }
                }
                if (iterator.hasNext()) {
                    csvFileOutputStream.newLine();
                }
            }
            csvFileOutputStream.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                csvFileOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return csvFile;
    }

    /**
     *     生成并下载csv文件
     * @param response
     * @param exportData
     * @param map
     * @param outPutPath
     * @param fileName
     * @throws IOException
     */
    @SuppressWarnings("rawtypes")
    public static void exportDataFile(HttpServletResponse response,List exportData, LinkedHashMap map, String outPutPath,String fileName) throws IOException{
        File csvFile = null;
        BufferedWriter csvFileOutputStream = null;
        try {
            File file = new File(outPutPath);
            if (!file.exists()) {
                file.mkdirs();
            }
            //定义文件名格式并创建
            csvFile =new File(outPutPath+fileName+".csv");
            if(csvFile.exists()){
                csvFile.delete();
            }
            csvFile.createNewFile();
            // UTF-8使正确读取分隔符","
            //如果生产文件乱码，windows下用gbk，linux用UTF-8
            csvFileOutputStream = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(csvFile), "UTF-8"), 1024);
            //写入前段字节流，防止乱码
            csvFileOutputStream.write(getBOM());
            // 写入文件头部
            for (Iterator propertyIterator = map.entrySet().iterator(); propertyIterator.hasNext();) {
                java.util.Map.Entry propertyEntry = (java.util.Map.Entry) propertyIterator.next();
                csvFileOutputStream.write((String) propertyEntry.getValue() != null ? (String) propertyEntry.getValue() : "" );
                if (propertyIterator.hasNext()) {
                    csvFileOutputStream.write(",");
                }
            }
            csvFileOutputStream.newLine();
            // 写入文件内容
            for (Iterator iterator = exportData.iterator(); iterator.hasNext();) {
                Object row = (Object) iterator.next();
                for (Iterator propertyIterator = map.entrySet().iterator(); propertyIterator
                        .hasNext();) {
                    java.util.Map.Entry propertyEntry = (java.util.Map.Entry) propertyIterator
                            .next();
                    String str=row!=null?((String)((Map)row).get( propertyEntry.getKey())):"";
                    if(StringUtils.isEmpty(str)){
                        str="";
                    }else{
                        str=str.replaceAll("\"","\"\"");
                        if(str.indexOf(",")>=0){
                            str="\""+str+"\"";
                        }
                    }
                    csvFileOutputStream.write(str);
                    if (propertyIterator.hasNext()) {
                        csvFileOutputStream.write(",");
                    }
                }
                if (iterator.hasNext()) {
                    csvFileOutputStream.newLine();
                }
            }
            csvFileOutputStream.flush();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                csvFileOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }




        InputStream in = null;
        try {
            in = new FileInputStream(outPutPath+fileName+".csv");
            int len = 0;
            byte[] buffer = new byte[1024];

            OutputStream out = response.getOutputStream();
            response.reset();

            response.setContentType("application/csv;charset=UTF-8");
            response.setHeader("Content-Disposition","attachment; filename=" + URLEncoder.encode(fileName+".csv", "UTF-8"));
            response.setCharacterEncoding("UTF-8");
            while ((len = in.read(buffer)) > 0) {
                out.write(new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF });
                out.write(buffer, 0, len);
            }
            out.close();
        } catch (FileNotFoundException e) {
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }

    }

    /**
     * 删除该目录filePath下的所有文件
     * @param filePath
     *      文件目录路径
     */
    public static void deleteFiles(String filePath) {
        File file = new File(filePath);
        if (file.exists()) {
            File[] files = file.listFiles();
            for (int i = 0; i < files.length; i++) {
                if (files[i].isFile()) {
                    files[i].delete();
                }
            }
        }
    }

    /**
     * 删除单个文件
     * @param filePath
     *     文件目录路径
     * @param fileName
     *     文件名称
     */
    public static void deleteFile(String filePath, String fileName) {
        File file = new File(filePath);
        if (file.exists()) {
            File[] files = file.listFiles();
            for (int i = 0; i < files.length; i++) {
                if (files[i].isFile()) {
                    if (files[i].getName().equals(fileName)) {
                        files[i].delete();
                        return;
                    }
                }
            }
        }
    }

    /**
     * 测试数据
     * @param args
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static void main(String[] args) {
        List exportData = new ArrayList<Map>();
        Map row1 = new LinkedHashMap<String, String>();
        row1.put("1", "11");
        row1.put("2", "12");
        row1.put("3", "13");
        row1.put("4", "14");
        exportData.add(row1);
        row1 = new LinkedHashMap<String, String>();
        row1.put("1", "21");
        row1.put("2", "22");
        row1.put("3", "23");
        row1.put("4", "24");
        exportData.add(row1);
        LinkedHashMap map = new LinkedHashMap();

        //设置列名
        map.put("1", "第一列名称");
        map.put("2", "第二列名称");
        map.put("3", "第三列名称");
        map.put("4", "第四列名称");
        //这个文件上传到路径，可以配置在数据库从数据库读取，这样方便一些！
        String path = "E:/";

        //文件名=生产的文件名称+时间戳
        String fileName = "文件导出";
        File file = CSVUtils.createCSVFile(exportData, map, path, fileName);
        String fileName2 = file.getName();
        System.out.println("文件名称：" + fileName2);
    }
}
```



### 4. 本地90万数据：输入输出流+poi多线程多sheet导出Excel

> 可直接运行main()查看导出结果，注意poi版本3.7+

```java
package com.zpj.electric.util.excel;

import com.zpj.electric.po.Student;
import org.apache.commons.beanutils.PropertyUtilsBean;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.beans.PropertyDescriptor;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class ThreadExcelUtils {

    /**
     * 定义没个 sheet 最多数量
     */
    public static final Integer EXCEL_MAX_CNT = 50000;

    private Workbook wb;

    private String fileName;

    private String filePath;

    private String[] hearders;

    private String[] fields;

    public Workbook getWb() {
        return wb;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public String[] getHearders() {
        return hearders;
    }

    public String[] getFields() {
        return fields;
    }

    /**
     * @param fileName 文件名称
     * @param filePath 文件路径
     * @param hearders 文件头
     * @param fields   字段属性
     * @Author maochuang.li
     * @Date Create in 13:54 2017/12/28 0028
     */
    public ThreadExcelUtils(String fileName, String filePath, String[] hearders, String[] fields) {
        this.wb = new SXSSFWorkbook(10000);
        this.fileName = fileName;
        this.filePath = filePath;
        this.hearders = hearders;
        this.fields = fields;
    }

    public static void main(String[] args) throws Exception {
        String[] header = {"姓名", "年龄"};
        String[] fileNames = {"name", "age"};
        ThreadExcelUtils utils = new ThreadExcelUtils("测试Excel1", "D:\\exceltext\\wer\\sd", header, fileNames);
        List list = new ArrayList<>();
        System.out.println("开始造数据.......");
        for (int i = 0; i < 900000; i++) {
            Student student = new Student();
            student.setName("name->" + i);
            student.setAge(i);
            list.add(student);
        }
        System.out.println(getDate(new Date()) + "开始写入文件.......");
        long startTime = System.currentTimeMillis();
        utils.exportExcelToFilePath(list);
        long endTime = System.currentTimeMillis();
        System.out.println("耗时：" + (endTime - startTime));
        //耗时：29230
        //耗时：25226

    }

    /**
     * @param list 数据
     * @Author maochuang.li
     * @Date Create in 10:52 2017/12/28 0028
     */
    public void exportExcelToFilePath(List<Object> list) throws Exception {
        int excelSize = EXCEL_MAX_CNT;    //每个Excel文件条数
        int totalCount = list.size();    //查询结果总条数
        int pageCount = 0;//总sheet页个数
        int numPage = totalCount % excelSize;    //是否整页数
        if (numPage > 0)
            pageCount = totalCount / excelSize + 1;
        else
            pageCount = totalCount / excelSize;
        //创建线程池 多sheet多线程写入 线程数 为sheet页的 1/4
        Integer threadNumber = pageCount / 4;
        if (threadNumber == 0)
            threadNumber = 1;
//        ExecutorService threadPool = Executors.newFixedThreadPool(threadNumber);
        ThreadPoolExecutor threadPool = new ThreadPoolExecutor(threadNumber, threadNumber, 0L, TimeUnit.SECONDS, new LinkedBlockingQueue<>(50));
        //创建栅栏 等待任务完成
        CountDownLatch countDownLatch = new CountDownLatch(pageCount);
        //循环遍历投递任务
        for (int i = 1; i <= pageCount; i++) {
            ThraedExcel thraedExcel = new ThraedExcel(list, i, pageCount, numPage, this);
            thraedExcel.setCountDownLatch(countDownLatch);
            threadPool.submit(thraedExcel);
        }
        countDownLatch.await(10L,TimeUnit.SECONDS);
        System.err.println("超时拉=====================================");
        Workbook wb = getWb();
        File file = new File(filePath);
        if (!file.exists() && !file.isDirectory()) {
            file.mkdirs();
        }
        FileOutputStream fout = new FileOutputStream(new File(file, fileName + ".xls"));
        try {
            wb.write(fout);
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("文件写入完成");
        //立即销毁线程池
        threadPool.shutdownNow();
    }


    private static String getDate(Date date) {
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        String format = simpleDateFormat.format(date);
        return format;
    }

    /**
     * JavaBean转Map
     *
     * @param obj
     * @return
     */
    public static Map<String, Object> beanToMap(Object obj) {
        Map<String, Object> params = new HashMap<String, Object>(0);
        try {
            PropertyUtilsBean propertyUtilsBean = new PropertyUtilsBean();
            PropertyDescriptor[] descriptors = propertyUtilsBean.getPropertyDescriptors(obj);
            int length = descriptors.length;
            for (int i = 0; i < length; i++) {
                String name = descriptors[i].getName();
                if (!StringUtils.equals(name, "class")) {
                    params.put(name, propertyUtilsBean.getNestedProperty(obj, name));
                }
            }
        } catch (Exception e) {
            System.err.println("bean 转Map出错");
            e.printStackTrace();
        }
        return params;
    }

    /***
     * 线程写入sheet
     */
    private static class ThraedExcel implements Runnable {

        private List<Object> list;//数据

        private Integer sheetNumber;//当前sheet页

        private Integer totalSheetCount;//总数据

        private int numPage;    //是否整页数

        private Integer excelSize;

        private ThreadExcelUtils threadExcelUtils;
        //栅栏对象
        private CountDownLatch countDownLatch;

        /**
         * @param list            总数据
         * @param sheetNumber     当前sheet页
         * @param totalSheetCount 总sheet页
         * @param numPage         是否整数
         * @Author maochuang.li
         * @Date Create in 11:12 2017/12/28 0028
         */
        public ThraedExcel(List<Object> list, Integer sheetNumber, Integer totalSheetCount, Integer numPage, ThreadExcelUtils threadExcelUtils) {
            this.list = list;//总数据
            this.sheetNumber = sheetNumber;//当前sheet页
            this.totalSheetCount = totalSheetCount;//总sheet页
            this.numPage = numPage;//是否整除
            this.excelSize = ThreadExcelUtils.EXCEL_MAX_CNT;//没个sheet最大数量
            this.threadExcelUtils = threadExcelUtils;//当前线程对象
        }

        public void setCountDownLatch(CountDownLatch countDownLatch) {
            this.countDownLatch = countDownLatch;
        }

        @Override
        public void run() {
            System.out.println("第"+sheetNumber+"个sheet开始");
            List<Object> sheetList = null;
            if (totalSheetCount > 1) {
                if (numPage == 0) {
                    sheetList = list.subList((sheetNumber - 1) * excelSize, excelSize * sheetNumber);
                } else {
                    if (sheetNumber == totalSheetCount) {
                        sheetList = list.subList((sheetNumber - 1) * excelSize, list.size());
                    } else {
                        sheetList = list.subList((sheetNumber - 1) * excelSize, excelSize * (sheetNumber));
                    }
                }
            } else
                sheetList = list;
            //开始写入数据
            createWorkBook(sheetList);
            if (this.countDownLatch != null)
                this.countDownLatch.countDown();
            System.out.println("第"+sheetNumber+"个sheet  结束");
        }

        /***
         * 写出数据
         */
        private void createWorkBook(List<Object> sheetList) {
            Sheet sheet = null;
            Row row = null;
            synchronized (ThreadExcelUtils.class) {
                String fileName = threadExcelUtils.getFileName();
                Workbook wb = threadExcelUtils.getWb();
                sheet = wb.createSheet(fileName + "_" + this.sheetNumber);
                row = sheet.createRow(0);
            }
            String[] header = threadExcelUtils.getHearders();
            String[] fields = threadExcelUtils.getFields();
            //设置标题
            for (int i = 0; i < header.length; i++) {
                row.createCell(i).setCellValue(header[i]);
            }
            //开始写入数据
            if (sheetList != null && sheetList.size() > 0) {
                int dataLength = sheetList.size();
                for (int i = 0; i < dataLength; i++) {
                    Row row1 = sheet.createRow(i + 1);
                    Object obj = sheetList.get(i);
                    Map<String, Object> map = (obj instanceof Map) ? (Map<String, Object>) obj : beanToMap(obj);
                    int length = fields.length;
                    for (int j = 0; j < length; j++) {
                        String key = fields[j];
                        Object value = map.get(key);
//                        if ((StringUtil.isNotBlank(value))) {
                        if (!(org.springframework.util.StringUtils.isEmpty(value))) {
                            //不晓得 此处为啥有线程安全问题
                            synchronized (ThreadExcelUtils.class) {
                                if (value instanceof Date) {
                                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                                    String format = sdf.format(value);
                                    row1.createCell(j).setCellValue(format);
                                } else {
                                    try {
                                        row1.createCell(j).setCellValue(value.toString());
                                    } catch (Exception e) {
                                        e.printStackTrace();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

```



### 5. 浏览器：多线程多sheet页下载

- 先引入依赖

```java
<!-- https://mvnrepository.com/artifact/org.apache.poi/poi-ooxml -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>3.9</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.apache.poi/poi-ooxml -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>3.9</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/commons-io/commons-io -->
        <dependency>
            <groupId>commons-io</groupId>
            <artifactId>commons-io</artifactId>
            <version>2.4</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/log4j/log4j -->
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>
```

- 创建下载工具类（我写的太low，可以自己优化）

```java
package com.zpj.electric.util;

import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFClientAnchor;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFPatriarch;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExcelUtil {

	private static Logger log = Logger.getLogger(ExcelUtil.class);

	private static SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
	private final static String EXCE_VERSION_03 = "03";
	private final static String EXCE_VERSION_07 = "07";

	/**
	 * @param resp
	 * @param fileName
	 *            文件名，一级表头
	 * @param useFirstTitle
	 *            是否需要一级表头，true：是，false：否
	 * @param version
	 *            导出版本，可选值为 07，统一用07版
	 * @param titles
	 *            excel列名
	 * @param data
	 *            需要导出的数据集合
	 */
	public static void exportExcel(HttpServletResponse resp, String fileName,
			boolean useFirstTitle, String version, String[] titles,
			List<Object[]> data) {
		// 如果传入的文件名为空，则使用当前时间作为文件名
		String excelFileName = "";
		if ("".equals(fileName) || fileName == null) {
			excelFileName = sdf.format(new Date());
		}
		// (data.size() >= 0) 当列表中没有数据时，导出的excel加上标题等。
		if (titles.length >= 0) {
			try {
				if (EXCE_VERSION_03.equals(version)) {
					excelFileName = fileName + ".xls";
				} else if (EXCE_VERSION_07.equals(version)) {
					excelFileName = fileName + ".xlsx";
				}

				resp.setContentType("application/x-msdownload");
				excelFileName = new String(excelFileName.getBytes("gb2312"), "iso8859-1");
				resp.addHeader("Content-Disposition", "attachment;filename="
						+ excelFileName);
				OutputStream out = resp.getOutputStream();
				if (EXCE_VERSION_03.equals(version)) {
					exprotExcel_03(fileName, titles, useFirstTitle, data, out);
				} else if (EXCE_VERSION_07.equals(version)) {
					exprotExcel_07_plus(excelFileName, titles, useFirstTitle, data, out);
				}
			} catch (Exception e) {
				log.error("", e);
			}
		}
	}

	private static void exprotExcel_07_plus(String fileName, String[] titles,
			boolean useFirstTitle, List<Object[]> data, OutputStream out) {
		XSSFWorkbook wb = new XSSFWorkbook();

		//把要下载的数据分为多个sheet下载
		List<List<Object[]>> dataList = createList(data, 50000);
		Long start = System.currentTimeMillis();
		System.out.println("下载开始时间：" + start);

		//使用多线程下载
		ExecutorService es = Executors.newFixedThreadPool(dataList.size());
		//使用计步器
		// final CountDownLatch doneSignal = new CountDownLatch(dataList.size());
		CountDownLatch doneSignal = new CountDownLatch(dataList.size());

		try {

		for(int x = 0;x<dataList.size();x++){
			PoiWriter poiWriter = new PoiWriter(x, wb, fileName, titles, data, dataList, useFirstTitle, doneSignal);
			Future future = es.submit(poiWriter);
			 /*try {
				 	//如果Future.get()返回null，任务完成
		            if(future.get()==null){
		                System.out.println("第"+(x+1)+"个sheet页，任务完成");
		            }
		        } catch (InterruptedException e) {
		        } catch (ExecutionException e) {
		            //失败
		            System.out.println("第"+(x+1)+"个sheet页，任务失败："+e.getCause().getMessage());
		        }*/
			//new PoiWriter(x, wb, fileName, titles, data, dataList, useFirstTitle, null).run();
		}
		doneSignal.await();//阻塞，直到计数器的值为0，才让主线程往下执行
	    es.shutdown();//关闭线程池
		Long end = System.currentTimeMillis();
		System.out.println("总计下载时间：" + ((end-start)/1000) + "s");
			wb.write(out);
			out.flush();
			out.close();
		} catch (Exception e) {
			log.error("", e);
		} finally {
			IOUtils.closeQuietly(out);
		}

	}


	 public static List<List<Object[]>>  createList(List<Object[]> targe,int size) {
		        List<List<Object[]>> listArr = new ArrayList<List<Object[]>>();
		        //获取被拆分的数组个数
		        int arrSize = targe.size()%size==0?targe.size()/size:targe.size()/size+1;
		        for(int i=0;i<arrSize;i++) {
		            List<Object[]>  sub = new ArrayList<Object[]>();
		            //把指定索引数据放入到list中
		            for(int j=i*size;j<=size*(i+1)-1;j++) {
		                if(j<=targe.size()-1) {
		                	//得到拆分后的集合
		                    sub.add(targe.get(j));
		                }
		            }
		            //拆分的集合可以做点什么
		            //sub.dosomething();
		            //将拆分后的集合综合为一个集合
		            listArr.add(sub);
		        }
		        return listArr;
	 }

}
```

- 线程类

```java
package com.zpj.electric.util;

import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PoiWriter implements Runnable {

	public int x;//第几个sheet页
	public XSSFWorkbook wb;//poi Workbook
	public String fileName;//要导出的文件名字(含后缀)
	public String[] titles;//标题
	public List<Object[]> data;//全部数据
	public List<List<Object[]>> dataList;//包含了各个sheet页的数据
	public boolean useFirstTitle;//是否需要表头
	public  CountDownLatch doneSignal;//多线程栅栏计步器


	public PoiWriter(int x, XSSFWorkbook wb, String fileName, String[] titles,
			List<Object[]> data, List<List<Object[]>> dataList,
			boolean useFirstTitle, CountDownLatch doneSignal) {
		super();
		this.x = x;
		this.wb = wb;
		this.fileName = fileName;
		this.titles = titles;
		this.data = data;
		this.dataList = dataList;
		this.useFirstTitle = useFirstTitle;
		this.doneSignal = doneSignal;
	}

	public PoiWriter() {

	}

	@Override
	public void run() {
		Long start1 = System.currentTimeMillis();
		System.out.println(fileName+"：第"+(x+1)+"个sheet开始时间：" + start1);
		// 创建一sheet页
		XSSFSheet sheet = wb.createSheet("sheet"+x);
		// 设置格式 在单元格中右排放
		XSSFCellStyle style = wb.createCellStyle();
		style.setAlignment(XSSFCellStyle.ALIGN_RIGHT);

		int firstRow = 0;
		if (useFirstTitle) {
			XSSFRow fr = sheet.createRow(firstRow);
			XSSFFont font = wb.createFont();
			font.setFontName("宋体");
			font.setFontHeightInPoints((short) 16);
			XSSFCellStyle cs = wb.createCellStyle();
			cs.setAlignment(XSSFCellStyle.ALIGN_CENTER);
			cs.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
			cs.setFont(font);
			fr.setHeight((short) 700);
			fr.setHeight((short) 700);
			//excel大标题和并列多了一列，当列表中数据为空时，导出的excel中加上标题等信息
			sheet.addMergedRegion(new CellRangeAddress(0, 0, 0,
					titles.length-1));
			for (int i = 0; i < titles.length; i++) {
				fr.createCell(i);
			}
			/**
			 * 自适应宽度
			 */
			if(null!=data&&data.size()>0){
				Object[] obj=data.get(0);
				if(obj.length==titles.length){
					for(int i=0;i<titles.length;i++)
					{
						int contentLength=titles[i].length();
						if(null!=obj[i]&&obj[i].toString().length()>titles[i].length()){
							contentLength=obj[i].toString().length();
						}
						if(i==0)
						{
							//The maximum column width for an individual cell is 255 characters. 的解决方案
							if((short)50*(50+contentLength)/256>255){
								sheet.setColumnWidth(i, (short)254*256);  //初始列宽+自适应宽度
							}else{
								sheet.setColumnWidth(i, (short)50*(50+contentLength));  //初始列宽+自适应宽度
							}
						}else{
							//The maximum column width for an individual cell is 255 characters. 的解决方案
							if((short)100*(55+contentLength)/256>255){
								sheet.setColumnWidth(i, (short)254*256);  //初始列宽+自适应宽度
							}else{
								sheet.setColumnWidth(i, (short)100*(55+contentLength));  //初始列宽+自适应宽度
							}
						}
					}
				}else{
					for(int i=0;i<titles.length;i++)
					{
						int contentLength=titles[i].length();
						if(i==0)
						{
							sheet.setColumnWidth(i, (short)50*(50+contentLength));  //初始列宽+自适应宽度
						}else{
							sheet.setColumnWidth(i, (short)100*(55+contentLength));  //初始列宽+自适应宽度
						}
					}

				}

			}

			//创建新的样式给列表的大标题加上背景色
			 XSSFCellStyle alignStyle = (XSSFCellStyle)wb.createCellStyle();
			 alignStyle.setAlignment(XSSFCellStyle.ALIGN_CENTER);
			 alignStyle.setVerticalAlignment(XSSFCellStyle.VERTICAL_CENTER);
			 alignStyle.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
			 alignStyle.setFillForegroundColor(IndexedColors.SKY_BLUE.getIndex());
			 alignStyle.setFont(font);
			fr.getCell(0).setCellValue(new XSSFRichTextString(fileName));
			fr.getCell(0).setCellStyle(alignStyle);
			firstRow += 1;
		}

		XSSFRow row = sheet.createRow(firstRow);
		for (int i = 0; i < titles.length; i++) {
			row.createCell(i).setCellValue(new XSSFRichTextString(titles[i]));
		}


			for (int i = 0; i < dataList.get(x).size(); i++) {
				XSSFRow r = sheet.createRow(i + firstRow + 1);
				Object[] obj = dataList.get(x).get(i);
				for (int j = 0; j < obj.length; j++) {
					// 创建单元格
					XSSFCell cell = r.createCell(j);
					Object value = obj[j];
					// 判断值的类型后进行强制类型转换
					String textValue = null;
					if (value instanceof Date) {
						Date date = (Date) value;
						SimpleDateFormat sdf = new SimpleDateFormat(
								"yy-MM-dd HH:mm:ss");
						textValue = sdf.format(date);
					} else if (value instanceof byte[]) {
						// 有图片时，设置行高为60px;

					} else {
						if (value == null) {
							// 如果值为空，什么都不做
						} else {
							// 其它数据类型都当作字符串简单处理
							textValue = value.toString();
						}
					}
					// 如果不是图片数据，就利用正则表达式判断textValue是否全部由数字组成
					if (textValue != null) {
						Pattern p = Pattern.compile("^//d+(//.//d+)?$");
						Matcher matcher = p.matcher(textValue);
						if (matcher.matches()) {
							// 是数字当作double处理
							cell.setCellValue(Double.parseDouble(textValue));
						} else {
							XSSFRichTextString richString = new XSSFRichTextString(
									textValue);
							cell.setCellValue(richString);
						}
					} else {// 若果是空值，单元格显示为空
						cell.setCellValue(new XSSFRichTextString(""));
					}
				}
			}

			Long end1 = System.currentTimeMillis();
			System.out.println("第"+(x+1)+"个sheet总计时间：" +((end1-start1)/1000) + "s");
			if(doneSignal!=null){
				doneSignal.countDown(); // 线程计数-1
				System.out.println("第" + (x+1) + "个sheet创建完成，" + "计数器减1");
			}
	}

}
```

