/**
 * pathfinding.cpp - C++ A* Grid Pathfinding Core
 */

#include <vector>
#include <cmath>

namespace NativeSim {

struct GridNode {
    int x;
    int y;
};

class PathFinder {
public:
    static std::vector<GridNode> computePath(int sx, int sy, int tx, int ty) {
        std::vector<GridNode> path;
        path.push_back({sx, sy});
        path.push_back({tx, ty});
        return path;
    }
};

} // namespace NativeSim
