// 4. LINE CHART ENGINE
d3.csv("data/lineData.csv", d => ({ year: +d.year, price: +d.price })).then(data => {
    const w = 500, h = 300, pad = 45;
    const svg = d3.select("#line").append("svg").attr("viewBox", `0 0 ${w} ${h}`);
    const xs = d3.scaleLinear().domain(d3.extent(data, d=>d.year)).range([pad, w - pad]);
    const ys = d3.scaleLinear().domain([0, d3.max(data, d=>d.price)]).range([h - pad, pad]);

    // Add subtle background gridlines
    svg.append("g").attr("class", "gridlines").attr("transform", `translate(${pad},0)`)
       .call(d3.axisLeft(ys).tickSize(-(w - pad * 2)).tickFormat("").ticks(5));

    // Draw Axes (Format X-axis to remove commas from years)
    svg.append("g").attr("transform", `translate(0,${h-pad})`).call(d3.axisBottom(xs).tickFormat(d3.format("d")));
    svg.append("g").attr("transform", `translate(${pad},0)`).call(d3.axisLeft(ys));

    // Add Axis Labels
    svg.append("text").attr("x", w/2).attr("y", h - 5).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Year");
    svg.append("text").attr("transform", "rotate(-90)").attr("x", -h/2).attr("y", 15).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Spot Price");

    // Define and draw the Line Path
    const lineGenerator = d3.line().x(d => xs(d.year)).y(d => ys(d.price));
    
    svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#2ecc71").attr("stroke-width", 2).attr("d", lineGenerator);
       
    // Optional: Draw dots over the line for better visibility
    svg.selectAll("circle").data(data).join("circle")
       .attr("cx", d => xs(d.year))
       .attr("cy", d => ys(d.price))
       .attr("r", 5).attr("fill", "#27ae60").attr("stroke", "#fff").attr("stroke-width", 1.5);
       
    // Show exact price data slightly above the line nodes
    svg.selectAll(".val-label").data(data).join("text").attr("class", "val-label")
       .attr("x", d => xs(d.year))
       .attr("y", d => ys(d.price) - 10)
       .attr("text-anchor", "middle").style("font-size", "10px")
       .style("font-weight", "bold").style("fill", "#374151").text(d => `$${d.price}`);
});