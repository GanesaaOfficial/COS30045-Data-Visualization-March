/* global d3, innerChart, innerW, innerH, xScaleH, yScaleH */

function drawHistogram(data) {
  // Clear previous render while reusing the shared innerChart group
  innerChart.selectAll('*').remove();

  if (!data || data.length === 0) {
    innerChart.append('text')
      .attr('x', 0)
      .attr('y', 18)
      .attr('fill', '#6b7280')
      .style('font-weight', 800)
      .text('No data for current filters.');
    return;
  }

  // X domain based on energy consumption bounds
  const xDomain = d3.extent(data, d => d.energy);
  xScaleH.domain([Math.min(0, xDomain[0] ?? 0), xDomain[1] ?? 0]).nice();

  const bins = d3.bin()
    .value(d => d.energy)
    .domain(xScaleH.domain())
    .thresholds(xScaleH.ticks(6))(data);

  yScaleH.domain([0, d3.max(bins, d => d.length) || 0]).nice();

  innerChart.selectAll('rect')
    .data(bins)
    .join('rect')
    .attr('class', 'bar')
    .attr('x', d => xScaleH(d.x0) + 1)
    .attr('y', d => yScaleH(d.length))
    .attr('width', d => Math.max(0, xScaleH(d.x1) - xScaleH(d.x0) - 2))
    .attr('height', d => innerH - yScaleH(d.length));

  innerChart.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(xScaleH).ticks(6));

  innerChart.append('g')
    .call(d3.axisLeft(yScaleH).ticks(5));

  innerChart.append('text')
    .attr('x', 0)
    .attr('y', -10)
    .attr('fill', '#6b7280')
    .style('font-weight', 800)
    .style('font-size', '11px')
    .text('Energy consumption (binned)');
}
