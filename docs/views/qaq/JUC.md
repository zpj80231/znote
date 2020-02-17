## JUC

### 简介

- 自JDK1.5出现的，JUC（Java并发包）就是java.util .concurrent工具包的简称。
- 所属位置：jre1.8.0/lib/rj.jar，在jvm中rj.jar由👉bootsrap.classloader加载器通过双亲委派机制加载到内存。

### volatile关键字

- Java中各线程变量都是私有的，为保证多线程共享数据，常用volatile关键字修饰数据以保证共享数据在内存中的可见性。

- 各线程数据都是从主内存中copy过来的，某一线程修改完数据之后再回写到主内存中去，加volatile就相当于一旦有一个线程修改完数据的**同时**主内存数据也修改**同时**通知其它线程这个数据已被修改其它线程停止对这个数据的所有操作（加volatile可以理解为直接操作主内存）

  ```java
  public class TestVolatile {
      public static void main(String[] args){ //这个线程是用来读取flag的值的
          ThreadDemo threadDemo = new ThreadDemo();
          Thread thread = new Thread(threadDemo);
          thread.start();
          while (true){
              if (threadDemo.isFlag()){
                  System.out.println("主线程读取到的flag = " + threadDemo.isFlag());
                  break;
              }
          }
      }
  }
  
  @Data
  class ThreadDemo implements Runnable{ //这个线程是用来修改flag的值的
      public  boolean flag = false;
      
      //加volatile保证flag在主线程的可见性
      //public  volatile boolean flag = false;
      
      @Override
      public void run() {
          try {
              Thread.sleep(200);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
          flag = true;
          System.out.println("ThreadDemo线程修改后的flag = " + isFlag());
      }
  }
  ```

- volatile和synchronized的区别：

  volatile禁止指令重排序。
  volatile不具备互斥性(当一个线程持有锁时，其他线程进不来，这就是互斥性)。
  volatile保证可见性但是不具备原子性(保证原子性：1.加锁、2.使用volatile保证可见，使用CAS原子类保证原子性)。

### CAS原子类

- CAS：CompareAndSet，CAS涉及3个元素:内存地址、期盼值和目标值，只有内存地址对应的值和期望的值相同时,才把内存地址对应的值修改为目标值。

