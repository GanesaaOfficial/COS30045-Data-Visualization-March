/* global d3, innerChartS, tooltipW, tooltipH, tooltipPad */

let tooltipG;
let tooltipText;

function createTooltip() {
  // Recreate tooltip group (safe after redraws)
  innerChartS.selectAll('g.tooltip').remove();

  tooltipG = innerChartS.append('g')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .attr('transform', 'translate(-9999,-9999)');

  tooltipG.append('rect')
    .attr('width', tooltipW)
    .attr('height', tooltipH)
    .attr('rx', 10)
    .attr('fill', 'rgba(52,73,94,0.9)');

  tooltipText = tooltipG.append('text')
    .attr('x', tooltipPad)
    .attr('y', tooltipPad + 14)
    .attr('fill', '#ffffff')
    .style('font-size', '12px')
    .style('font-weight', 800);
}

function handleMouseEvents() {
  if (!tooltipG || !tooltipText) createTooltip();

  innerChartS.selectAll('circle.scatter-point')
    .on('mouseenter', function (e, d) {
      const cx = +this.getAttribute('cx');
      const cy = +this.getAttribute('cy');

      tooltipText.text(`Screen size: ${d.screenSize}\"`);

      // Position tooltip near the point.
      tooltipG
        .attr('transform', `translate(${cx + 12},${Math.max(0, cy - tooltipH - 10)})`)
        .transition()
        .duration(120)
        .style('opacity', 1);

      d3.select(this).attr('r', 10).attr('opacity', 0.85);
    })
    .on('mouseleave', function () {
      tooltipG
        .transition()
        .duration(120)
        .style('opacity', 0)
        .on('end', () => tooltipG.attr('transform', 'translate(-9999,-9999)'));

      d3.select(this).attr('r', 7).attr('opacity', 0.5);
    });
}
