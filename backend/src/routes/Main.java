import java.util.*;

public class Main {

    static int minMoves(int M, int N, int[][] grid, int[] src, int[] dest, int[] moveRule) {
        int a = moveRule[0];
        int b = moveRule[1];

        // Movement based on rotations of (a, b)
        int[][] moves = {
            {a, b},     // forward
            {b, -a},    // right
            {-b, a},    // left
            {-a, -b}    // backward
        };

        boolean[][] visited = new boolean[M][N];
        Queue<int[]> q = new LinkedList<>();

        // Start BFS
        q.offer(new int[]{src[0], src[1], 0});
        visited[src[0]][src[1]] = true;

        while (!q.isEmpty()) {
            int[] curr = q.poll();
            int x = curr[0], y = curr[1], dist = curr[2];

            // Destination check
            if (x == dest[0] && y == dest[1]) {
                return dist;
            }

            // Try all moves
            for (int[] mv : moves) {
                int nx = x + mv[0];
                int ny = y + mv[1];

                if (nx >= 0 && nx < M && ny >= 0 && ny < N &&
                    !visited[nx][ny] && grid[nx][ny] == 0) {
                    visited[nx][ny] = true;
                    q.offer(new int[]{nx, ny, dist + 1});
                }
            }
        }

        return -1; // no path found
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int M = sc.nextInt();
        int N = sc.nextInt();
        int[][] grid = new int[M][N];

        for (int i = 0; i < M; i++) {
            for (int j = 0; j < N; j++) {
                grid[i][j] = sc.nextInt();
            }
        }

        int[] src = {sc.nextInt(), sc.nextInt()};
        int[] dest = {sc.nextInt(), sc.nextInt()};
        int[] moveRule = {sc.nextInt(), sc.nextInt()};

        System.out.println(minMoves(M, N, grid, src, dest, moveRule));
    }
}
