/* global d3, colorScale, drawHistogram, drawScatterplot, createTooltip, handleMouseEvents */

let fullDataset = [];

function normaliseTVRow(d) {
  return {
    brand: d.brand,
    screenTech: d.screenTech,
    screenSize: +d.screenSize,
    energy: +d.energyConsumption,
    rating: +d.starRating
  };
}

function setActiveButton(element) {
  d3.selectAll('.btn').classed('active', false);
  d3.select(element).classed('active', true);
}

function updateCharts(data) {
  drawHistogram(data);
  drawScatterplot(data);
  createTooltip();
  handleMouseEvents();
}

// Global filter engine called by inline onclick handlers in exercise6.html
window.filterEngine = function (techType, element) {
  setActiveButton(element);

  const filtered = (techType === 'all')
    ? fullDataset
    : fullDataset.filter(item => item.screenTech === techType);

  updateCharts(filtered);
};

d3.csv('data/Ex6_TVdata.csv', normaliseTVRow)
  .then(data => {
    fullDataset = data;

    // Set colour scale domain from data
    const screenTypes = Array.from(new Set(fullDataset.map(d => d.screenTech)))
      .filter(Boolean)
      .sort(d3.ascending);

    colorScale.domain(screenTypes);

    updateCharts(fullDataset);
  })
  .catch(err => {
    console.error('Failed to load Ex6_TVdata.csv:', err);
    d3.select('#histogram-target').append('p').text('Failed to load dataset. Check console.');
  });
