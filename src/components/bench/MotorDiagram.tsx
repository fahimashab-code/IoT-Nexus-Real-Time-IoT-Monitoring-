"use client";

export function MotorDiagram({ running }: { running: boolean }) {
  return (
    <svg
      className="motor-diagram"
      viewBox="0 0 600 225"
      role="img"
      aria-label="Conceptual motor test bench: ESP32 and driver connected to a motor with speed, current, temperature, and vibration measurements."
    >
      <defs>
        <pattern id="bench-grid" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#dfe5e8" />
        </pattern>
        <linearGradient id="motor-body" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#f5f7f8" />
          <stop offset="1" stopColor="#e3e8eb" />
        </linearGradient>
      </defs>
      <rect width="600" height="225" fill="url(#bench-grid)" />
      <path
        d="M161 122H223M370 122H421M296 69V37H440M296 173V201H440"
        fill="none"
        stroke="#b4bfc8"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <rect x="42" y="89" width="119" height="66" rx="10" fill="#fff" stroke="#d4dde3" />
      <rect
        x="54"
        y="101"
        width="29"
        height="29"
        rx="5"
        fill="#eef2f5"
        stroke="#cdd6dd"
      />
      <path d="M60 109H77M60 114H77M60 119H72" stroke="#83939e" strokeWidth="2" />
      <text x="91" y="115" className="diagram-title">
        ESP32
      </text>
      <text x="91" y="131" className="diagram-small">
        + motor driver
      </text>
      <rect x="236" y="168" width="116" height="10" rx="3" fill="#d2dce2" />
      <path d="M249 159L245 169M338 159L343 169" stroke="#a8b7c2" strokeWidth="6" />
      <rect
        x="240"
        y="77"
        width="101"
        height="84"
        rx="9"
        fill="url(#motor-body)"
        stroke="#b5c3cd"
        strokeWidth="1.5"
      />
      {[251, 262, 273, 284, 295, 306, 317].map((x) => (
        <path key={x} d={`M${x} 83V155`} stroke="#c9d3da" strokeWidth="2" />
      ))}
      <ellipse
        cx="239"
        cy="119"
        rx="19"
        ry="42"
        fill="#e3e9ed"
        stroke="#b5c3cd"
        strokeWidth="1.5"
      />
      <ellipse
        cx="340"
        cy="119"
        rx="23"
        ry="42"
        fill="#f9fafb"
        stroke="#b5c3cd"
        strokeWidth="1.5"
      />
      <ellipse cx="340" cy="119" rx="15" ry="29" fill="#e9eef1" stroke="#c0ccd5" />
      <path d="M341 119H383" stroke="#8296a5" strokeWidth="8" />
      <circle
        cx="387"
        cy="119"
        r="15"
        fill="#fff5ee"
        stroke="#ed946b"
        strokeWidth="1.5"
      />
      <g className={running ? "rotor running" : "rotor"}>
        <path
          d="M387 108V114M387 124V130M376 119H382M392 119H398"
          stroke="#e87b48"
          strokeWidth="2"
        />
      </g>
      <circle cx="387" cy="119" r="3" fill="#e87b48" />
      <circle cx="296" cy="69" r="4" fill="#e87b48" stroke="white" strokeWidth="2" />
      <circle cx="296" cy="173" r="4" fill="#7b91a3" stroke="white" strokeWidth="2" />
      <rect x="441" y="20" width="119" height="34" rx="7" fill="white" stroke="#dce3e8" />
      <text x="454" y="41" className="diagram-label">
        Temperature
      </text>
      <rect
        x="422"
        y="104"
        width="138"
        height="34"
        rx="7"
        fill="white"
        stroke="#dce3e8"
      />
      <text x="435" y="125" className="diagram-label">
        Speed / encoder
      </text>
      <rect
        x="441"
        y="184"
        width="119"
        height="34"
        rx="7"
        fill="white"
        stroke="#dce3e8"
      />
      <text x="454" y="205" className="diagram-label">
        Vibration
      </text>
      <text x="61" y="177" className="diagram-small">
        Current sensing
      </text>
      <text x="263" y="213" className="diagram-small">
        DC MOTOR
      </text>
    </svg>
  );
}
