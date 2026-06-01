/* Overview & compliance dashboard */
function Overview({ data, goFloor }) {
  const B = data, P = B.project, T = B.totals;

  // ---- parking worksheet (transparent arithmetic on stated rates) ----
  const resReq = T.twoBed * 2.0 + T.oneBed * 1.5;
  const commReq = B.totals.commSf / 300;
  const guestReq = 1 + 0.10 * T.resUnits;
  const totalReq = resReq + commReq + guestReq;
  const provided = T.parkingProvided;
  const short = provided < totalReq;

  const mix2 = T.twoBed, mix1 = T.oneBed, mixTotal = mix2 + mix1;

  return (
    <div className="overview">
      <div className="ov-inner">

        {/* masthead */}
        <div className="masthead">
          <div className="kicker">
            <span>{P.submittal}</span>
            <span className="ph">{P.phase}</span>
          </div>
          <h1>{P.name}</h1>
          <div className="addr">{P.address} <span>· {P.city}</span></div>
          <div className="credits">
            <div><b>{P.stories}-STORY MIXED USE</b>{P.footprint}</div>
            <div><b>PREPARED BY</b>{P.preparedBy} · {P.date}</div>
            <div><b>DRAWING SET</b>{P.drawingSet}<br/>{P.drawingSetAddr}</div>
            <div><b>JOB NO.</b>{P.jobNo}</div>
          </div>
        </div>

        {/* stat band */}
        <div className="statband">
          {[
            [T.stories, '', 'Stories'],
            [T.resUnits, '', 'Residential units'],
            [T.commUnits, '', 'Commercial tenancies'],
            [T.commSf.toLocaleString(), ' sf', 'Retail / office'],
            [provided, ' sp', 'Parking provided'],
            [T.bikeParking, ' sp', 'Bicycle parking'],
          ].map((c, i) => (
            <div className="cell" key={i}>
              <div className="num">{c[0]}<small>{c[1]}</small></div>
              <div className="lab">{c[2]}</div>
            </div>
          ))}
        </div>

        {/* unit mix + parking */}
        <div className="grid2 block">
          <div className="card pad">
            <div className="section-head"><h2>Unit Mix</h2><span className="idx tick">12 dwellings</span></div>
            <div className="mixbar">
              <i style={{ width:(mix2/mixTotal*100)+'%', background:typeVar('res2') }}></i>
              <i style={{ width:(mix1/mixTotal*100)+'%', background:typeVar('res1') }}></i>
            </div>
            <div style={{ display:'flex', gap:18, marginBottom:6 }}>
              <Chip typeKey="res2">{mix2} × 2-Bedroom</Chip>
              <Chip typeKey="res1">{mix1} × 1-Bedroom</Chip>
            </div>
            <table className="unit-table" style={{ marginTop:14 }}>
              <thead><tr><th>Unit</th><th>Floor</th><th>Type</th><th>Bd/Ba</th><th style={{textAlign:'right'}}>Area</th></tr></thead>
              <tbody>
                {B.units.map(u => (
                  <tr key={u.id} onClick={() => goFloor(u.floor === '2nd' ? 'l2res' : u.floor === '3rd' ? 'l3' : 'l4')}>
                    <td className="id">#{u.id}</td>
                    <td>{u.floor}</td>
                    <td><span className="chip" style={{ background:`color-mix(in srgb, ${typeVar(u.type)} 15%, transparent)`, color:typeVar(u.type), fontSize:10 }}>{u.beds}BR</span></td>
                    <td className="mono" style={{fontSize:11}}>{u.beds} / {u.baths}</td>
                    <td className="sf">{u.sf.toLocaleString()} sf</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card pad">
            <div className="section-head"><h2>Parking Worksheet</h2><span className="idx tick">preliminary</span></div>
            <table className="work">
              <thead><tr><th>Demand source</th><th>Rate</th><th style={{textAlign:'right'}}>Spaces</th></tr></thead>
              <tbody>
                <tr><td>2-Bedroom × {T.twoBed}</td><td className="mono" style={{fontSize:11}}>2.0 / unit</td><td className="n">{resReq - T.oneBed*1.5}</td></tr>
                <tr><td>1-Bedroom × {T.oneBed}</td><td className="mono" style={{fontSize:11}}>1.5 / unit</td><td className="n">{(T.oneBed*1.5)}</td></tr>
                <tr><td>Commercial {T.commSf.toLocaleString()} sf</td><td className="mono" style={{fontSize:11}}>1 / 300 sf</td><td className="n">{commReq.toFixed(1)}</td></tr>
                <tr><td>Guest</td><td className="mono" style={{fontSize:11}}>1 + 10%</td><td className="n">{guestReq.toFixed(1)}</td></tr>
                <tr className="tot"><td>Required (calc.)</td><td></td><td className="n">≈ {totalReq.toFixed(1)}</td></tr>
                <tr className="tot"><td>Provided (Sheet A-2)</td><td></td><td className="n">{provided}</td></tr>
              </tbody>
            </table>
            <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:10 }}>
              {short
                ? <span className="flag warn">⚠ Reconcile — {(totalReq-provided).toFixed(1)} space gap</span>
                : <span className="flag ok">✓ Meets calculated demand</span>}
            </div>
            <p className="note" style={{ marginTop:12 }}>
              Rates per drawing-set general notes (Sheet A-2). Tandem permitted up to 25% of required;
              at least one covered space per unit. Figures are a pre-submittal aid — confirm against
              current Palo Alto zoning before filing.
            </p>
          </div>
        </div>

        {/* amenities */}
        <div className="block">
          <div className="section-head"><h2>Amenities & Shared Program</h2><span className="idx tick">ground + typical floors</span></div>
          <div className="amen-grid">
            {B.amenities.map((a, i) => (
              <div className="amen-card" key={i}>
                <div className="t">{a.label}</div>
                <div className="d">{a.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* commercial */}
        <div className="grid2 block">
          <div className="card pad">
            <div className="section-head"><h2>Commercial Frontage</h2><span className="idx tick">Sheet A-3</span></div>
            {B.commercial.map(c => (
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--line-2)' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{c.label}</div>
                  <div className="note" style={{ marginTop:3 }}>{c.frontage} · {c.parking} parking</div>
                </div>
                <div className="mono" style={{ fontWeight:600 }}>{c.sf.toLocaleString()} sf</div>
              </div>
            ))}
            <div className="stat-row" style={{ marginTop:8 }}><span className="l">Combined retail / office</span><span className="v">{T.commSf.toLocaleString()} sf</span></div>
            <button className="btn" style={{ marginTop:16 }} onClick={() => goFloor('l2comm')}>Open commercial floor →</button>
          </div>

          <div className="card pad">
            <div className="section-head"><h2>Zoning Summary</h2><span className="idx tick">to verify</span></div>
            <div className="stat-row"><span className="l">Address</span><span className="v" style={{fontSize:10}}>{P.address}</span></div>
            <div className="stat-row"><span className="l">Use</span><span className="v" style={{fontSize:10}}>Mixed — retail + residential</span></div>
            <div className="stat-row"><span className="l">Stories / height</span><span className="v">4 / <span style={{color:'var(--faint)'}}>TBD</span></span></div>
            <div className="stat-row"><span className="l">Zone district</span><span className="v" style={{color:'var(--faint)'}}>TBD</span></div>
            <div className="stat-row"><span className="l">FAR</span><span className="v" style={{color:'var(--faint)'}}>TBD</span></div>
            <div className="stat-row"><span className="l">Setbacks</span><span className="v" style={{color:'var(--faint)'}}>TBD</span></div>
            <p className="note" style={{ marginTop:12 }}>Zoning fields are placeholders — populate with the Palo Alto El Camino Real corridor standards applicable to this parcel.</p>
          </div>
        </div>

        {/* location + sheet index */}
        <div className="grid2 block">
          <div>
            <div className="section-head"><h2>Location</h2><span className="idx tick">Palo Alto</span></div>
            <div className="ph-img" style={{ aspectRatio:'1.5' }}>
              <div className="cap">
                <span className="lab">Site / context map</span>
                <span className="hint">drop aerial or vicinity map here</span>
              </div>
            </div>
            <p className="note" style={{ marginTop:10 }}>
              {P.address}, {P.city}. {P.parcelNote}. Transit-oriented El Camino Real corridor —
              ground-floor retail activates the street, residences above.
            </p>
          </div>

          <div>
            <div className="section-head"><h2>Drawing Index</h2><span className="idx tick">5 sheets</span></div>
            <div className="card pad">
              <div className="sheetlist">
                {B.sheets.map((s, i) => (
                  <div className="sheetrow" key={i} onClick={() => goFloor(s.floor)}>
                    <span className="sn">{s.sheet}</span>
                    <span className="st">{s.title}</span>
                    <span className="go tick">Open →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="foot">
          <span className="tick">{P.name} · {P.address}</span>
          <span className="tick">{P.submittal} · Prepared {P.date}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Overview });
