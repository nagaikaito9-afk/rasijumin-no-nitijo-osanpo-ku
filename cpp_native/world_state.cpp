/**
 * world_state.cpp - C++ World Grid & House Manager
 */

#include <vector>
#include <string>

namespace NativeSim {

struct HouseData {
    std::string id;
    std::string name;
    int x;
    int y;
    int w;
    int h;
    std::string status; // "normal", "under_construction"
};

class WorldState {
private:
    int cols;
    int rows;
    std::vector<HouseData> houses;

public:
    WorldState(int c = 54, int r = 38) : cols(c), rows(r) {}

    void addHouse(const HouseData& h) {
        houses.push_back(h);
    }
};

} // namespace NativeSim
