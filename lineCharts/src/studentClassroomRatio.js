var margin = { top: 30, left: 30, bottom: 60, right: 60 },
  width = 600,
  height = 400;

var svg = d3
  .select("body")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.tsv("../data/studentClassroomRatio.tsv").then(data => {
  data.forEach(d => {
    d[2012] = +d[2012];
    d[2013] = +d[2013];

    return d;
  });

  console.log("data", data);

  var series = data.columns.slice(1).map(key => {
    return data.map(d => ({
      district: d.District,
      key: key,
      value: d[key]
    }));
  });

  console.log("series", series);

  var x = d3.scalePoint(data.map(d => d.District), [
    margin.left,
    width - margin.right
  ]);

  var y = d3.scaleLinear(
    [
      0,
      d3.max(
        data,
        d => Math.max(d[2012], d[2013]) // TODO: get rid of explicity (make code dynamic)
      )
    ],
    [height - margin.bottom, margin.top]
  );

  svg
    .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

  svg
    .append("g")
      .style("opacity", "0.09")
      .attr("transform", `translate(${margin.left - 1},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(8)
          .tickSize(-width + 90)
      )
      .call(g => g.select(".domain").remove());

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var area = d3
    .area()
    .x(d => x(d.district))
    .y0(height - margin.bottom)
    .y1(d => y(d.value));

  var serie = svg
    .selectAll(".g")
    .data(series)
    .enter()
    .append("g")
      .attr("class", "g-elem");

  serie
    .append("path")
      .attr("class", "area")
      .style("fill", (_d, i) => color(i))
      .style("opacity", "0.5")
      .attr("d", area);

  serie
    .selectAll(".label")
    .data(d => d)
    .enter()
    .append("text")
      .attr("transform", d => `translate(${x(d.district)}, ${y(d.value)})`)
      .filter((d, i) => i === series[0].length - 1)
    .append("tspan")
      .attr("dy", ".35em")
      .attr("class", "line-label")
      .text(d => "" + d.key);

  // tool tip
  var div = d3
    .select("body")
    .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  serie
    .selectAll(".circle")
    .data(d => d)
    .enter()
    .append("circle")
      .attr("r", "3")
      .attr("cx", d => x(d.district))
      .attr("cy", d => y(d.value))
      .style("fill", (_d, i) => color(i))
      .style("opacity", 0)
      .on("mouseover", d => {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        div
          .html(d.value)
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 20 + "px");
      })
      .on("mouseout", () => {
        div
          .transition()
          .duration(10000)
          .style("opacity", "0");
      });

  svg
    .append("text")
      .attr("class", "title")
      .attr("transform", "translate(" + margin.right + "," + margin.top / 3 +")")
      .attr("dx", "4em")
      .text("Student-classroom ratio by district in 2012 and 2013")
});
