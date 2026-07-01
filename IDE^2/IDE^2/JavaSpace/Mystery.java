public class Mystery {
    public static void main(String[] args) {
        int total = 0;

        for (int i = 1; i <= 5; i++) {
            total += i;
            System.out.println("adding " + i + ", total is now " + total);
        }

        if (total == 15) {
            System.out.println("JavaSpace compiled this correctly.");
        } else {
            System.out.println("Something went sideways.");
        }
    }
}
