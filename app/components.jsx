/* Shared components for the Planning Explorer. Exports to window. */
const { useState, useRef, useEffect, useCallback } = React;

const TYPE_VAR = {
  res2:'--t-res2', res1:'--t-res1', comm:'--t-comm', circ:'--t-circ',
  amen:'--t-amen', park:'--t-park', util:'--t-util', out:'--t-out', exist:'--t-exist',
};
const typeVar = k => `var(${TYPE_VAR[k] || '--t-circ'})`;
const TYPE_LABEL = {
  res2:'2-Bedroom', res1:'1-Bedroom', comm:'Commercial', circ:'Circulation',
  amen:'Amenity', park:'Parking', util:'Service / WC', out:'Balcony', exist:'Existing',
};

/* ---- small bits ---- */
function Chip({ typeKey, children }) {
  return (
    <span className="chip" style={{ background:`color-mix(in srgb, ${typeVar(typeKey)} 16%, transparent)`, color:typeVar(typeKey) }}>
      <span className="dot" style={{ background:typeVar(typeKey) }}></span>{children}
    </span>
  );
}

function Legend({ types, showDims }) {
  return (
    <div className="legend">
      {types.map(t => (
        <div className="item" key={t}>
          <span className="sw" style={{ background:`color-mix(in srgb, ${typeVar(t)} 22%, transparent)`, border:`1.5px solid ${typeVar(t)}` }}></span>
          {TYPE_LABEL[t]}
        </div>
      ))}
    </div>
  );
}

/* ---- schematic floor plan ---- */
function SchematicPlan({ floor, activeLink, onZoneClick, showLabels = true }) {
  return (
    <div className="schematic" style={{ aspectRatio:String(floor.aspect) }}>
      <div className="compass"><span>N<b>↑</b></span></div>
      {floor.zones.map((z, i) => {
        const clickable = !!z.link && !!onZoneClick;
        const isActive = z.link && z.link === activeLink;
        return (
          <div
            key={i}
            className={'zone' + (clickable ? ' clickable' : '') + (isActive ? ' active' : '')}
            style={{ left:z.x+'%', top:z.y+'%', width:z.w+'%', height:z.h+'%', '--zc':typeVar(z.type) }}
            onClick={clickable ? () => onZoneClick(z) : undefined}
            title={z.label + (z.sub ? ' · ' + z.sub : '')}
          >
            {showLabels && <span className="zl">{z.label}</span>}
            {showLabels && z.sub && <span className="zs">{z.sub}</span>}
            {z.ticks && <span className="ticks">{Array.from({length:z.ticks}).map((_,k)=><i key={k}></i>)}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---- building stack rail ---- */
function BuildingStack({ stack, currentId, onSelect }) {
  return (
    <div className="stack-rail">
      <div className="rl tick">Building Section</div>
      <div className="stack">
        {stack.map(s => {
          const active = s.floors.includes(currentId);
          return (
            <div key={s.level} className={'stack-floor' + (active ? ' on' : '')}
                 onClick={() => onSelect(s.floors[0])}>
              <div className="lv">{s.level}</div>
              <div className="nm">{s.label}</div>
              {s.floors.length > 1 ? (
                <div className="stack-sub">
                  <button className={currentId==='l2comm'?'on':''} onClick={(e)=>{e.stopPropagation();onSelect('l2comm');}}>Comm</button>
                  <button className={currentId==='l2res'?'on':''} onClick={(e)=>{e.stopPropagation();onSelect('l2res');}}>Res</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="rl tick" style={{ marginTop:22 }}>Legend</div>
      <Legend types={['res2','res1','comm','amen','circ','park','out']} />
    </div>
  );
}

/* ---- unit detail panel ---- */
function MiniUnit({ unit }) {
  // tiny abstract plan: living + beds + bath stacked
  const beds = Array.from({ length: unit.beds });
  return (
    <div className="ud-mini">
      <div className="zone" style={{ left:'4%', top:'6%', width:'54%', height:'56%', '--zc':typeVar(unit.type) }}>
        <span className="zl">Living / Dining</span>
      </div>
      <div className="zone" style={{ left:'4%', top:'66%', width:'40%', height:'28%', '--zc':'var(--t-circ)' }}>
        <span className="zl" style={{fontSize:9}}>Kitchen</span>
      </div>
      {beds.map((_, i) => (
        <div key={i} className="zone" style={{ left:'60%', top:(6 + i*30)+'%', width:'36%', height:'26%', '--zc':typeVar(unit.type) }}>
          <span className="zl" style={{fontSize:9}}>Bed {i+1}</span>
        </div>
      ))}
      <div className="zone" style={{ left:'46%', top:'66%', width:'12%', height:'28%', '--zc':'var(--t-util)' }}>
        <span className="zl" style={{fontSize:8}}>WC</span>
      </div>
    </div>
  );
}

function UnitDetail({ unit, parkReq }) {
  if (!unit) {
    return (
      <div>
        <div className="card-title tick">Unit Detail</div>
        <p className="ud-empty">Select a highlighted unit on the plan to inspect its program, area and parking demand.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="card-title tick">Unit Detail</div>
      <div className="ud-big">
        <span className="n">#{unit.id}</span>
        <Chip typeKey={unit.type}>{TYPE_LABEL[unit.type]}</Chip>
      </div>
      <div className="ud-sf" style={{ marginTop:6 }}>{unit.sf.toLocaleString()} sf · {unit.floor} floor</div>
      <MiniUnit unit={unit} />
      <div className="stat-row"><span className="l">Bedrooms</span><span className="v">{unit.beds}</span></div>
      <div className="stat-row"><span className="l">Bathrooms</span><span className="v">{unit.baths}</span></div>
      <div className="stat-row"><span className="l">Balcony</span><span className="v">{unit.balcony}</span></div>
      <div className="stat-row"><span className="l">Parking req.</span><span className="v">{parkReq} sp</span></div>
      <div className="stat-row"><span className="l">Position</span><span className="v" style={{fontSize:10}}>{unit.note}</span></div>
    </div>
  );
}

/* ---- CAD lightbox (pan / zoom over the real drawing) ---- */
function CadLightbox({ src, title, sheet, onClose }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const st = useRef({ scale:1, tx:0, ty:0, drag:false, sx:0, sy:0, bx:0, by:0 });
  const [scaleLabel, setScaleLabel] = useState(100);

  const apply = useCallback(() => {
    const s = st.current;
    if (imgRef.current) imgRef.current.style.transform =
      `translate(-50%,-50%) translate(${s.tx}px,${s.ty}px) scale(${s.scale})`;
    setScaleLabel(Math.round(s.scale * 100));
  }, []);

  const fit = useCallback(() => {
    const c = canvasRef.current, im = imgRef.current;
    if (!c || !im || !im.naturalWidth) return;
    const s = Math.min(c.clientWidth / im.naturalWidth, c.clientHeight / im.naturalHeight) * 0.94;
    st.current.scale = s; st.current.tx = 0; st.current.ty = 0; apply();
  }, [apply]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const zoom = (f) => { const s = st.current; s.scale = Math.max(0.1, Math.min(8, s.scale * f)); apply(); };

  return ReactDOM.createPortal((
    <div className="lightbox">
      <div className="lb-bar">
        <div className="t">{title}<span>Sheet {sheet} · source drawing · 1/4″ = 1′-0″</span></div>
        <div className="lb-tools">
          <button onClick={() => zoom(1/1.25)} title="Zoom out">−</button>
          <button onClick={() => zoom(1.25)} title="Zoom in">+</button>
          <button onClick={fit} title="Fit" style={{fontSize:12}}>⤢</button>
          <button className="close" onClick={onClose}>Close ✕</button>
        </div>
      </div>
      <div
        className="lb-canvas"
        ref={canvasRef}
        onMouseDown={e => { const s=st.current; s.drag=true; s.sx=e.clientX; s.sy=e.clientY; s.bx=s.tx; s.by=s.ty; e.currentTarget.classList.add('grab'); }}
        onMouseMove={e => { const s=st.current; if(!s.drag) return; s.tx=s.bx+(e.clientX-s.sx); s.ty=s.by+(e.clientY-s.sy); apply(); }}
        onMouseUp={e => { st.current.drag=false; e.currentTarget.classList.remove('grab'); }}
        onMouseLeave={e => { st.current.drag=false; e.currentTarget.classList.remove('grab'); }}
        onWheel={e => { const s=st.current; const f=e.deltaY<0?1.1:0.9; s.scale=Math.max(0.1,Math.min(8,s.scale*f)); apply(); }}
      >
        <img ref={imgRef} src={src} alt={title} onLoad={fit} draggable="false" />
        <div className="lb-scale">{scaleLabel}% · drag to pan · scroll to zoom</div>
      </div>
    </div>
  ), document.body);
}

Object.assign(window, { Chip, Legend, SchematicPlan, BuildingStack, UnitDetail, MiniUnit, CadLightbox, typeVar, TYPE_LABEL });
