public class TestThreadLocal {
    ThreadLocal<Long> longLocal = new ThreadLocal<Long>();
    ThreadLocal<String> stringLocal = new ThreadLocal<String>(){
        //不用先set，设置默认值
        protected String initialValue() {
            return Thread.currentThread().getName();
        };
    };
 
    public void set() {
        longLocal.set(Thread.currentThread().getId());
        // stringLocal.set(Thread.currentThread().getName());
    }
     
    public long getLong() {
        return longLocal.get();
    }
     
    public String getString() {
        return stringLocal.get();
    }
     
    public static void main(String[] args) throws InterruptedException {
        final TestThreadLocal test = new TestThreadLocal();
         
        test.set();
        //当前线程
        System.out.println("当前线程：  " + test.getLong());
        System.out.println("当前线程：  " + test.getString());
 
        Thread thread1 = new Thread(){
            public void run() {
                test.set();
                //其它线程
                System.out.println("新线程：  " + test.getLong());
                System.out.println("新线程：  " + test.getString());
            };
        };
        thread1.start();
        thread1.join();
         
        //当前线程
        System.out.println("当前线程：  " + test.getLong());
        System.out.println("当前线程：  " + test.getString());
    }
}