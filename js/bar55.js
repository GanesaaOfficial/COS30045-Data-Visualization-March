// 3. BAR CHART ENGINE (55 INCH)
d3.csv("data/barData55.csv", d => ({ tech: d.tech, energy: +d.energy })).then(data => {
    const w = 500, h = 300, pad = 45;
    const svg = d3.select("#bar55").append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const xs = d3.scaleBand().domain(data.map(d=>d.tech)).range([pad, w - pad]).padding(0.3);
    const ys = d3.scaleLinear().domain([0, d3.max(data, d=>d.energy)]).range([h - pad, pad]);

    // Add subtle background gridlines
    svg.append("g").attr("class", "gridlines").attr("transform", `translate(${pad},0)`)
       .call(d3.axisLeft(ys).tickSize(-(w - pad * 2)).tickFormat("").ticks(5));

    // Draw Axes
    svg.append("g").attr("transform", `translate(0,${h-pad})`).call(d3.axisBottom(xs));
    svg.append("g").attr("transform", `translate(${pad},0)`).call(d3.axisLeft(ys));

    // Add Axis Labels
    svg.append("text").attr("x", w/2).attr("y", h - 5).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Screen Technology");
    svg.append("text").attr("transform", "rotate(-90)").attr("x", -h/2).attr("y", 15).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Energy Consumption");

    // Draw the Bars
    svg.selectAll("rect")
       .data(data)
       .join("rect")
       .attr("x", d => xs(d.tech))
       .attr("y", d => ys(d.energy))
       .attr("width", xs.bandwidth())
       .attr("height", d => (h - pad) - ys(d.energy))
       .attr("fill", "#3498db").attr("class", d => `bar-${d.tech}`);

    // Add numeric labels precisely above each bar
    svg.selectAll(".label").data(data).join("text").attr("class", "label")
       .attr("x", d => xs(d.tech) + xs.bandwidth() / 2)
       .attr("y", d => ys(d.energy) - 8)
       .attr("text-anchor", "middle").style("font-size", "11px")
       .style("font-weight", "bold").style("fill", "#374151").text(d => d.energy);
});