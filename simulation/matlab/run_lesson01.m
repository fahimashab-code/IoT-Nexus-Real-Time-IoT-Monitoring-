function runFolder = run_lesson01(outputRoot, showWindows)
%RUN_LESSON01 Build, run, check and record the first motor experiment.
% In MATLAB: cd to this folder, then type run_lesson01
% Every run gets a new folder; existing recordings and models are preserved.
sourceFolder = fileparts(mfilename('fullpath'));
if nargin < 1 || isempty(outputRoot)
    outputRoot = fullfile(sourceFolder, 'results');
end
if nargin < 2
    showWindows = true;
end
p = lesson01_parameters();
assert(all([p.resistance_ohm, p.inductance_H, p.torqueConstant_Nm_per_A, ...
    p.backEmfConstant_V_per_rad_s, p.inertia_kg_m2, p.solverStep_s, p.logInterval_s] > 0), ...
    'Nexus:InvalidParameters', 'Motor constants and time steps must be positive.');
assert(p.voltageOn_s >= 0 && p.loadStep_s > p.voltageOn_s && p.stopTime_s > p.loadStep_s + 0.2, ...
    'Nexus:InvalidTiming', 'The load must follow startup and leave time for final measurements.');
stamp = char(datetime('now', 'Format', 'yyyyMMdd_HHmmss_SSS'));
runFolder = fullfile(outputRoot, ['lesson01_' stamp]);
assert(~isfolder(runFolder), 'Nexus:RunExists', 'Run folder already exists.');
mkdir(runFolder);
modelName = ['nexus_l01_' stamp];
modelPath = fullfile(runFolder, [modelName '.slx']);
build_lesson01_motor(modelName, modelPath, p);
cleanup = onCleanup(@() closeIfHidden(modelName, showWindows));

fprintf('Running no-load baseline...\n');
baselineInput = Simulink.SimulationInput(modelName);
baselineInput = baselineInput.setBlockParameter([modelName '/Load_torque'], 'After', '0');
baselineOutput = sim(baselineInput);
baseline = measurements(baselineOutput, p);

fprintf('Running the same motor with an opposing load at %.1f s...\n', p.loadStep_s);
loadedOutput = sim(modelName);
loaded = measurements(loadedOutput, p);

fprintf('Checking the loaded run with half the solver step...\n');
fineInput = Simulink.SimulationInput(modelName);
fineInput = fineInput.setModelParameter('FixedStep', num2str(p.solverStep_s/2, 17));
fineOutput = sim(fineInput);
fine = measurements(fineOutput, p);

baselineMetrics = summarize(baseline, p, 0);
loadedMetrics = summarize(loaded, p, p.loadTorque_Nm);
% Exclude the discontinuities when comparing continuous trajectories.
comparisonMask = loaded.time_s > p.voltageOn_s + 0.02 & ...
    abs(loaded.time_s - p.loadStep_s) > 0.02;
fineRpm = interp1(fine.time_s, fine.speed_rpm, loaded.time_s);
fineCurrent = interp1(fine.time_s, fine.current_A, loaded.time_s);
rpmDifference = max(abs(loaded.speed_rpm(comparisonMask) - fineRpm(comparisonMask)));
currentDifference = max(abs(loaded.current_A(comparisonMask) - fineCurrent(comparisonMask)));
checks = struct();
checks.finite_signals = all(isfinite(baseline{:,:}), 'all') && all(isfinite(loaded{:,:}), 'all');
checks.baseline_matches_equilibrium = baselineMetrics.speed_error_percent < 0.5 && ...
    baselineMetrics.current_error_percent < 0.5;
checks.loaded_matches_equilibrium = loadedMetrics.speed_error_percent < 0.5 && ...
    loadedMetrics.current_error_percent < 0.5;
checks.load_reduces_speed = loadedMetrics.steady_speed_rpm < baselineMetrics.steady_speed_rpm;
checks.load_increases_current = loadedMetrics.steady_current_A > baselineMetrics.steady_current_A;
checks.solver_refinement = rpmDifference < 0.1 && currentDifference < 0.001;
passed = all(structfun(@(v) logical(v), checks));
report = struct('lesson', '01', 'evidence', 'MATLAB Simulink simulation only', ...
    'model_type', 'Assumed linear permanent-magnet DC motor', ...
    'created_local', char(datetime('now', 'TimeZone', 'local', 'Format', 'yyyy-MM-dd HH:mm:ss XXX')), ...
    'matlab_release', version('-release'), 'solver', 'ode4', 'parameters', p, ...
    'baseline', baselineMetrics, 'loaded', loadedMetrics, 'checks', checks, ...
    'max_refinement_speed_difference_rpm', rpmDifference, ...
    'max_refinement_current_difference_A', currentDifference, 'all_checks_passed', passed);

writetable(baseline, fullfile(runFolder, 'baseline_no_load.csv'));
writetable(loaded, fullfile(runFolder, 'load_step.csv'));
save(fullfile(runFolder, 'raw_simulation.mat'), 'baselineOutput', 'loadedOutput', 'p', 'report');
writeText(fullfile(runFolder, 'summary.json'), jsonencode(report, PrettyPrint=true));
fig = makePlot(baseline, loaded, p, showWindows);
exportgraphics(fig, fullfile(runFolder, 'lesson01_results.png'), 'Resolution', 180);
print(['-s' modelName], '-dpng', '-r150', fullfile(runFolder, 'lesson01_model.png'));
if ~showWindows
    close(fig);
end
writeText(fullfile(runFolder, 'RESULTS.md'), resultText(report));
fprintf('\nNo load: %.2f RPM, %.4f A\n', baselineMetrics.steady_speed_rpm, baselineMetrics.steady_current_A);
fprintf('Loaded:  %.2f RPM, %.4f A\n', loadedMetrics.steady_speed_rpm, loadedMetrics.steady_current_A);
fprintf('Saved model, CSV, plot and report to:\n%s\n', runFolder);
assert(passed, 'Nexus:ValidationFailed', 'A validation check failed. Inspect summary.json before using the results.');
writeText(fullfile(outputRoot, 'latest_lesson01.txt'), runFolder);
fprintf('SUCCESS: all lesson 01 checks passed.\n');
if showWindows
    open_system(modelName);
end
end

function data = measurements(output, p)
current = output.get('motor_current');
speed = output.get('motor_speed');
voltage = output.get('motor_voltage');
load = output.get('motor_load');
time = current.Time(:);
i = current.Data(:);
omega = speed.Data(:);
v = voltage.Data(:);
loadTorque = load.Data(:);
assert(isequal(time, speed.Time(:), voltage.Time(:), load.Time(:)), ...
    'Nexus:TimeMismatch', 'Logged signals do not share the same time axis.');
data = table(time, v, i, omega, omega*60/(2*pi), ...
    p.torqueConstant_Nm_per_A*i, loadTorque, p.backEmfConstant_V_per_rad_s*omega, ...
    v.*i, p.resistance_ohm*i.^2, loadTorque.*omega, ...
    'VariableNames', {'time_s', 'voltage_V', 'current_A', 'speed_rad_s', ...
    'speed_rpm', 'motor_torque_Nm', 'load_torque_Nm', 'back_emf_V', ...
    'electrical_power_W', 'winding_loss_W', 'load_power_W'});
end

function m = summarize(data, p, loadTorque)
tail = data.time_s >= p.stopTime_s - 0.1;
omegaTheory = (p.voltage_V - p.resistance_ohm*loadTorque/p.torqueConstant_Nm_per_A) / ...
    (p.backEmfConstant_V_per_rad_s + p.resistance_ohm*p.viscousFriction_Nm_per_rad_s/p.torqueConstant_Nm_per_A);
currentTheory = (p.viscousFriction_Nm_per_rad_s*omegaTheory + loadTorque) / p.torqueConstant_Nm_per_A;
m = struct();
m.steady_speed_rpm = mean(data.speed_rpm(tail));
m.steady_current_A = mean(data.current_A(tail));
m.predicted_speed_rpm = omegaTheory*60/(2*pi);
m.predicted_current_A = currentTheory;
m.speed_error_percent = 100*abs(m.steady_speed_rpm-m.predicted_speed_rpm)/max(abs(m.predicted_speed_rpm), eps);
m.current_error_percent = 100*abs(m.steady_current_A-currentTheory)/max(abs(currentTheory), eps);
m.peak_current_A = max(data.current_A);
m.steady_winding_loss_W = mean(data.winding_loss_W(tail));
m.steady_load_power_W = mean(data.load_power_W(tail));
end

function fig = makePlot(baseline, loaded, p, showWindows)
visibility = 'off';
if showWindows
    visibility = 'on';
end
fig = figure('Name', 'IoT Nexus lesson 01 motor behaviour', ...
    'Color', 'white', 'Visible', visibility, 'Position', [100 80 1200 820]);
if isprop(fig, 'Theme')
    fig.Theme = 'light';
end
layout = tiledlayout(fig, 2, 2, 'Padding', 'compact', 'TileSpacing', 'compact');
title(layout, sprintf('DC motor at %.1f V | simulation with assumed parameters', p.voltage_V), 'Color', 'black');
nexttile(layout);
plot(baseline.time_s, baseline.speed_rpm, '--', loaded.time_s, loaded.speed_rpm, '-', 'LineWidth', 1.5);
xline(p.loadStep_s, ':', 'Load applied');
ylabel('Speed (RPM)'); xlabel('Time (s)'); grid on;
legend('No external load', 'Load step', 'Location', 'best');
nexttile(layout);
plot(baseline.time_s, baseline.current_A, '--', loaded.time_s, loaded.current_A, '-', 'LineWidth', 1.5);
xline(p.loadStep_s, ':', 'Load applied');
ylabel('Armature current (A)'); xlabel('Time (s)'); grid on;
nexttile(layout);
plot(loaded.time_s, loaded.voltage_V, 'LineWidth', 1.5);
ylabel('Applied voltage (V)'); xlabel('Time (s)'); ylim([-0.2 p.voltage_V*1.15]); grid on;
nexttile(layout);
plot(loaded.time_s, loaded.motor_torque_Nm, loaded.time_s, loaded.load_torque_Nm, '--', 'LineWidth', 1.5);
ylabel('Torque (N m)'); xlabel('Time (s)'); grid on;
legend('Motor torque', 'External load torque', 'Location', 'best');
% Export a readable light figure regardless of the user's desktop theme.
set(findall(fig, 'Type', 'axes'), 'Color', 'white', ...
    'XColor', [0.15 0.15 0.15], 'YColor', [0.15 0.15 0.15], 'GridColor', [0.6 0.6 0.6]);
set(findall(fig, 'Type', 'text'), 'Color', 'black');
set(findall(fig, 'Type', 'legend'), 'Color', 'white', ...
    'TextColor', 'black', 'EdgeColor', [0.7 0.7 0.7]);
end

function text = resultText(r)
b = r.baseline; l = r.loaded;
text = sprintf(['# Lesson 01 recorded results\n\n' ...
    'Evidence: MATLAB/Simulink simulation with assumed motor parameters.\n\n' ...
    'Release: %s. Solver: %s. Step: %.7f s.\n\n' ...
    '| Final 0.1 s mean | No external load | Load applied |\n|---|---:|---:|\n' ...
    '| Speed (RPM) | %.4f | %.4f |\n| Current (A) | %.6f | %.6f |\n' ...
    '| Winding loss (W) | %.6f | %.6f |\n\n' ...
    'Analytical speed predictions: %.4f / %.4f RPM.\n\n' ...
    'Analytical current predictions: %.6f / %.6f A.\n\n' ...
    'Speed decreases %.3f percent under the applied load.\n\n' ...
    'All automated checks passed: %d. See summary.json for individual checks.\n\n' ...
    'The solver refinement comparison excludes 20 ms around switching events.\n' ...
    'Maximum remaining differences: %.8f RPM and %.8f A.\n\n' ...
    'Temperature and vibration are not modeled. Winding loss is not a temperature measurement.\n' ...
    'These files are separate from the Nexus browser demonstration; no website import exists yet.\n'], ...
    r.matlab_release, r.solver, r.parameters.solverStep_s, ...
    b.steady_speed_rpm, l.steady_speed_rpm, b.steady_current_A, l.steady_current_A, ...
    b.steady_winding_loss_W, l.steady_winding_loss_W, ...
    b.predicted_speed_rpm, l.predicted_speed_rpm, b.predicted_current_A, l.predicted_current_A, ...
    100*(b.steady_speed_rpm-l.steady_speed_rpm)/b.steady_speed_rpm, r.all_checks_passed, ...
    r.max_refinement_speed_difference_rpm, r.max_refinement_current_difference_A);
end

function writeText(path, text)
file = fopen(path, 'w', 'n', 'UTF-8');
assert(file ~= -1, 'Nexus:WriteFailed', 'Cannot open output file: %s', path);
cleanup = onCleanup(@() fclose(file));
fprintf(file, '%s', text);
if isempty(text) || text(end) ~= newline
    fprintf(file, '\n');
end
end

function closeIfHidden(model, showWindows)
if ~showWindows && bdIsLoaded(model)
    close_system(model, 0);
end
end
