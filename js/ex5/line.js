// 4. LINE CHART ENGINE
{
    const w = 500, h = 300, pad = 45;

    d3.csv("data/lineData.csv", d => ({ year: +d.year, price: +d.price })).then(data => {
        const svg = d3.select("#line").append("svg").attr("viewBox", `0 0 ${w} ${h}`);
        const xs = d3.scaleLinear().domain(d3.extent(data, d=>d.year)).range([pad, w - pad]);
        const ys = d3.scaleLinear().domain([0, d3.max(data, d=>d.price)]).range([h - pad, pad]);

        svg.append("g").attr("transform", `translate(0,${h-pad})`).call(d3.axisBottom(xs).tickFormat(d3.format("d")));
        svg.append("g").attr("transform", `translate(${pad},0)`).call(d3.axisLeft(ys));
        
        // Axis labels
        svg.append("text").attr("x", w/2).attr("y", h - 5).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Year");
        svg.append("text").attr("transform", "rotate(-90)").attr("x", -h/2).attr("y", 15).style("text-anchor", "middle").style("font-size", "12px").style("fill", "#6b7280").text("Spot Power Price");

        const line = d3.line().x(d => xs(d.year)).y(d => ys(d.price));
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "#9b59b6").attr("stroke-width", 3).attr("d", line);
        
        // Add dots on line
        svg.selectAll(".dot").data(data).join("circle")
           .attr("class", "dot").attr("cx", d => xs(d.year)).attr("cy", d => ys(d.price)).attr("r", 4).attr("fill", "#8e44ad");
    });
}