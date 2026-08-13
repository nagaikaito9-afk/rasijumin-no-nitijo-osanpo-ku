/**
 * sim_engine.cpp - C++ Native Core Simulation Engine
 * Manages high-performance simulation ticks, resident state updates, and global events.
 */

#include <iostream>
#include <vector>
#include <cmath>
#include <string>

namespace NativeSim {

class SimulationEngine {
private:
    uint64_t tickCount;
    float timeInMinutes;
    int residentCount;

public:
    SimulationEngine() : tickCount(0), timeInMinutes(360.0f), residentCount(10) {}

    void initSimulation(int totalResidents) {
        residentCount = totalResidents;
        tickCount = 0;
        timeInMinutes = 360.0f; // Start at 06:00 AM
    }

    void updateTick(float deltaTimeSec) {
        tickCount++;
        timeInMinutes += deltaTimeSec;
        if (timeInMinutes >= 1440.0f) {
            timeInMinutes -= 1440.0f;
        }
    }

    uint64_t getTickCount() const { return tickCount; }
    float getTimeInMinutes() const { return timeInMinutes; }
    int getResidentCount() const { return residentCount; }
};

} // namespace NativeSim
