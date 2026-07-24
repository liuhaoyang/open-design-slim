import { useMemo, useState } from "react";

const queue = [
  { id: "pricing", name: "Pricing workspace", owner: "Design Ops", status: "ready", next: "Desktop visual pass" },
  { id: "import", name: "Import review", owner: "Platform", status: "mobile", next: "390px layout" },
  { id: "recovery", name: "Error recovery", owner: "Runtime", status: "blocked", next: "Error state copy" }
];

const statusLabel = {
  ready: "Ready",
  mobile: "Needs mobile",
  blocked: "Blocked"
};

export default function Prototype() {
  const [view, setView] = useState("populated");
  const [selectedId, setSelectedId] = useState("pricing");
  const selected = useMemo(() => queue.find((item) => item.id === selectedId) ?? queue[0], [selectedId]);

  return (
    <main className="od-slim-prototype">
      <style>{styles}</style>
      <aside className="od-slim-sidebar" aria-label="Product navigation">
        <div className="od-slim-brand">
          <span className="od-slim-mark">OD</span>
          Slim Ops
        </div>
        <nav className="od-slim-nav">
          {["Overview", "Queue", "Reviews", "Settings"].map((item, index) => (
            <button key={item} type="button" aria-current={index === 0 ? "page" : undefined}>
              {item}
              <span>{[12, 4, 7, 2][index]}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="od-slim-main">
        <header className="od-slim-topbar">
          <div>
            <h1>Review operations dashboard</h1>
            <p>
              A compact React prototype for tracking generated artifacts, review readiness, and
              state coverage without relying on runtime APIs.
            </p>
          </div>
          <div className="od-slim-actions">
            <button type="button">Export brief</button>
            <button type="button" className="primary">
              Create review
            </button>
          </div>
        </header>

        <section className="od-slim-metrics" aria-label="Summary metrics">
          <Metric label="Ready artifacts" value="18" trend="+6 this week" />
          <Metric label="Needs visual pass" value="5" trend="2 mobile gaps" tone="warn" />
          <Metric label="Blocked states" value="3" trend="missing errors" tone="bad" />
          <Metric label="Coverage" value="91%" trend="state matrix" />
        </section>

        <section className="od-slim-workspace">
          <article className="od-slim-panel">
            <div className="od-slim-panel-header">
              <h2>Artifact queue</h2>
              <div className="od-slim-segmented" aria-label="Prototype state">
                {["populated", "loading", "empty", "error"].map((state) => (
                  <button
                    key={state}
                    type="button"
                    aria-pressed={view === state}
                    onClick={() => setView(state)}
                  >
                    {state[0].toUpperCase() + state.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <QueueState view={view} selectedId={selectedId} onSelect={setSelectedId} />
          </article>

          <aside className="od-slim-panel">
            <div className="od-slim-panel-header">
              <h2>Selected review</h2>
              <button type="button" disabled>
                Approve
              </button>
            </div>
            <div className="od-slim-detail">
              <p>
                {selected.name} is ready for visual inspection. Approval is disabled until the focus
                and mobile checks are recorded.
              </p>
              <div className="od-slim-detail-grid">
                <Detail label="States" value="7 of 8" />
                <Detail label="Viewport" value="1440x900" />
                <Detail label="Design source" value="Bundle default" />
                <Detail label="Runtime deps" value="None" />
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, trend, tone = "good" }) {
  return (
    <article className="od-slim-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small data-tone={tone}>{trend}</small>
    </article>
  );
}

function QueueState({ view, selectedId, onSelect }) {
  if (view === "loading") {
    return (
      <div className="od-slim-state" aria-busy="true">
        <strong>Loading review queue</strong>
        <span className="od-slim-skeleton" />
        <span className="od-slim-skeleton short" />
        <span className="od-slim-skeleton" />
      </div>
    );
  }

  if (view === "empty") {
    return (
      <div className="od-slim-state">
        <strong>No artifacts match this filter</strong>
        <p>Clear filters or create a new review to populate this queue.</p>
        <button type="button" className="primary">
          Create review
        </button>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="od-slim-state">
        <strong>State coverage could not be calculated</strong>
        <p>Check the handoff file and retry validation after required states are declared.</p>
        <button type="button">Retry validation</button>
      </div>
    );
  }

  return (
    <div className="od-slim-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Artifact</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Next check</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => (
            <tr key={item.id} aria-selected={selectedId === item.id} onClick={() => onSelect(item.id)}>
              <td>{item.name}</td>
              <td>{item.owner}</td>
              <td>
                <span className={`od-slim-status ${item.status}`}>{statusLabel[item.status]}</span>
              </td>
              <td>{item.next}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="od-slim-detail-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = `
.od-slim-prototype {
  --bg: #f6f7f2;
  --surface: #ffffff;
  --surface-muted: #eef1e8;
  --text: #18201b;
  --muted: #667066;
  --border: #d9dfd0;
  --accent: #2f6f5e;
  --accent-strong: #214f44;
  --danger: #b42318;
  --warning: #b7791f;
  --success: #18794e;
  --focus: #8fb8ff;
  --shadow: 0 18px 40px rgba(24, 32, 27, 0.08);
  min-height: 100vh;
  display: grid;
  grid-template-columns: 252px minmax(0, 1fr);
  background: var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.od-slim-prototype * { box-sizing: border-box; }
.od-slim-prototype button { font: inherit; }
.od-slim-sidebar {
  border-right: 1px solid var(--border);
  background: #fbfcf7;
  padding: 24px 18px;
}
.od-slim-brand { display: flex; align-items: center; gap: 10px; font-weight: 760; }
.od-slim-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
}
.od-slim-nav { display: grid; gap: 6px; margin-top: 28px; }
.od-slim-nav button,
.od-slim-actions button,
.od-slim-panel button,
.od-slim-state button {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  min-height: 38px;
  padding: 0 14px;
  cursor: pointer;
}
.od-slim-nav button {
  border-color: transparent;
  display: flex;
  justify-content: space-between;
  background: transparent;
  color: var(--muted);
  width: 100%;
  text-align: left;
}
.od-slim-nav button[aria-current="page"] { background: var(--surface-muted); color: var(--text); font-weight: 700; }
.od-slim-prototype button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.od-slim-prototype button:disabled { cursor: not-allowed; opacity: 0.55; }
.od-slim-prototype button:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
.od-slim-main { min-width: 0; padding: 28px; }
.od-slim-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.od-slim-topbar h1 { margin: 0; font-size: clamp(1.65rem, 3vw, 2.3rem); line-height: 1.08; }
.od-slim-topbar p { margin: 8px 0 0; color: var(--muted); max-width: 66ch; }
.od-slim-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; }
.od-slim-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.od-slim-metric,
.od-slim-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow);
}
.od-slim-metric { padding: 16px; min-height: 112px; }
.od-slim-metric span { display: block; color: var(--muted); font-size: 0.86rem; }
.od-slim-metric strong { display: block; margin-top: 10px; font-size: 1.8rem; line-height: 1; }
.od-slim-metric small { display: inline-block; margin-top: 10px; color: var(--success); }
.od-slim-metric small[data-tone="warn"] { color: var(--warning); }
.od-slim-metric small[data-tone="bad"] { color: var(--danger); }
.od-slim-workspace { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.8fr); gap: 16px; }
.od-slim-panel { overflow: hidden; }
.od-slim-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--border); }
.od-slim-panel-header h2 { margin: 0; font-size: 1rem; }
.od-slim-segmented { display: inline-flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--surface-muted); }
.od-slim-segmented button { border: 0; border-right: 1px solid var(--border); border-radius: 0; background: transparent; min-height: 34px; padding: 0 10px; }
.od-slim-segmented button:last-child { border-right: 0; }
.od-slim-segmented button[aria-pressed="true"] { background: var(--surface); color: var(--accent-strong); font-weight: 700; }
.od-slim-table-wrap { overflow: auto; }
.od-slim-table-wrap table { width: 100%; min-width: 640px; border-collapse: collapse; }
.od-slim-table-wrap th,
.od-slim-table-wrap td { padding: 14px 18px; text-align: left; border-bottom: 1px solid var(--border); vertical-align: top; }
.od-slim-table-wrap th { color: var(--muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; }
.od-slim-table-wrap tr { cursor: pointer; }
.od-slim-table-wrap tr[aria-selected="true"] { background: #eef7f3; }
.od-slim-status { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 9px; font-size: 0.82rem; font-weight: 700; }
.od-slim-status.ready { background: #dff5ea; color: var(--success); }
.od-slim-status.mobile { background: #fff3d6; color: var(--warning); }
.od-slim-status.blocked { background: #ffe4df; color: var(--danger); }
.od-slim-state { margin: 22px; border: 1px dashed var(--border); border-radius: 10px; background: #fbfcf7; padding: 22px; min-height: 250px; }
.od-slim-skeleton { display: block; height: 14px; border-radius: 999px; background: linear-gradient(90deg, #edf0e8, #f8faf4, #edf0e8); margin: 12px 0; }
.od-slim-skeleton.short { width: 74%; }
.od-slim-detail { padding: 18px; }
.od-slim-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 16px; }
.od-slim-detail-card { border: 1px solid var(--border); border-radius: 8px; padding: 12px; background: #fbfcf7; min-height: 80px; }
.od-slim-detail-card span { color: var(--muted); font-size: 0.82rem; }
.od-slim-detail-card strong { display: block; margin-top: 8px; }
@media (max-width: 920px) {
  .od-slim-prototype { grid-template-columns: 1fr; }
  .od-slim-sidebar { position: sticky; top: 0; z-index: 2; border-right: 0; border-bottom: 1px solid var(--border); padding: 14px 16px; }
  .od-slim-nav { grid-auto-flow: column; grid-auto-columns: max-content; overflow-x: auto; margin-top: 14px; }
  .od-slim-topbar { display: grid; }
  .od-slim-actions { justify-content: flex-start; }
  .od-slim-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .od-slim-workspace { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .od-slim-main { padding: 18px; }
  .od-slim-metrics,
  .od-slim-detail-grid { grid-template-columns: 1fr; }
  .od-slim-panel-header { align-items: stretch; flex-direction: column; }
  .od-slim-segmented { width: 100%; }
  .od-slim-segmented button { flex: 1; }
}
`;
