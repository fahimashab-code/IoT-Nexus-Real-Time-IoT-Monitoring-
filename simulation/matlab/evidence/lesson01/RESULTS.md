# Lesson 01 recorded results

Evidence: MATLAB/Simulink simulation with assumed motor parameters.

Release: 2026b. Solver: ode4. Step: 0.0000200 s.

| Final 0.1 s mean | No external load | Load applied |
|---|---:|---:|
| Speed (RPM) | 2604.3536 | 2170.3066 |
| Current (A) | 0.272727 | 0.727260 |
| Winding loss (W) | 0.148760 | 1.057815 |

Analytical speed predictions: 2604.3536 / 2170.2947 RPM.

Analytical current predictions: 0.272727 / 0.727273 A.

Speed decreases 16.666 percent under the applied load.

All automated checks passed: 1. See summary.json for individual checks.

The solver refinement comparison excludes 20 ms around switching events.
Maximum remaining differences: 0.03901710 RPM and 0.00004132 A.

Temperature and vibration are not modeled. Winding loss is not a temperature measurement.
These files are separate from the Nexus browser demonstration; no website import exists yet.
