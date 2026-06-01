/* Floor explorer: building stack nav + schematic plan + unit detail + CAD access */
const { useState: useStateEx } = React;

function parkReqFor(type) { return type === 'res2' ? 2.0 : type === 'res1' ? 1.5 : 1.25; }

function CommDetail({ comm }) {
  return (
    <div>
      <div className="card-title tick">Commercial Detail</div>
      <div className="ud-big">
        <span className="n" style={{ fontSize:22 }}>{comm.id}</span>
        <Chip typeKey="comm">Commercial</Chip>
      </div>
      <div className="ud-sf" style={{ marginTop:6 }}>{comm.label}</div>
      <div className="ud-mini">
        <div className="zone" style={{ left:'5%', top:'8%', width:'90%', height:'84%', '--zc':'var(--t-comm)' }}>
          <span className="zl">Open Tenant Area</span>
          <span className="zs">{comm.sf.toLocaleString()} sf</span>
        </div>
      </div>
      <div className="stat-row"><span className="l">Gross area</span><span className="v">{comm.sf.toLocaleString()} sf</span></div>
      <div className="stat-row"><span className="l">Parking</span><span className="v">{comm.parking} sp</span></div>
      <div className="stat-row"><span className="l">Frontage</span><span className="v" style={{fontSize:10}}>{comm.frontage}</span></div>
      <div className="stat-row"><span className="l">Rate</span><span className="v" style={{fontSize:10}}>1 / 300 sf</span></div>
    </div>
  );
}

function Explorer({ data, floorId, setFloorId, showLabels }) {
  const B = data;
  const [selected, setSelected] = useStateEx(null); // {kind:'unit'|'comm', ...}
  const [cadOpen, setCadOpen] = useStateEx(false);
  const floor = B.F[floorId];

  function onZone(z) {
    if (!z.link) return;
    const [kind, id] = z.link.split(':');
    if (kind === 'unit') {
      const u = B.units.find(u => String(u.id) === id);
      setSelected({ kind:'unit', unit:u });
    } else if (kind === 'comm') {
      const c = B.commercial.find(c => c.id === id);
      setSelected({ kind:'comm', comm:c });
    }
  }

  const activeLink = selected
    ? (selected.kind === 'unit' ? 'unit:' + selected.unit.id : 'comm:' + selected.comm.id)
    : null;

  // legend types present on this floor
  const present = [...new Set(floor.zones.map(z => z.type))];

  return (
    <div className="explorer">
      <BuildingStack stack={B.stack} currentId={floorId} onSelect={(id) => { setFloorId(id); setSelected(null); }} />

      <div className="stage">
        <div className="stage-head">
          <div>
            <div className="eyebrow tick">Sheet {floor.sheet} · {floor.level}</div>
            <h2>{floor.title}</h2>
            <div className="sm">{floor.use} · {floor.scale}</div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button className="btn" onClick={() => setCadOpen(true)}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11}}>▣</span> View source drawing
            </button>
          </div>
        </div>

        <div className="card pad" style={{ marginBottom:14 }}>
          <SchematicPlan floor={floor} activeLink={activeLink} onZoneClick={onZone} showLabels={showLabels} />
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <Legend types={present} />
          <span className="note">Schematic — approximate, for navigation. Dimensions per Sheet {floor.sheet}.</span>
        </div>
      </div>

      <div className="detail-rail">
        {/* floor stats */}
        <div className="card-title tick">Floor Summary</div>
        {floor.stats.map((s, i) => (
          <div className="stat-row" key={i}><span className="l">{s[0]}</span><span className="v">{s[1]}</span></div>
        ))}
        <div style={{ height:22 }}></div>
        {selected
          ? (selected.kind === 'unit'
              ? <UnitDetail unit={selected.unit} parkReq={parkReqFor(selected.unit.type)} />
              : <CommDetail comm={selected.comm} />)
          : <UnitDetail unit={null} />}
      </div>

      {cadOpen && (
        <CadLightbox
          src={B.cad[floorId]}
          title={floor.title}
          sheet={floor.sheet}
          onClose={() => setCadOpen(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { Explorer, parkReqFor, CommDetail });
