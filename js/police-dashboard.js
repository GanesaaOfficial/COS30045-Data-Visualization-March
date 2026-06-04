/* global d3 */
(() => {
  const DATA_PATH = 'data/police_enforcement_2024_fines.csv';

  const parseDate = d3.timeParse('%Y-%m-%d');
  const fmtMonth = d3.timeFormat('%b %Y');
  const fmtNumber = d3.format(',');

  const tooltip = d3.select('#tooltip');
  const statusNode = d3.select('#status');

  function setStatus(message, kind) {
    if (statusNode.empty()) return;
    statusNode
      .attr('class', `status ${kind === 'error' ? 'is-error' : kind === 'loading' ? 'is-loading' : ''}`.trim())
      .text(message);
  }

  const state = {
    jurisdiction: 'All',
    location: 'All',
    metric: 'All',
    ageGroup: 'All',
    method: 'All'
  };

  let fullData = [];

  function uniqSorted(values) {
    return Array.from(new Set(values)).filter(v => v != null && v !== '').sort(d3.ascending);
  }

  function setSelectOptions(sel, values, current) {
    const options = ['All', ...values];
    sel.selectAll('option')
      .data(options, d => d)
      .join('option')
      .attr('value', d => d)
      .text(d => d);
    sel.property('value', current);
  }

  function readStateFromUI() {
    state.jurisdiction = d3.select('#jurisdiction').property('value');
    state.location = d3.select('#location').property('value');
    state.metric = d3.select('#metric').property('value');
    state.ageGroup = d3.select('#ageGroup').property('value');
    state.method = d3.select('#method').property('value');
  }

  function applyFilters(data) {
    return data.filter(d =>
      (state.jurisdiction === 'All' || d.jurisdiction === state.jurisdiction) &&
      (state.location === 'All' || d.location === state.location) &&
      (state.metric === 'All' || d.metric === state.metric) &&
      (state.ageGroup === 'All' || d.ageGroup === state.ageGroup) &&
      (state.method === 'All' || d.method === state.method)
    );
  }

  function updateKPIs(data) {
    const totalFines = d3.sum(data, d => d.fines);
    const totalCharges = d3.sum(data, d => d.charges);
    const totalArrests = d3.sum(data, d => d.arrests);

    d3.select('#kpi-fines').text(fmtNumber(totalFines));
    d3.select('#kpi-charges').text(fmtNumber(totalCharges));
    d3.select('#kpi-arrests').text(fmtNumber(totalArrests));
  }

  function updateInsights(data) {
    const list = d3.select('#auto-insights');
    if (list.empty()) return;

    const totalFines = d3.sum(data, d => d.fines);
    const topJur = d3.rollups(data, v => d3.sum(v, d => d.fines), d => d.jurisdiction)
      .sort((a, b) => d3.descending(a[1], b[1]))[0];
    const topMetric = d3.rollups(data, v => d3.sum(v, d => d.fines), d => d.metric)
      .sort((a, b) => d3.descending(a[1], b[1]))[0];

    const byMonth = d3.rollups(data, v => d3.sum(v, d => d.fines), d => d3.timeMonth.floor(d.startDate))
      .sort((a, b) => d3.ascending(a[0], b[0]));
    const peakMonth = byMonth.sort((a, b) => d3.descending(a[1], b[1]))[0];

    const items = [];
    items.push(`Showing ${fmtNumber(data.length)} records (${fmtNumber(totalFines)} total fines).`);
    if (topJur) items.push(`Highest fines jurisdiction: ${topJur[0]} (${fmtNumber(topJur[1])}).`);
    if (topMetric) items.push(`Top fine metric: ${topMetric[0]} (${fmtNumber(topMetric[1])}).`);
    if (peakMonth && peakMonth[0]) items.push(`Peak month: ${fmtMonth(peakMonth[0])} (${fmtNumber(peakMonth[1])} fines).`);

    list.selectAll('li')
      .data(items)
      .join('li')
      .text(d => d);
  }

  function showTooltip(event, html) {
    tooltip.style('opacity', 1).html(html);
    const [x, y] = d3.pointer(event, document.body);
    tooltip.style('left', (x + 16) + 'px').style('top', (y - 12) + 'px');
  }

  function hideTooltip() {
    tooltip.style('opacity', 0);
  }

  function mountSvg(containerId, viewW, viewH) {
    d3.select(containerId).selectAll('svg').remove();
    return d3.select(containerId)
      .append('svg')
      .attr('viewBox', `0 0 ${viewW} ${viewH}`);
  }

  function renderTrend(data) {
    const svg = mountSvg('#trend', 520, 320);
    const margin = { top: 20, right: 18, bottom: 52, left: 62 };
    const w = 520 - margin.left - margin.right;
    const h = 320 - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const byMonth = Array.from(
      d3.rollup(
        data,
        v => d3.sum(v, d => d.fines),
        d => d3.timeMonth.floor(d.startDate)
      ),
      ([month, fines]) => ({ month, fines })
    ).sort((a, b) => d3.ascending(a.month, b.month));

    if (!byMonth.length) {
      g.append('text').attr('x', 0).attr('y', 18).attr('fill', '#6b7280').text('No data for current filters.');
      return;
    }

    const x = d3.scaleTime().domain(d3.extent(byMonth, d => d.month)).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(byMonth, d => d.fines)]).nice().range([h, 0]);

    g.append('g')
      .attr('class', 'gridlines')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(''));

    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(6));
    g.append('g').call(d3.axisLeft(y).ticks(5));

    g.append('text').attr('x', 0).attr('y', -6).attr('fill', '#6b7280').style('font-weight', 800).style('font-size', '11px').text('Fines');

    const line = d3.line().x(d => x(d.month)).y(d => y(d.fines));
    g.append('path')
      .datum(byMonth)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 3)
      .attr('d', line);

    g.selectAll('circle')
      .data(byMonth)
      .join('circle')
      .attr('cx', d => x(d.month))
      .attr('cy', d => y(d.fines))
      .attr('r', 4)
      .attr('fill', '#2563eb')
      .on('mousemove', (event, d) => showTooltip(event, `<strong>${fmtMonth(d.month)}</strong><br>Fines: ${fmtNumber(d.fines)}`))
      .on('mouseleave', hideTooltip);
  }

  function renderMetricBars(data) {
    const svg = mountSvg('#metrics', 520, 320);
    const margin = { top: 16, right: 22, bottom: 36, left: 190 };
    const w = 520 - margin.left - margin.right;
    const h = 320 - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const rolled = Array.from(
      d3.rollup(data, v => d3.sum(v, d => d.fines), d => d.metric),
      ([metric, fines]) => ({ metric, fines })
    ).sort((a, b) => d3.descending(a.fines, b.fines));

    const top = rolled.slice(0, 10);

    if (!top.length) {
      g.append('text').attr('x', 0).attr('y', 18).attr('fill', '#6b7280').text('No data for current filters.');
      return;
    }

    const x = d3.scaleLinear().domain([0, d3.max(top, d => d.fines)]).nice().range([0, w]);
    const y = d3.scaleBand().domain(top.map(d => d.metric)).range([0, h]).padding(0.18);

    g.append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(4).tickSize(-h).tickFormat(''));

    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(4));
    g.append('g').call(d3.axisLeft(y));

    const bars = g.selectAll('rect')
      .data(top)
      .join('rect')
      .attr('x', 0)
      .attr('y', d => y(d.metric))
      .attr('height', y.bandwidth())
      .attr('fill', '#0ea5e9')
      .on('mousemove', (event, d) => showTooltip(event, `<strong>${d.metric}</strong><br>Fines: ${fmtNumber(d.fines)}`))
      .on('mouseleave', hideTooltip);

    bars
      .attr('width', 0)
      .transition()
      .duration(450)
      .attr('width', d => x(d.fines));

    g.selectAll('.value')
      .data(top)
      .join('text')
      .attr('class', 'value')
      .attr('x', d => x(d.fines) + 6)
      .attr('y', d => (y(d.metric) ?? 0) + y.bandwidth() / 2 + 4)
      .attr('fill', '#6b7280')
      .style('font-weight', 800)
      .style('font-size', '11px')
      .text(d => fmtNumber(d.fines));
  }

  function renderJurisdictionDonut(data) {
    const svg = mountSvg('#jurisdictions', 520, 320);
    const w = 520, h = 320;

    const rolled = Array.from(
      d3.rollup(data, v => d3.sum(v, d => d.fines), d => d.jurisdiction),
      ([jurisdiction, fines]) => ({ jurisdiction, fines })
    ).sort((a, b) => d3.descending(a.fines, b.fines));

    if (!rolled.length) {
      svg.append('text').attr('x', 18).attr('y', 28).attr('fill', '#6b7280').text('No data for current filters.');
      return;
    }

    const radius = Math.min(w, h) / 2 - 34;
    const g = svg.append('g').attr('transform', `translate(${w / 2},${h / 2})`);

    const color = d3.scaleOrdinal()
      .domain(rolled.map(d => d.jurisdiction))
      .range(d3.schemeTableau10.concat(d3.schemeSet3));

    const pie = d3.pie().value(d => d.fines);
    const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);

    g.selectAll('path')
      .data(pie(rolled))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.jurisdiction))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .on('mousemove', (event, d) => showTooltip(event, `<strong>${d.data.jurisdiction}</strong><br>Fines: ${fmtNumber(d.data.fines)}`))
      .on('mouseleave', hideTooltip);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#111827')
      .style('font-weight', 800)
      .text('Fines');
  }

  function renderAgeBars(data) {
    const svg = mountSvg('#ages', 520, 320);
    const margin = { top: 16, right: 18, bottom: 56, left: 62 };
    const w = 520 - margin.left - margin.right;
    const h = 320 - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const rolled = Array.from(
      d3.rollup(data, v => d3.sum(v, d => d.fines), d => d.ageGroup),
      ([ageGroup, fines]) => ({ ageGroup, fines })
    ).sort((a, b) => d3.descending(a.fines, b.fines));

    if (!rolled.length) {
      g.append('text').attr('x', 0).attr('y', 18).attr('fill', '#6b7280').text('No data for current filters.');
      return;
    }

    const x = d3.scaleBand().domain(rolled.map(d => d.ageGroup)).range([0, w]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(rolled, d => d.fines)]).nice().range([h, 0]);

    g.append('g')
      .attr('class', 'gridlines')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(''));

    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x)).selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.6em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-30)');
    g.append('g').call(d3.axisLeft(y).ticks(5));

    const bars = g.selectAll('rect')
      .data(rolled)
      .join('rect')
      .attr('x', d => x(d.ageGroup))
      .attr('width', x.bandwidth())
      .attr('y', h)
      .attr('height', 0)
      .attr('fill', '#22c55e')
      .on('mousemove', (event, d) => showTooltip(event, `<strong>${d.ageGroup}</strong><br>Fines: ${fmtNumber(d.fines)}`))
      .on('mouseleave', hideTooltip);

    bars.transition()
      .duration(450)
      .attr('y', d => y(d.fines))
      .attr('height', d => h - y(d.fines));
  }

  function updateAll() {
    const filtered = applyFilters(fullData);
    updateKPIs(filtered);
    updateInsights(filtered);
    renderTrend(filtered);
    renderMetricBars(filtered);
    renderJurisdictionDonut(filtered);
    renderAgeBars(filtered);
  }

  function wireUI() {
    const jurSel = d3.select('#jurisdiction');
    const locSel = d3.select('#location');
    const metSel = d3.select('#metric');
    const ageSel = d3.select('#ageGroup');
    const mthSel = d3.select('#method');

    setSelectOptions(jurSel, uniqSorted(fullData.map(d => d.jurisdiction)), state.jurisdiction);
    setSelectOptions(locSel, uniqSorted(fullData.map(d => d.location)), state.location);
    setSelectOptions(metSel, uniqSorted(fullData.map(d => d.metric)), state.metric);
    setSelectOptions(ageSel, uniqSorted(fullData.map(d => d.ageGroup)), state.ageGroup);
    setSelectOptions(mthSel, uniqSorted(fullData.map(d => d.method)), state.method);

    function onChange() {
      readStateFromUI();
      updateAll();
    }

    jurSel.on('change', onChange);
    locSel.on('change', onChange);
    metSel.on('change', onChange);
    ageSel.on('change', onChange);
    mthSel.on('change', onChange);

    d3.select('#reset').on('click', () => {
      state.jurisdiction = 'All';
      state.location = 'All';
      state.metric = 'All';
      state.ageGroup = 'All';
      state.method = 'All';
      jurSel.property('value', 'All');
      locSel.property('value', 'All');
      metSel.property('value', 'All');
      ageSel.property('value', 'All');
      mthSel.property('value', 'All');
      updateAll();
    });
  }

  setStatus('Loading dataset…', 'loading');

  d3.csv(DATA_PATH, d => ({
    year: +d.YEAR,
    startDate: parseDate(d.START_DATE),
    endDate: parseDate(d.END_DATE),
    jurisdiction: d.JURISDICTION,
    location: d.LOCATION,
    ageGroup: d.AGE_GROUP,
    metric: d.METRIC,
    method: d.DETECTION_METHOD,
    fines: +d.FINES,
    arrests: +d.ARRESTS,
    charges: +d.CHARGES
  })).then(data => {
    fullData = data.filter(d => d.startDate && d.endDate);
    console.log('Loaded police enforcement rows:', fullData.length);

    const minDate = d3.min(fullData, d => d.startDate);
    const maxDate = d3.max(fullData, d => d.endDate);

    d3.select('#meta-rows').text(`Rows: ${fmtNumber(fullData.length)}`);
    d3.select('#meta-range').text(minDate && maxDate ? `Range: ${fmtMonth(minDate)} – ${fmtMonth(maxDate)}` : 'Range: —');
    d3.select('#meta-j').text(`Jurisdictions: ${uniqSorted(fullData.map(d => d.jurisdiction)).length}`);
    d3.select('#meta-m').text(`Metrics: ${uniqSorted(fullData.map(d => d.metric)).length}`);

    setStatus(`Loaded ${fmtNumber(fullData.length)} records. Use filters to explore.`, 'ok');

    wireUI();
    updateAll();
  }).catch(err => {
    console.error('Failed to load dataset:', err);
    setStatus('Failed to load dataset. Check console for details.', 'error');
    d3.select('#trend').append('p').text('Failed to load dataset. Check the console for details.');
  });
})();
