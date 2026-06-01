/* App shell — header, view routing, direction switcher, tweaks */
const { useState: useS, useEffect: useE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "a",
  "planLabels": true,
  "planGrid": true,
  "density": "regular"
}/*EDITMODE-END*/;

const DIRECTIONS = [
  { key:'a', label:'Drawing Set' },
  { key:'b', label:'Dossier' },
  { key:'c', label:'Civic' },
];

function App() {
  const data = window.BUILDING;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useS('overview');
  const [floorId, setFloorId] = useS('ground');

  useE(() => {
    const r = document.documentElement;
    r.setAttribute('data-direction', t.direction);
    r.setAttribute('data-density', t.density);
    r.setAttribute('data-grid', t.planGrid ? 'on' : 'off');
  }, [t.direction, t.density, t.planGrid]);

  const goFloor = (id) => { setFloorId(id); setView('explore'); };
  const P = data.project;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="glyph"></div>
          <div className="brand-text">
            <h1>{P.address}</h1>
            <p>{P.city} · {P.stories}-Story Mixed Use</p>
          </div>
        </div>

        <nav className="topnav">
          <button className={view==='overview'?'on':''} onClick={() => setView('overview')}>Overview</button>
          <button className={view==='explore'?'on':''} onClick={() => setView('explore')}>Explore Plans</button>
        </nav>

        <div className="topbar-right">
          <div className="dirswitch" title="Visual direction">
            {DIRECTIONS.map(d => (
              <button key={d.key} className={t.direction===d.key?'on':''} onClick={() => setTweak('direction', d.key)}>{d.label}</button>
            ))}
          </div>
          <div className="meta-block">
            <div><b>City of Palo Alto</b></div>
            <div>Planning Submittal</div>
            <div>{P.date}</div>
          </div>
        </div>
      </header>

      {view === 'overview'
        ? <Overview data={data} goFloor={goFloor} />
        : <Explorer data={data} floorId={floorId} setFloorId={setFloorId} showLabels={t.planLabels} />}

      <TweaksPanel>
        <TweakSection label="Visual direction" />
        <TweakRadio label="Direction" value={t.direction}
          options={[{value:'a',label:'Drawing Set'},{value:'b',label:'Dossier'},{value:'c',label:'Civic'}]}
          onChange={(v) => setTweak('direction', v)} />
        <TweakSection label="Plans" />
        <TweakToggle label="Zone labels" value={t.planLabels} onChange={(v) => setTweak('planLabels', v)} />
        <TweakToggle label="Drawing grid" value={t.planGrid} onChange={(v) => setTweak('planGrid', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={['compact','regular']} onChange={(v) => setTweak('density', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
