"use client";

import { useState, type FormEvent } from "react";
import { Check, Cpu, Info, Save, Unplug } from "lucide-react";
import { useBench } from "@/components/bench/BenchProvider";
import { DEFAULT_SETTINGS, type BenchSettings } from "@/lib/bench-model";
import { saveBenchSettings } from "@/lib/bench-storage";

function SettingsForm({
  settings,
  running,
  onSaved,
}: {
  settings: BenchSettings;
  running: boolean;
  onSaved: (success: boolean) => void;
}) {
  const [draft, setDraft] = useState(settings);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running) return;
    onSaved(saveBenchSettings({ ...draft, name: draft.name.trim() }));
  }
  return (
    <form onSubmit={submit} className="panel settings-form">
      <div className="panel-header">
        <div>
          <span className="section-kicker">YOUR WORKSPACE</span>
          <h2>Bench configuration</h2>
          <p>These settings apply to the demo and are stored in this browser.</p>
        </div>
        <Cpu size={20} className="muted-icon" />
      </div>
      <fieldset disabled={running}>
        <div className="form-section">
          <label htmlFor="bench-name">Bench name</label>
          <input
            id="bench-name"
            required
            maxLength={60}
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <p>A name to identify this setup and its recorded experiments.</p>
        </div>
        <div className="form-row">
          <div className="form-section">
            <label htmlFor="max-rpm">
              Maximum demo speed <span>RPM</span>
            </label>
            <input
              id="max-rpm"
              type="number"
              required
              min={500}
              max={10000}
              step={100}
              value={draft.maxRpm}
              onChange={(event) =>
                setDraft({ ...draft, maxRpm: Number(event.target.value) })
              }
            />
            <p>Sets the range of the speed control.</p>
          </div>
          <div className="form-section">
            <label htmlFor="sample-interval">Sample interval</label>
            <select
              id="sample-interval"
              value={draft.sampleInterval}
              onChange={(event) =>
                setDraft({ ...draft, sampleInterval: Number(event.target.value) })
              }
            >
              <option value={250}>250 ms · 4 samples / second</option>
              <option value={500}>500 ms · 2 samples / second</option>
              <option value={1000}>1,000 ms · 1 sample / second</option>
            </select>
            <p>How often the demo generates a measurement.</p>
          </div>
        </div>
        <div className="form-divider" />
        <div className="form-section-heading">
          <h3>Demo warning thresholds</h3>
          <p>Highlight simulated readings above these values.</p>
        </div>
        <div className="form-row">
          <div className="form-section">
            <label htmlFor="current-warning">
              Current <span>A</span>
            </label>
            <input
              id="current-warning"
              type="number"
              required
              min={0.1}
              max={20}
              step={0.1}
              value={draft.currentWarning}
              onChange={(event) =>
                setDraft({ ...draft, currentWarning: Number(event.target.value) })
              }
            />
          </div>
          <div className="form-section">
            <label htmlFor="temperature-warning">
              Temperature <span>°C</span>
            </label>
            <input
              id="temperature-warning"
              type="number"
              required
              min={26}
              max={100}
              step={1}
              value={draft.temperatureWarning}
              onChange={(event) =>
                setDraft({ ...draft, temperatureWarning: Number(event.target.value) })
              }
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="button button-primary">
            <Save size={15} />
            Save settings
          </button>
          <button
            type="button"
            className="text-button muted"
            onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
          >
            Use defaults
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default function SettingsPage() {
  const { settings, running } = useBench();
  const [saved, setSaved] = useState<boolean | null>(null);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span /> THE MOTOR LAB <span className="eyebrow-slash">/</span> DEVICE
            SETTINGS
          </div>
          <h1>
            A place for your hardware<span className="heading-dot">.</span>
          </h1>
          <p>Set up the demo workspace. Prepare for the physical bench.</p>
        </div>
        <span className="pill pill-neutral">
          <Unplug size={14} />
          Hardware not connected
        </span>
      </div>
      {running && (
        <div className="demo-banner">
          <span className="demo-icon">
            <Info size={19} />
          </span>
          <div>
            <strong>A demo is running</strong>
            <span>Stop and save the current run before changing its configuration.</span>
          </div>
        </div>
      )}
      {saved !== null && (
        <div className={saved ? "notice" : "warning-banner"} role="status">
          {saved ? <Check size={17} /> : <Info size={17} />}
          <span>
            {saved
              ? "Settings saved in this browser."
              : "Settings could not be saved. Check the values and browser storage availability."}
          </span>
        </div>
      )}
      <div className="settings-grid">
        <SettingsForm
          key={JSON.stringify(settings)}
          settings={settings}
          running={running}
          onSaved={setSaved}
        />
        <div className="settings-side">
          <section className="panel connection-panel">
            <span className="connection-icon">
              <Unplug size={29} strokeWidth={1.5} />
            </span>
            <span className="section-kicker">THE NEXT STAGE</span>
            <h2>Meet the real world.</h2>
            <p>
              This workspace currently runs a local simulation. Your ESP32 is not
              connected, and the controls do not operate a physical motor.
            </p>
            <div className="connection-checklist">
              <div>
                <span>01</span>
                <p>ESP32 & motor driver</p>
              </div>
              <div>
                <span>02</span>
                <p>Encoder & sensor measurements</p>
              </div>
              <div>
                <span>03</span>
                <p>Device connection & command feedback</p>
              </div>
            </div>
            <div className="connection-status">
              <span className="small-dot" />
              Hardware integration pending
            </div>
          </section>
          <div className="settings-note">
            <Info size={17} />
            <p>
              Demo thresholds show warnings only. Physical motor limits and protective
              behaviour will be implemented in the device firmware.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
