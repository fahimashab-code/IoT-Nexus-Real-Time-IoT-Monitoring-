function build_lesson01_motor(modelName, modelPath, p)
%BUILD_LESSON01_MOTOR Build an editable DC motor from its two equations.
% L di/dt = V - R i - Ke omega
% J domega/dt = Kt i - b omega - Tload
% Numeric block parameters make the saved model independent of workspace vars.
assert(~bdIsLoaded(modelName), 'Nexus:ModelAlreadyOpen', ...
    'The requested model name is already open. Close it or use a new name.');
load_system('simulink');
new_system(modelName);
set_param(modelName, 'SolverType', 'Fixed-step', 'Solver', 'ode4', ...
    'FixedStep', value(p.solverStep_s), 'StopTime', value(p.stopTime_s), ...
    'ReturnWorkspaceOutputs', 'on', 'SaveTime', 'off', 'SaveOutput', 'off');

put('simulink/Sources/Step', 'Applied_voltage', [30 100 70 140], ...
    'Time', value(p.voltageOn_s), 'Before', '0', 'After', value(p.voltage_V));
put('simulink/Math Operations/Sum', 'Electrical_balance', [160 100 190 160], ...
    'Inputs', '+--');
put('simulink/Math Operations/Gain', 'Inverse_inductance', [240 110 310 150], ...
    'Gain', value(1/p.inductance_H));
put('simulink/Continuous/Integrator', 'Current_A', [360 110 400 150], ...
    'InitialCondition', '0');
put('simulink/Math Operations/Gain', 'Winding_voltage_drop', [240 235 330 275], ...
    'Gain', value(p.resistance_ohm));
put('simulink/Math Operations/Gain', 'Torque_constant', [460 110 530 150], ...
    'Gain', value(p.torqueConstant_Nm_per_A));
put('simulink/Math Operations/Sum', 'Mechanical_balance', [600 100 630 160], ...
    'Inputs', '+--');
put('simulink/Math Operations/Gain', 'Inverse_inertia', [685 110 755 150], ...
    'Gain', value(1/p.inertia_kg_m2));
put('simulink/Continuous/Integrator', 'Speed_rad_s', [810 110 850 150], ...
    'InitialCondition', '0');
put('simulink/Math Operations/Gain', 'Friction_torque', [680 235 770 275], ...
    'Gain', value(p.viscousFriction_Nm_per_rad_s));
put('simulink/Math Operations/Gain', 'Back_EMF', [450 340 540 380], ...
    'Gain', value(p.backEmfConstant_V_per_rad_s));
put('simulink/Sources/Step', 'Load_torque', [485 235 525 275], ...
    'Time', value(p.loadStep_s), 'Before', '0', 'After', value(p.loadTorque_Nm));
put('simulink/Math Operations/Gain', 'Speed_RPM', [915 110 990 150], ...
    'Gain', value(60/(2*pi)));

put('simulink/Sinks/To Workspace', 'Log_current', [460 15 570 50], ...
    'VariableName', 'motor_current', 'SaveFormat', 'Timeseries', 'MaxDataPoints', 'inf', 'SampleTime', value(p.logInterval_s));
put('simulink/Sinks/To Workspace', 'Log_speed', [915 15 1025 50], ...
    'VariableName', 'motor_speed', 'SaveFormat', 'Timeseries', 'MaxDataPoints', 'inf', 'SampleTime', value(p.logInterval_s));
put('simulink/Sinks/To Workspace', 'Log_voltage', [30 15 140 50], ...
    'VariableName', 'motor_voltage', 'SaveFormat', 'Timeseries', 'MaxDataPoints', 'inf', 'SampleTime', value(p.logInterval_s));
put('simulink/Sinks/To Workspace', 'Log_load', [485 430 595 465], ...
    'VariableName', 'motor_load', 'SaveFormat', 'Timeseries', 'MaxDataPoints', 'inf', 'SampleTime', value(p.logInterval_s));
put('simulink/Signal Routing/Mux', 'Monitor_signals', [1060 110 1065 220], ...
    'Inputs', '2');
put('simulink/Sinks/Scope', 'Speed_and_current', [1120 145 1170 185]);

wire('Applied_voltage/1', 'Electrical_balance/1');
wire('Applied_voltage/1', 'Log_voltage/1');
wire('Electrical_balance/1', 'Inverse_inductance/1');
wire('Inverse_inductance/1', 'Current_A/1');
wire('Current_A/1', 'Winding_voltage_drop/1');
wire('Winding_voltage_drop/1', 'Electrical_balance/2');
wire('Current_A/1', 'Torque_constant/1');
wire('Current_A/1', 'Log_current/1');
wire('Torque_constant/1', 'Mechanical_balance/1');
wire('Load_torque/1', 'Mechanical_balance/3');
wire('Load_torque/1', 'Log_load/1');
wire('Mechanical_balance/1', 'Inverse_inertia/1');
wire('Inverse_inertia/1', 'Speed_rad_s/1');
wire('Speed_rad_s/1', 'Friction_torque/1');
wire('Friction_torque/1', 'Mechanical_balance/2');
wire('Speed_rad_s/1', 'Back_EMF/1');
wire('Back_EMF/1', 'Electrical_balance/3');
wire('Speed_rad_s/1', 'Speed_RPM/1');
wire('Speed_rad_s/1', 'Log_speed/1');
wire('Speed_RPM/1', 'Monitor_signals/1');
wire('Current_A/1', 'Monitor_signals/2');
wire('Monitor_signals/1', 'Speed_and_current/1');

note = Simulink.Annotation(modelName, ...
    sprintf(['LESSON 01  |  ASSUMED TEACHING MOTOR\n' ...
    'Electrical: L di/dt = V - R i - Ke omega\n' ...
    'Mechanical: J domega/dt = Kt i - b omega - load torque\n' ...
    'Supply: %.1f V at %.2f s  |  Opposing load: %.3f N m at %.1f s\n' ...
    'Open-loop voltage input. No PI controller, PWM, temperature or vibration model.'], ...
    p.voltage_V, p.voltageOn_s, p.loadTorque_Nm, p.loadStep_s));
note.Position = [30 500 1110 615];
save_system(modelName, modelPath);

    function put(source, name, position, varargin)
        add_block(source, [modelName '/' name], 'Position', position, varargin{:});
    end
    function wire(source, target)
        add_line(modelName, source, target, 'autorouting', 'on');
    end
end

function text = value(number)
text = num2str(number, 17);
end
