// 2. DONUT CHART ENGINE
{
    const w = 500, h = 300, pad = 45;

    d3.csv("data/donutData.csv", d => ({ tech: d.tech, value: +d.value })).then(data => {
        const svg = d3.select("#donut").append("svg").attr("viewBox", `0 0 ${w} ${h}`),
              radius = Math.min(w, h) / 2 - 20,
              g = svg.append("g").attr("transform", `translate(${w/2},${h/2})`);
        const color = d3.scaleOrdinal().domain(data.map(d=>d.tech)).range(d3.schemePastel1);
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

        g.selectAll("path").data(pie(data)).join("path").attr("d", arc).attr("fill", d => color(d.data.tech))
           .attr("stroke", "white").style("stroke-width", "2px");
        g.selectAll("text").data(pie(data)).join("text")
           .attr("transform", d => `translate(${arc.centroid(d)})`).attr("text-anchor", "middle")
           .text(d => d.data.tech).style("font-size", "12px").style("fill", "#374151").style("font-weight", "bold");
    });
}