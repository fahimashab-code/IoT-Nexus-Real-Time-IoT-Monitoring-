# Understanding the DC motor in lesson 01

This lesson rebuilds the electrical and mechanical concepts needed for the IoT Nexus motor project. We apply a fixed voltage to a simulated motor, watch it start, and then add an opposing mechanical load. The first task is to explain the resulting current and speed before designing a controller.

All results in this stage are simulations using assumed parameters. They are suitable for studying the model and evaluating our implementation. They do not establish the performance of a particular physical motor.

## The quantities we will monitor

| Quantity | Symbol | Unit | Meaning here |
|---|---|---|---|
| Applied voltage | V | volt, V | The electrical potential difference across the motor terminals |
| Armature current | i | ampere, A | The rate of electric charge flow through the motor winding |
| Motor torque | Tm | newton metre, N m | The turning effort produced by the motor |
| Angular speed | omega | radian per second, rad/s | How quickly the shaft rotates |
| Displayed speed | n | revolution per minute, RPM | The same speed expressed in a familiar unit |
| External load torque | TL | N m | The turning effort opposing rotation in this experiment |
| Back EMF | e | V | A voltage generated as the motor turns, opposing the applied voltage |

Voltage is not current. Applying 6 V does not mean the motor draws 6 A. The current depends on the winding, its inductance, the shaft speed and the load. A torque of 1 N m could be produced by a tangential force of 1 N acting at a radius of 1 m. Torque describes turning effort; speed describes motion.

RPM and rad/s describe the same motion. One revolution is 2 pi radians, so `RPM = omega * 60 / (2*pi)`. For example, 100 rad/s is about 955 RPM.

## Follow what happens when power is applied

Initially the motor is stationary and its current is zero. Voltage causes current to build through the winding. The winding's inductance prevents that current from jumping instantaneously. Current interacting with the magnetic field creates torque, and the shaft accelerates.

As the shaft turns faster, it generates a larger back EMF. That leaves less voltage available to drive current through the winding, so the starting current falls. The motor settles when its torque balances friction and the external load. Even with no external load, our model needs some current to overcome viscous friction.

When we add an opposing load, the motor initially has less net accelerating torque and slows. Its back EMF falls, current rises, and the motor develops more torque. With the voltage fixed, it settles at a lower speed. An automatic speed controller will later adjust the applied voltage to reduce that speed change.

These relationships are the reason to monitor speed and current together. A rise in current by itself does not identify a fault. A normal increase in mechanical load can also produce it.

## The electrical equation

Kirchhoff's voltage law accounts for the voltage across the winding resistance, winding inductance and back EMF:

```text
V = R*i + L*(di/dt) + Ke*omega
```

For the simulation we rearrange it:

```text
di/dt = (V - R*i - Ke*omega) / L
```

`R*i` is the winding's resistive voltage drop. `Ke*omega` is the back EMF. `di/dt` means how quickly current changes. The model calculates that rate, then an **Integrator** accumulates it over time to obtain current.

At steady state, current stops changing and the inductive term is zero. During startup it matters. At an ideal locked shaft, speed and back EMF are zero; after the electrical transient, current tends toward `V/R`. In a real motor, prolonged stall can cause overheating. Lesson 01 does not simulate temperature or a stall event.

## The mechanical equation

The motor torque is proportional to current in this simplified permanent-magnet motor:

```text
Tm = Kt*i
J*(domega/dt) = Kt*i - b*omega - TL
```

`J` is rotational inertia: resistance to a change in rotational motion. `b*omega` is the model's viscous friction torque. `TL` is the applied opposing load torque. The remaining torque accelerates or decelerates the shaft. A second Integrator turns angular acceleration into speed.

The torque constant `Kt` and back-EMF constant `Ke` have equal numerical values for this ideal conversion model when the stated SI units are used. This is not a rule that all motor constants written in different datasheet units have equal numerical values.

## Parameters for our first experiment

These values are teaching assumptions, not purchased components or measured motor specifications. The file `lesson01_parameters.m` is the source of truth.

| Parameter | Assumed value | Unit |
|---|---:|---|
| Applied voltage | 6 | V |
| Winding resistance R | 2 | ohm |
| Winding inductance L | 0.002 | H |
| Torque constant Kt | 0.02 | N m/A |
| Back-EMF constant Ke | 0.02 | V/(rad/s) |
| Rotor inertia J | 0.00002 | kg m^2 |
| Viscous friction b | 0.00002 | N m/(rad/s) |
| Added opposing torque | 0.01 | N m |
| Voltage application time | 0.05 | s |
| Load application time | 1 | s |
| Simulation stop time | 2 | s |
| Fixed solver step | 0.00002 | s |
| Log interval | 0.0001 | s |

The solver step is a numerical setting, not the sampling rate of a physical sensor or ESP32 controller. We use a short step because the electrical current can change much faster than the shaft speed. Recorded samples are saved every 0.0001 s; the solver performs smaller internal steps between them.

## Predict the answer before running

At equilibrium the rates of change are zero. Combining the two equations gives:

```text
omega_ss = (V - R*TL/Kt) / (Ke + R*b/Kt)
i_ss = (b*omega_ss + TL) / Kt
```

With no external load, the predicted speed is about **2604.35 RPM** and current is **0.27273 A**. With a 0.01 N m opposing load, the predicted speed is about **2170.29 RPM** and current is **0.72727 A**. These are calculated expectations, not recorded results. See the run's `RESULTS.md` and `summary.json` for measured simulation outputs.

The expected speed decrease is about 16.67 percent. We have not told the motor to regulate speed: we have supplied a fixed voltage. That is why this experiment is described as **open loop**. The internal back-EMF relationship is part of motor physics; it is not an added speed controller.

## Run and inspect the model

In MATLAB, enter:

```matlab
cd('E:\IoT Website\websites\iot-dashboard\simulation\matlab')
runFolder = run_lesson01;
```

Read the four plots in this order: applied voltage, speed, current, torque. Find 0.05 s, when the voltage is applied, and 1 s, when the loaded run receives extra opposing torque. Compare the baseline and loaded traces rather than judging a single trace without a reference.

The script saves a new editable `.slx` model, two CSV files with units in the column names, a comparison plot and a JSON report. It also repeats the loaded case with half the solver step. Check `all_checks_passed` in the report before using a run as portfolio evidence.

For the first run, keep the defaults. For a later experiment, change only `voltage_V` to 4 in `lesson01_parameters.m`, run again, and predict the effect before looking at the plots. Restore the default before trying a different parameter. Earlier run folders are preserved.

### Our first recorded result

The reviewed MATLAB run produced about **2604.35 RPM at 0.27273 A** with no external load and **2170.31 RPM at 0.72726 A** after adding the load. It passes all six checks. Read the [recorded results](../../simulation/matlab/evidence/lesson01/RESULTS.md) alongside the predictions above.

![Recorded current, speed, voltage and torque](../../simulation/matlab/evidence/lesson01/lesson01_results.png)

## Interpret power carefully

Electrical input power is `V*i`. Winding heating loss is `R*i^2`. Mechanical power delivered to the external load is `TL*omega`. Mechanical power also goes into friction and changing stored rotational energy; electrical energy can also be stored in the winding's inductance during transients. Consequently, input power and load power need not match.

The model calculates winding loss in watts. It does not calculate a temperature: that would require a thermal model, heat capacity, heat transfer assumptions and an ambient temperature. This lesson also has no vibration model, sensor noise, PWM switching or trained fault detector.

## Record what you learned

Add your observations to the learning journal in your own words. Useful questions are:

1. Why does current rise during startup and fall as speed increases?
2. Why does extra shaft load increase current while reducing speed?
3. How does a resistor's `V = R*i` relationship differ from the complete motor equation?
4. What does comparing the simulation with an equilibrium calculation verify, and what does it leave unverified?

Keep the model, parameters and recorded evidence with the explanation. For a portfolio, describe the model assumptions, what changed between cases, how the output was checked and what you would improve next. Do not claim hardware validation or a working fault detector at this stage.

## References

- [MathWorks DC Motor block](https://www.mathworks.com/help/simscape-electrical/ref/dcmotor.html): equivalent circuit, back EMF and torque relationships. Our lesson implements its own simplified equations with standard blocks.
- [MathWorks DC Motor Control example](https://www.mathworks.com/help/control/ug/dc-motor-control.html): modelling a motor and investigating load disturbances. Our numerical parameters and experiments are our own teaching assumptions.
- [MathWorks To Workspace block](https://www.mathworks.com/help/simulink/slref/toworkspace.html): the logging mechanism used by this lesson.
