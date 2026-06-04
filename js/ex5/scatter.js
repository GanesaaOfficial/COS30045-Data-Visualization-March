// 1. SCATTER PLOT ENGINE
const w = 500, h = 300, pad = 45;

d3.csv("data/scatterData.csv", d => ({ rating: +d.rating, energy: +d.energy })).then(data => {
    const svg = d3.select("#scatter").append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const xs = d3.scaleLinear().domain([0, 6]).range([pad, w - pad]);
    const ys = d3.scaleLinear().domain([0, d3.max(data, d=>d.energy)]).range([h - pad, pad]);

    svg.append("g").attr("transform", `translate(0,${h-pad})`).call(d3.axisBottom(xs).ticks(6));
    svg.append("g").attr("transform", `translate(${pad},0)`).call(d3.axisLeft(ys));
    
    // Axis labels
    svg.append("text").attr("x", w/2).attr("y", h - 5).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Star Rating");
    svg.append("text").attr("transform", "rotate(-90)").attr("x", -h/2).attr("y", 15).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Energy Consumption");

    svg.selectAll("circle").data(data).join("circle")
       .attr("cx", d => xs(d.rating)).attr("cy", d => ys(d.energy)).attr("r", 7).attr("fill", "#e74c3c");
});