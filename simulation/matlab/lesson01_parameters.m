function p = lesson01_parameters()
%LESSON01_PARAMETERS Assumed teaching motor, not a manufacturer's motor.
% Change one value at a time and keep the resulting experiment folder.
% SI units are used internally. RPM is calculated only for presentation.
p.voltage_V = 6;
p.resistance_ohm = 2;
p.inductance_H = 0.002;
p.torqueConstant_Nm_per_A = 0.02;
p.backEmfConstant_V_per_rad_s = 0.02;
p.inertia_kg_m2 = 0.00002;
p.viscousFriction_Nm_per_rad_s = 0.00002;
p.voltageOn_s = 0.05;
p.loadStep_s = 1;
p.loadTorque_Nm = 0.01;
p.stopTime_s = 2;
p.solverStep_s = 0.00002;
p.logInterval_s = 0.0001;
end
