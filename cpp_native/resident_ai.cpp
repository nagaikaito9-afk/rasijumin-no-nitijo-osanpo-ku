/**
 * resident_ai.cpp - C++ Resident State Machine & Need Decay Math
 */

#include <string>
#include <algorithm>

namespace NativeSim {

struct ResidentState {
    int id;
    std::string name;
    float hunger;
    float energy;
    float happiness;
    float social;
    bool isSleeping;

    ResidentState(int rId, std::string rName)
        : id(rId), name(rName), hunger(80.0f), energy(90.0f), happiness(85.0f), social(70.0f), isSleeping(false) {}

    void decayNeeds(float rateMultiplier) {
        hunger = std::max(0.0f, hunger - 0.012f * rateMultiplier);
        energy = std::max(0.0f, isSleeping ? energy + 0.14f * rateMultiplier : energy - 0.01f * rateMultiplier);
        social = std::max(0.0f, social - 0.008f * rateMultiplier);
    }
};

} // namespace NativeSim
