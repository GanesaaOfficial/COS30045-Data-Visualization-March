/* global d3, innerChartS, innerW, innerH, xScaleS, yScaleS, colorScale */

function drawScatterplot(data) {
  innerChartS.selectAll('*').remove();

  if (!data || data.length === 0) {
    innerChartS.append('text')
      .attr('x', 0)
      .attr('y', 18)
      .attr('fill', '#6b7280')
      .style('font-weight', 800)
      .text('No data for current filters.');
    return;
  }

  // Domains: star ratings (x) and energy consumption (y)
  xScaleS.domain(d3.extent(data, d => d.rating)).nice();
  yScaleS.domain(d3.extent(data, d => d.energy)).nice();

  // Axes
  innerChartS.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(xScaleS).ticks(5));

  innerChartS.append('g')
    .call(d3.axisLeft(yScaleS).ticks(5));

  // Axis labels
  innerChartS.append('text')
    .attr('x', innerW)
    .attr('y', innerH + 34)
    .attr('text-anchor', 'end')
    .attr('fill', '#6b7280')
    .style('font-weight', 800)
    .style('font-size', '11px')
    .text('Star rating');

  innerChartS.append('text')
    .attr('x', 0)
    .attr('y', -10)
    .attr('fill', '#6b7280')
    .style('font-weight', 800)
    .style('font-size', '11px')
    .text('Energy consumption');

  // Data points (colour encodes screen type)
  innerChartS.selectAll('circle.scatter-point')
    .data(data, (d, i) => `${d.brand}-${d.screenTech}-${i}`)
    .join('circle')
    .attr('class', 'scatter-point')
    .attr('cx', d => xScaleS(d.rating))
    .attr('cy', d => yScaleS(d.energy))
    .attr('r', 7)
    .attr('fill', d => colorScale(d.screenTech))
    .attr('opacity', 0.5);

  drawScatterLegend();
}

function drawScatterLegend() {
  const entries = colorScale.domain();
  if (!entries || entries.length === 0) return;

  const legend = innerChartS.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${innerW - 140}, 8)`);

  legend.append('rect')
    .attr('x', -10)
    .attr('y', -6)
    .attr('width', 150)
    .attr('height', entries.length * 18 + 18)
    .attr('rx', 10)
    .attr('fill', 'rgba(255,255,255,0.85)')
    .attr('stroke', '#e5e7eb');

  legend.append('text')
    .attr('x', 0)
    .attr('y', 10)
    .attr('fill', '#111827')
    .style('font-weight', 800)
    .style('font-size', '11px')
    .text('Screen tech');

  const row = legend.selectAll('g.item')
    .data(entries)
    .join('g')
    .attr('class', 'item')
    .attr('transform', (d, i) => `translate(0, ${22 + i * 18})`);

  row.append('circle')
    .attr('cx', 8)
    .attr('cy', 0)
    .attr('r', 5)
    .attr('fill', d => colorScale(d));

  row.append('text')
    .attr('x', 18)
    .attr('y', 4)
    .attr('fill', '#374151')
    .style('font-size', '12px')
    .style('font-weight', 700)
    .text(d => d);
}
