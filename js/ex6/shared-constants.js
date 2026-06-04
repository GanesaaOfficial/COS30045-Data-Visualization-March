/* global d3 */

// Shared chart constants (used by histogram + scatterplot + interactions)
const CHART_W = 500;
const CHART_H = 350;

const margin = { top: 30, right: 20, bottom: 40, left: 50 };
const innerW = CHART_W - margin.left - margin.right;
const innerH = CHART_H - margin.top - margin.bottom;

// Histogram-specific shared selections/scales
const svgH = d3.select('#histogram-target')
  .append('svg')
  .attr('viewBox', `0 0 ${CHART_W} ${CHART_H}`);

const innerChart = svgH.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const xScaleH = d3.scaleLinear().range([0, innerW]);
const yScaleH = d3.scaleLinear().range([innerH, 0]);

// Scatterplot-specific shared selections/scales
const svgS = d3.select('#scatter-target')
  .append('svg')
  .attr('viewBox', `0 0 ${CHART_W} ${CHART_H}`);

// Dedicated inner chart group for scatter plot (kept separate from histogram)
const innerChartS = svgS.append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const xScaleS = d3.scaleLinear().range([0, innerW]);
const yScaleS = d3.scaleLinear().range([innerH, 0]);

// Tooltip dimensions (SVG tooltip group)
const tooltipW = 170;
const tooltipH = 44;
const tooltipPad = 10;

// Colour scale to indicate screen type (domain set after data load)
const colorScale = d3.scaleOrdinal()
  .range(['#e15759', '#f28e2b', '#4e79a7', '#59a14f', '#9c755f', '#bab0ab']);
