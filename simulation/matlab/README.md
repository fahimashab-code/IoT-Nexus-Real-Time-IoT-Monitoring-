# MATLAB motor laboratory

Start with [Motor basics and lesson 01](../../docs/matlab/01-motor-basics.md). Keep the [learning journal](../../docs/matlab/learning-journal.md) beside the model while working.

## Run the first lesson

Open desktop MATLAB and paste:

```matlab
cd('E:\IoT Website\websites\iot-dashboard\simulation\matlab')
runFolder = run_lesson01;
```

The path above is this project's current Windows location. If you clone the repository elsewhere, change it to your clone's `simulation/matlab` folder.

The command builds an editable model, runs a no-load baseline and a load-change experiment, checks the results, and opens the model and comparison plots. It creates a new timestamped folder on each run, preserving earlier recordings. An additional run with half the solver step checks numerical sensitivity.

Requirements: installed and usable MATLAB and Simulink. Lesson 01 uses standard Simulink blocks; it does not require Simscape or Control System Toolbox. Simscape Electrical is available in the user's reported installation and is a planned later comparison, not yet verified by this model.

## Files

- `lesson01_parameters.m`: the assumed motor and experiment settings.
- `build_lesson01_motor.m`: translates two differential equations into connected blocks and saves the model.
- `run_lesson01.m`: runs experiments, exports records, produces the plot and performs checks.
- `results/lesson01_*/`: saved model, two CSV recordings, plot, summary and validation report.

Each CSV contains time in seconds, applied voltage, current, speed in rad/s and RPM, motor torque, external load torque, back EMF, electrical input power, winding loss and power delivered to the external load. These are values calculated from the model, not physical sensor measurements.

The generated `results/` folder, full workspace recordings and cache files are excluded from Git. The selected recording in [evidence/lesson01](evidence/lesson01/RESULTS.md) contains the CSV files, model, plots and summary for GitHub. Copy a reviewed run to a new evidence folder when you deliberately want to publish it; keep unrelated generated runs local.

## Reproduce a run

The runner records its parameters, MATLAB release, solver settings, checks and summaries in `summary.json`. Default lesson parameters are assumptions selected for teaching, not a motor datasheet. The generated model uses numeric parameters and can run without variables in the base workspace.

The two main cases differ only in external load torque. Both receive 6 V at 0.05 s. In the loaded case an opposing torque of 0.01 N m is applied at 1 s. Both stop at 2 s. Means over the final 0.1 s are compared with algebraic steady-state predictions, with a maximum relative error of 0.5 percent for speed and current. A numerical refinement check compares trajectories outside switching-event windows.

Before editing a saved model, use **Save As** to keep a separate copy. The runner regenerates a fresh model from source on every run; edits made only in a generated model do not change the builder.

## Present scope

This is an open-loop, linear permanent-magnet DC motor model. It includes resistance, inductance, back EMF, electromagnetic torque, inertia and viscous friction. There is no automatic speed controller in lesson 01. A constant applied voltage does not maintain a constant speed under a changing load.

PWM switching, driver losses, current limiting, encoder quantization, thermal dynamics, vibration, hardware faults and learned fault detection are later work. Winding loss in watts does not establish a temperature in degrees. The Nexus website continues to use its separate illustrative demo; these CSV files are not imported into it yet.
