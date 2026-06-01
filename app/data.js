/* =========================================================================
   4192 (4191–4193) El Camino Real — Mixed-Use Condo/Apartments
   Building data model.  All figures transcribed from the SJA Development
   drawing set (Sheets A-2 / A-3 / A-4).  Schematic zone layouts are
   approximate, for navigation only — see source drawings for dimensions.
   ========================================================================= */
window.BUILDING = (function () {
  // ---- room / use type palette (color tokens resolved per theme via CSS vars)
  const TYPES = {
    res2:   { key: 'res2',   label: '2-Bedroom',     swatch: 'var(--t-res2)' },
    res1:   { key: 'res1',   label: '1-Bedroom',     swatch: 'var(--t-res1)' },
    comm:   { key: 'comm',   label: 'Commercial',    swatch: 'var(--t-comm)' },
    circ:   { key: 'circ',   label: 'Circulation',   swatch: 'var(--t-circ)' },
    amen:   { key: 'amen',   label: 'Amenity',       swatch: 'var(--t-amen)' },
    park:   { key: 'park',   label: 'Parking',       swatch: 'var(--t-park)' },
    util:   { key: 'util',   label: 'Service / WC',  swatch: 'var(--t-util)' },
    out:    { key: 'out',    label: 'Balcony / Open',swatch: 'var(--t-out)' },
    exist:  { key: 'exist',  label: 'Existing',      swatch: 'var(--t-exist)' },
  };

  const project = {
    name: 'Mixed-Use Condominiums & Apartments',
    address: '4191–4193 El Camino Real',
    city: 'Palo Alto, CA 94306',
    parcelNote: 'El Camino Real frontage · Santa Clara County',
    submittal: 'Planning Submittal — City of Palo Alto',
    phase: 'Pre-Application / Design Review',
    preparedBy: 'Megan Ho',
    date: '05 / 31 / 2026',
    drawingSet: 'SJA Development LLC — Design Division',
    drawingSetAddr: '562 Bryant Street, San Francisco, CA 94107 · (415) 684-0632',
    jobNo: '2013-111',
    stories: 4,
    footprint: '73′-9″ × 50′-1″ (ground) · 78′-9″ frontage',
  };

  // ---- at-a-glance project totals
  const totals = {
    stories: 4,
    resUnits: 12,
    commUnits: 2,
    commSf: 3083,
    parkingProvided: 25.75,
    guestParking: 2,
    bikeParking: 10,
    fitnessSf: 861,
    twoBed: 7,
    oneBed: 5,
  };

  // ---- parking code rates (per drawing-set general notes, Sheet A-2)
  const parkingRates = {
    studio: 1.25, oneBed: 1.5, twoBed: 2.0,
    commercial: '1 / 300 sf', commBike: '1 / 3,000 sf', resBike: '1 / unit',
    guest: '1 space + 10% of units',
    coveredNote: 'At least one space per unit must be covered.',
    tandemNote: 'Tandem allowed for any unit needing two spaces, up to 25% of required spaces (projects > 4 units).',
  };

  // ---- units (transcribed from A-3 / A-4) -------------------------------
  const units = [
    { id: 1,  floor: '2nd', type: 'res2', beds: 2, baths: 2, sf: 932, balcony: 'North',  note: 'NW corner · dual-aspect' },
    { id: 2,  floor: '2nd', type: 'res2', beds: 2, baths: 2, sf: 896, balcony: 'North',  note: 'NE corner' },
    { id: 3,  floor: '2nd', type: 'res2', beds: 2, baths: 1, sf: 882, balcony: 'South',  note: 'SW corner' },
    { id: 4,  floor: '2nd', type: 'res1', beds: 1, baths: 1, sf: 608, balcony: 'South',  note: 'SE · compact 1-bed' },
    { id: 5,  floor: '3rd', type: 'res2', beds: 2, baths: 2, sf: 900, balcony: 'North',  note: 'NW corner' },
    { id: 6,  floor: '3rd', type: 'res2', beds: 2, baths: 2, sf: 900, balcony: 'North',  note: 'NE corner' },
    { id: 7,  floor: '3rd', type: 'res1', beds: 1, baths: 1, sf: 800, balcony: 'South',  note: 'SW corner' },
    { id: 8,  floor: '3rd', type: 'res1', beds: 1, baths: 1, sf: 590, balcony: 'South',  note: 'SE · compact 1-bed' },
    { id: 9,  floor: '4th', type: 'res2', beds: 2, baths: 2, sf: 900, balcony: 'North',  note: 'NW corner' },
    { id: 10, floor: '4th', type: 'res2', beds: 2, baths: 2, sf: 900, balcony: 'North',  note: 'NE corner' },
    { id: 11, floor: '4th', type: 'res1', beds: 1, baths: 1, sf: 720, balcony: 'South',  note: 'SW corner' },
    { id: 12, floor: '4th', type: 'res1', beds: 1, baths: 1, sf: 590, balcony: 'South',  note: 'SE · compact 1-bed' },
  ];

  const commercial = [
    { id: 'C1', label: 'Commercial Unit #1', sf: 1550, parking: 5, frontage: 'El Camino Real' },
    { id: 'C2', label: 'Commercial Unit #2', sf: 1533, parking: 5, frontage: 'El Camino Real' },
  ];

  const amenities = [
    { label: 'Fitness & Wellness Center', detail: '≈ 861 sf · ground level' },
    { label: 'Resident Lobby',           detail: 'Ground · El Camino entry' },
    { label: 'Secure Bike Parking',      detail: '10 spaces' },
    { label: 'Private Balconies',        detail: 'North & South, all res. floors' },
    { label: 'Passenger Elevator',       detail: 'Serves all 4 levels' },
    { label: 'Two Egress Stairs',        detail: '110 sf each core' },
    { label: 'Resident Storage',         detail: 'Ground level' },
    { label: 'Stack Parking',            detail: '2 stalls × 2 cars' },
  ];

  // ---- schematic floor layouts -----------------------------------------
  // Zones use a 0–100 grid; container aspect set per floor. type → color.
  // unit:<id> links a zone to a residential unit; comm:<id> to commercial.
  const F = {};

  F.ground = {
    id: 'ground', sheet: 'A-2', tab: 'Site / Ground', level: 'L1',
    title: 'Site & Ground Floor', use: 'Parking · Amenity · Retail core',
    scale: '1/4″ = 1′-0″', aspect: 1.62,
    stats: [
      ['Total parking', '25.75 spaces'],
      ['Guest parking', '2 spaces'],
      ['Bike parking', '10 spaces'],
      ['Stack parking', '2 stalls × 2 cars'],
      ['Fitness & Wellness', '≈ 861 sf'],
      ['Restrooms', '2'],
    ],
    zones: [
      { x: 3,  y: 4,  w: 94, h: 34, type: 'park',  label: 'Surface & Stack Parking', sub: '25.75 spaces' },
      { x: 3,  y: 39, w: 20, h: 13, type: 'park',  label: 'Bike', sub: '10 sp' },
      { x: 26, y: 44, w: 14, h: 30, type: 'amen',  label: 'Storage' },
      { x: 26, y: 75, w: 14, h: 21, type: 'util',  label: 'WC ×2' },
      { x: 41, y: 50, w: 27, h: 30, type: 'amen',  label: 'Fitness & Wellness', sub: '≈ 861 sf' },
      { x: 41, y: 81, w: 33, h: 15, type: 'exist', label: 'Existing Dental Center' },
      { x: 69, y: 50, w: 13, h: 30, type: 'circ',  label: 'Elev + Stair' },
      { x: 83, y: 50, w: 14, h: 22, type: 'amen',  label: 'Lobby' },
      { x: 83, y: 74, w: 14, h: 22, type: 'park',  label: 'Bike Rm' },
    ],
  };

  F.l2comm = {
    id: 'l2comm', sheet: 'A-3', tab: '2nd — Commercial', level: 'L2',
    title: 'Second Floor — Commercial', use: '2 retail / office tenancies',
    scale: '1/4″ = 1′-0″', aspect: 1.55,
    stats: [
      ['Commercial Unit #1', '1,550 sf'],
      ['Commercial Unit #2', '1,533 sf'],
      ['Parking required', '10 spaces'],
      ['Restrooms', 'ADA women + men'],
      ['Balconies', '4 (N + S)'],
    ],
    zones: [
      { x: 6,  y: 0,  w: 38, h: 7,  type: 'out',  label: 'Balcony' },
      { x: 56, y: 0,  w: 38, h: 7,  type: 'out',  label: 'Balcony' },
      { x: 4,  y: 9,  w: 40, h: 82, type: 'comm', link: 'comm:C1', label: 'Commercial #1', sub: '1,550 sf' },
      { x: 52, y: 9,  w: 44, h: 58, type: 'comm', link: 'comm:C2', label: 'Commercial #2', sub: '1,533 sf' },
      { x: 45, y: 22, w: 6,  h: 30, type: 'circ', label: 'Stair' },
      { x: 52, y: 70, w: 20, h: 21, type: 'util', label: 'ADA Restrooms', sub: 'W / M' },
      { x: 74, y: 70, w: 8,  h: 21, type: 'circ', label: 'Elev' },
      { x: 84, y: 70, w: 12, h: 21, type: 'circ', label: 'Stair' },
      { x: 6,  y: 93, w: 38, h: 7,  type: 'out',  label: 'Balcony' },
      { x: 56, y: 93, w: 38, h: 7,  type: 'out',  label: 'Balcony' },
    ],
  };

  // typical residential quadrant layout, parameterised per floor
  function resFloor(id, sheet, tab, level, title, ids, sfs, types) {
    return {
      id, sheet, tab, level, title, use: 'Residential — 4 dwelling units',
      scale: '1/4″ = 1′-0″', aspect: 1.55,
      stats: [
        ['Units this floor', '4'],
        ['Parking spaces', id === 'l3' ? '7' : id === 'l4' ? '7' : '7.5'],
        ['2-bedroom', String(types.filter(t => t === 'res2').length)],
        ['1-bedroom', String(types.filter(t => t === 'res1').length)],
        ['Balconies', 'N + S'],
      ],
      zones: [
        { x: 6,  y: 0,  w: 38, h: 7,  type: 'out', label: 'Balcony' },
        { x: 56, y: 0,  w: 38, h: 7,  type: 'out', label: 'Balcony' },
        { x: 4,  y: 9,  w: 40, h: 38, type: types[0], link: 'unit:' + ids[0], label: 'Unit #' + ids[0], sub: sfs[0] + ' sf' },
        { x: 56, y: 9,  w: 40, h: 38, type: types[1], link: 'unit:' + ids[1], label: 'Unit #' + ids[1], sub: sfs[1] + ' sf' },
        { x: 4,  y: 53, w: 40, h: 38, type: types[2], link: 'unit:' + ids[2], label: 'Unit #' + ids[2], sub: sfs[2] + ' sf' },
        { x: 60, y: 53, w: 36, h: 38, type: types[3], link: 'unit:' + ids[3], label: 'Unit #' + ids[3], sub: sfs[3] + ' sf' },
        { x: 45, y: 12, w: 10, h: 26, type: 'circ', label: 'Stair' },
        { x: 46, y: 42, w: 8,  h: 16, type: 'circ', label: 'Elev' },
        { x: 45, y: 60, w: 10, h: 28, type: 'circ', label: 'Stair' },
        { x: 6,  y: 93, w: 38, h: 7,  type: 'out', label: 'Balcony' },
        { x: 56, y: 93, w: 38, h: 7,  type: 'out', label: 'Balcony' },
      ],
    };
  }

  F.l2res = resFloor('l2res', 'A-3', '2nd — Residential', 'L2', 'Second Floor — Residential',
    [1, 2, 3, 4], [932, 896, 882, 608], ['res2', 'res2', 'res2', 'res1']);
  F.l3 = resFloor('l3', 'A-4', '3rd Floor', 'L3', 'Third Floor',
    [5, 6, 7, 8], [900, 900, 800, 590], ['res2', 'res2', 'res1', 'res1']);
  F.l4 = resFloor('l4', 'A-4', '4th Floor', 'L4', 'Fourth Floor',
    [9, 10, 11, 12], [900, 900, 720, 590], ['res2', 'res2', 'res1', 'res1']);

  // source CAD images (extracted from original viewer)
  const cad = {
    ground: 'project/plans/img-site.jpg',
    l2comm: 'project/plans/img-2nd_comm.jpg',
    l2res:  'project/plans/img-2nd_res.jpg',
    l3:     'project/plans/img-3rd.jpg',
    l4:     'project/plans/img-4th.jpg',
  };

  // floor display order for stack nav & explorer
  const order = ['ground', 'l2comm', 'l2res', 'l3', 'l4'];
  const floors = order.map(k => F[k]);

  // sheet index
  const sheets = [
    { sheet: 'A-2', title: 'Site / Ground Floor Plan', floor: 'ground' },
    { sheet: 'A-3', title: '2nd Floor — Commercial',   floor: 'l2comm' },
    { sheet: 'A-3', title: '2nd Floor — Residential',  floor: 'l2res' },
    { sheet: 'A-4', title: '3rd Floor Plan',           floor: 'l3' },
    { sheet: 'A-4', title: '4th Floor Plan',           floor: 'l4' },
  ];

  // building stack model (for the vertical section nav)
  const stack = [
    { level: 'L4', label: '4th — Residential', floors: ['l4'],            tone: 'res' },
    { level: 'L3', label: '3rd — Residential', floors: ['l3'],            tone: 'res' },
    { level: 'L2', label: '2nd — Comm / Res',  floors: ['l2comm', 'l2res'], tone: 'mix' },
    { level: 'L1', label: 'Ground — Parking',  floors: ['ground'],        tone: 'base' },
  ];

  return {
    project, totals, parkingRates, units, commercial, amenities,
    TYPES, floors, F, cad, sheets, stack, order,
  };
})();
