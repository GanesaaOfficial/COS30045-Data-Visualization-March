const COLORS = { "LCD (LED)": "#00b894", "OLED": "#a29bfe", "LCD": "#fdcb6e" };

// ── Tooltip ──────────────────────────────────────────────────
const tip = document.createElement("div");
tip.className = "tooltip";
document.body.appendChild(tip);

function showTip(html, event) {
  tip.innerHTML = html;
  tip.style.opacity = 1;
  tip.style.left = (event.clientX + 14) + "px";
  tip.style.top  = (event.clientY - 36) + "px";
}
function moveTip(event) {
  tip.style.left = (event.clientX + 14) + "px";
  tip.style.top  = (event.clientY - 36) + "px";
}
function hideTip() { tip.style.opacity = 0; }

// ── SVG factory ──────────────────────────────────────────────
function makeSVG(selector, w, h, m) {
  return d3.select(selector).append("svg")
    .attr("viewBox", `0 0 ${w + m.l + m.r} ${h + m.t + m.b}`)
    .style("width", "100%").style("height", "auto")
    .append("g").attr("transform", `translate(${m.l},${m.t})`);
}

function gridLines(svg, scale, width) {
  svg.append("g").attr("class", "grid")
    .call(d3.axisLeft(scale).ticks(6).tickSize(-width).tickFormat(""));
}

function axisLabels(svg, xTxt, yTxt, w, h, m) {
  svg.append("text").attr("class", "axis-label")
    .attr("x", w / 2).attr("y", h + m.b - 8)
    .attr("text-anchor", "middle").text(xTxt);
  svg.append("text").attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2).attr("y", -m.l + 14)
    .attr("text-anchor", "middle").text(yTxt);
}

function legend(svg, x, y) {
  const g = svg.append("g").attr("class", "legend").attr("transform", `translate(${x},${y})`);
  Object.entries(COLORS).forEach(([k, v], i) => {
    g.append("rect").attr("x", 0).attr("y", i * 22).attr("width", 13).attr("height", 13)
      .attr("fill", v).attr("rx", 3);
    g.append("text").attr("x", 18).attr("y", i * 22 + 11).text(k);
  });
}

// ── Chart 1: Technology Bar ───────────────────────────────────
function drawTechBar(data, selector) {
  const counts = d3.rollup(data, v => v.length, d => d.Screen_Tech);
  const cd = Array.from(counts, ([tech, count]) => ({ tech, count })).sort((a,b) => b.count - a.count);
  const m = {t:30, r:20, b:60, l:65}, w = 620, h = 300;
  const svg = makeSVG(selector, w, h, m);
  const x = d3.scaleBand().domain(cd.map(d => d.tech)).range([0, w]).padding(0.35);
  const y = d3.scaleLinear().domain([0, d3.max(cd, d => d.count) * 1.15]).nice().range([h, 0]);
  gridLines(svg, y, w);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`).call(d3.axisBottom(x));
  svg.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6));
  svg.selectAll("rect.bar").data(cd).join("rect")
    .attr("class","bar")
    .attr("x", d => x(d.tech)).attr("y", d => y(d.count))
    .attr("width", x.bandwidth()).attr("height", d => h - y(d.count))
    .attr("fill", d => COLORS[d.tech] || "#74b9ff").attr("rx", 5)
    .on("mouseover", (e,d) => showTip(`<strong>${d.tech}</strong><br>${d.count} models`, e))
    .on("mousemove", moveTip).on("mouseout", hideTip);
  svg.selectAll("text.val").data(cd).join("text").attr("class","val")
    .attr("x", d => x(d.tech) + x.bandwidth()/2).attr("y", d => y(d.count) - 6)
    .attr("text-anchor","middle").attr("font-size","13px").attr("font-weight","700")
    .attr("fill","#2d3436").text(d => d.count);
  axisLabels(svg, "Screen Technology", "Number of Models", w, h, m);
}

// ── Chart 2: Size Histogram ───────────────────────────────────
function drawSizeHistogram(data, selector) {
  const vals = data.map(d => +d.Screen_Size);
  const m = {t:30, r:20, b:60, l:65}, w = 620, h = 300;
  const svg = makeSVG(selector, w, h, m);
  const x = d3.scaleLinear().domain([d3.min(vals)-3, d3.max(vals)+3]).range([0,w]);
  const bins = d3.bin().domain(x.domain()).thresholds(x.ticks(12))(vals);
  const y = d3.scaleLinear().domain([0, d3.max(bins, d=>d.length)*1.15]).nice().range([h,0]);
  gridLines(svg, y, w);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d => d + '"'));
  svg.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6));
  svg.selectAll("rect.bar").data(bins).join("rect").attr("class","bar")
    .attr("x", d => x(d.x0)+1).attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1)-x(d.x0)-2)).attr("height", d => h-y(d.length))
    .attr("fill","#0984e3").attr("rx",3).attr("opacity",0.82)
    .on("mouseover",(e,d)=>showTip(`<strong>${d.x0}"–${d.x1}"</strong><br>${d.length} models`,e))
    .on("mousemove",moveTip).on("mouseout",hideTip);
  axisLabels(svg, "Screen Size (inches)", "Number of Models", w, h, m);
}

// ── Chart 3: Brands Horizontal Bar ───────────────────────────
function drawBrandsBar(data, selector) {
  const counts = d3.rollup(data, v=>v.length, d=>d.Brand);
  const cd = Array.from(counts, ([brand,count])=>({brand,count})).sort((a,b)=>b.count-a.count).slice(0,14);
  const m = {t:20, r:60, b:50, l:80}, w = 580, h = cd.length * 30;
  const svg = makeSVG(selector, w, h, m);
  const y = d3.scaleBand().domain(cd.map(d=>d.brand)).range([0,h]).padding(0.28);
  const x = d3.scaleLinear().domain([0,d3.max(cd,d=>d.count)*1.18]).nice().range([0,w]);
  svg.append("g").selectAll("line.vg").data(x.ticks(5)).join("line")
    .attr("x1",d=>x(d)).attr("x2",d=>x(d)).attr("y1",0).attr("y2",h)
    .attr("stroke","#e9ecef").attr("stroke-dasharray","3,3");
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`).call(d3.axisBottom(x).ticks(5));
  svg.append("g").attr("class","axis").call(d3.axisLeft(y));
  svg.selectAll("rect.bar").data(cd).join("rect").attr("class","bar")
    .attr("y",d=>y(d.brand)).attr("x",0)
    .attr("height",y.bandwidth()).attr("width",d=>x(d.count))
    .attr("fill","#0984e3").attr("rx",3).attr("opacity",0.85)
    .on("mouseover",(e,d)=>showTip(`<strong>${d.brand}</strong><br>${d.count} models`,e))
    .on("mousemove",moveTip).on("mouseout",hideTip);
  svg.selectAll("text.val").data(cd).join("text").attr("class","val")
    .attr("y",d=>y(d.brand)+y.bandwidth()/2+4).attr("x",d=>x(d.count)+5)
    .attr("font-size","12px").attr("font-weight","600").attr("fill","#2d3436").text(d=>d.count);
  axisLabels(svg, "Number of Models", "Brand", w, h, m);
}

// ── Chart 4: Box Plot — Power by Tech ────────────────────────
function drawBoxPlot(data, selector) {
  const techs = ["LCD (LED)", "OLED", "LCD"];
  const m = {t:40, r:30, b:60, l:75}, w = 600, h = 320;
  const svg = makeSVG(selector, w, h, m);
  const x = d3.scaleBand().domain(techs).range([0,w]).padding(0.42);
  const y = d3.scaleLinear().domain([0, d3.max(data,d=>+d.Power_Consumption)+30]).nice().range([h,0]);
  gridLines(svg, y, w);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`).call(d3.axisBottom(x));
  svg.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(7).tickFormat(d=>d+"W"));

  techs.forEach(tech => {
    const vals = data.filter(d=>d.Screen_Tech===tech).map(d=>+d.Power_Consumption).sort(d3.ascending);
    if (!vals.length) return;
    const q1=d3.quantile(vals,0.25), med=d3.quantile(vals,0.5), q3=d3.quantile(vals,0.75);
    const iqr=q3-q1, lo=Math.max(d3.min(vals),q1-1.5*iqr), hi=Math.min(d3.max(vals),q3+1.5*iqr);
    const cx=x(tech)+x.bandwidth()/2, bw=x.bandwidth(), col=COLORS[tech];
    // whisker
    svg.append("line").attr("x1",cx).attr("x2",cx).attr("y1",y(lo)).attr("y2",y(hi))
      .attr("stroke",col).attr("stroke-width",2);
    [lo,hi].forEach(cap=>{
      svg.append("line").attr("x1",cx-bw*0.22).attr("x2",cx+bw*0.22).attr("y1",y(cap)).attr("y2",y(cap))
        .attr("stroke",col).attr("stroke-width",2);
    });
    // box
    svg.append("rect").attr("x",x(tech)).attr("y",y(q3))
      .attr("width",bw).attr("height",Math.max(1,y(q1)-y(q3)))
      .attr("fill",col).attr("opacity",0.55).attr("rx",3).attr("stroke",col).attr("stroke-width",1.5);
    // median
    svg.append("line").attr("x1",x(tech)).attr("x2",x(tech)+bw).attr("y1",y(med)).attr("y2",y(med))
      .attr("stroke","#2d3436").attr("stroke-width",2.5);
    // median label
    svg.append("text").attr("x",cx).attr("y",y(med)-8)
      .attr("text-anchor","middle").attr("font-size","11px").attr("font-weight","700").attr("fill","#2d3436")
      .text(`Median: ${Math.round(med)}W`);
    // outliers
    vals.filter(v=>v<q1-1.5*iqr||v>q3+1.5*iqr).forEach(v=>{
      svg.append("circle").attr("cx",cx).attr("cy",y(v)).attr("r",4)
        .attr("fill","none").attr("stroke",col).attr("stroke-width",1.5)
        .on("mouseover",e=>showTip(`${tech}<br><strong>${v}W</strong>`,e))
        .on("mousemove",moveTip).on("mouseout",hideTip);
    });
  });
  axisLabels(svg, "Screen Technology", "Power Consumption (W)", w, h, m);
  legend(svg, w-110, 0);
}

// ── Chart 5: Scatter — Size vs Power ─────────────────────────
function drawScatter(data, selector) {
  const m = {t:20, r:130, b:60, l:75}, w = 620, h = 360;
  const svg = makeSVG(selector, w, h, m);
  const x = d3.scaleLinear().domain([20, d3.max(data,d=>+d.Screen_Size)+4]).nice().range([0,w]);
  const y = d3.scaleLinear().domain([0, d3.max(data,d=>+d.Power_Consumption)+20]).nice().range([h,0]);
  gridLines(svg, y, w);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d=>d+'"'));
  svg.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(8).tickFormat(d=>d+"W"));
  ["LCD (LED)","OLED","LCD"].forEach(tech=>{
    svg.selectAll(null).data(data.filter(d=>d.Screen_Tech===tech)).join("circle")
      .attr("cx",d=>x(+d.Screen_Size)).attr("cy",d=>y(+d.Power_Consumption))
      .attr("r",5).attr("fill",COLORS[tech]).attr("opacity",0.65).attr("stroke",COLORS[tech])
      .on("mouseover",(e,d)=>showTip(`<strong>${d.Brand} ${d.Model}</strong><br>${d.Screen_Tech}<br>${d.Screen_Size}" · ${d.Power_Consumption}W`,e))
      .on("mousemove",moveTip).on("mouseout",hideTip);
  });
  axisLabels(svg, "Screen Size (inches)", "Power Consumption (W)", w, h, m);
  legend(svg, w+10, 20);
}

// ── Chart 6: Star Rating vs Screen Size box plot ─────────────
function drawStarSize(data, selector) {
  const ratings = [...new Set(data.map(d=>+d.Star_Rating))].sort(d3.ascending);
  const m = {t:30, r:20, b:65, l:75}, w = 680, h = 340;
  const svg = makeSVG(selector, w, h, m);
  const x = d3.scaleBand().domain(ratings).range([0,w]).padding(0.35);
  const y = d3.scaleLinear().domain([0,d3.max(data,d=>+d.Screen_Size)+8]).nice().range([h,0]);
  gridLines(svg, y, w);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h})`)
    .call(d3.axisBottom(x).tickFormat(d=>`${d} ★`));
  svg.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(8).tickFormat(d=>d+'"'));

  const colorScale = d3.scaleSequential(d3.interpolateCool).domain([d3.min(ratings),d3.max(ratings)]);

  ratings.forEach(r=>{
    const vals = data.filter(d=>+d.Star_Rating===r).map(d=>+d.Screen_Size).sort(d3.ascending);
    if (!vals.length) return;
    const q1=d3.quantile(vals,0.25), med=d3.quantile(vals,0.5), q3=d3.quantile(vals,0.75);
    const iqr=q3-q1, lo=Math.max(d3.min(vals),q1-1.5*iqr), hi=Math.min(d3.max(vals),q3+1.5*iqr);
    const cx=x(r)+x.bandwidth()/2, bw=x.bandwidth(), col=colorScale(r);
    svg.append("line").attr("x1",cx).attr("x2",cx).attr("y1",y(lo)).attr("y2",y(hi))
      .attr("stroke",col).attr("stroke-width",2);
    [lo,hi].forEach(cap=>{
      svg.append("line").attr("x1",cx-bw*0.2).attr("x2",cx+bw*0.2).attr("y1",y(cap)).attr("y2",y(cap))
        .attr("stroke",col).attr("stroke-width",2);
    });
    svg.append("rect").attr("x",x(r)).attr("y",y(q3))
      .attr("width",bw).attr("height",Math.max(1,y(q1)-y(q3)))
      .attr("fill",col).attr("opacity",0.55).attr("rx",3).attr("stroke",col).attr("stroke-width",1.5);
    svg.append("line").attr("x1",x(r)).attr("x2",x(r)+bw).attr("y1",y(med)).attr("y2",y(med))
      .attr("stroke","#2d3436").attr("stroke-width",2.5);
    svg.append("text").attr("x",cx).attr("y",y(med)-7)
      .attr("text-anchor","middle").attr("font-size","10px").attr("fill","#2d3436").attr("font-weight","600")
      .text(`${Math.round(med)}"`);
  });
  axisLabels(svg, "Energy Star Rating", "Screen Size (inches)", w, h, m);
}
