// 3. BAR CHART ENGINE (55 INCH)
{
    const w = 500, h = 300, pad = 45;

    d3.csv("data/barData55.csv", d => ({ tech: d.tech, energy: +d.energy })).then(data => {
        const svg = d3.select("#bar55").append("svg").attr("viewBox", `0 0 ${w} ${h}`);
        const xs = d3.scaleBand().domain(data.map(d=>d.tech)).range([pad, w - pad]).padding(0.3);
        const ys = d3.scaleLinear().domain([0, d3.max(data, d=>d.energy)]).range([h - pad, pad]);

        svg.append("g").attr("transform", `translate(0,${h-pad})`).call(d3.axisBottom(xs));
        svg.append("g").attr("transform", `translate(${pad},0)`).call(d3.axisLeft(ys));
        
        // Axis labels
        svg.append("text").attr("x", w/2).attr("y", h - 5).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Screen Tech");
        svg.append("text").attr("transform", "rotate(-90)").attr("x", -h/2).attr("y", 15).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Avg Energy Consumption");

        svg.selectAll("rect").data(data).join("rect")
           .attr("x", d => xs(d.tech)).attr("y", d => ys(d.energy))
           .attr("width", xs.bandwidth()).attr("height", d => h - pad - ys(d.energy)).attr("fill", "#2ecc71");
    });
}