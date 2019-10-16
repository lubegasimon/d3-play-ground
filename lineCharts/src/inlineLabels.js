/**
 * modified, duplicate of https://bl.ocks.org/mbostock/4b66c0d9be9a0d56484e by Mike Bostock
 */

var margin = { top: 30, left: 30, bottom: 50, right: 100 },
  width = 600,
  height = 400;

var svg = d3
  .select("body")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.tsv("../data/inlineLabels.tsv").then(data => {
  var dateParse = d3.timeParse("%Y");

  data.forEach(d => {
    d.Apples = +d.Apples;
    d.Bananas = +d.Bananas;
    d.date = dateParse(d.date);

    return d;
  });

  console.log(data);

  // creating the data into separate series
  var series = data.columns.slice(1).map(key => {
    return data.map(d => ({
      key: key,
      date: d.date,
      value: d[key]
    }));
  });

  console.log(series); // returns 2-dimensional array

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var x = d3.scaleTime(d3.extent(data, d => d.date), [
    margin.left,
    width - margin.right
  ]);

  var y = d3.scaleLinear(
    [0, d3.max(data, d => Math.max(d.Apples, d.Bananas))],
    [height - margin.bottom, margin.top]
  );

  svg
    .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

  var line = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d.value));

  var serie = svg
    .selectAll(".g")
    .data(series)
    .join("g")
    .attr("class", "g-elem");

  serie
    .append("path")
      .attr("class", "line")
      .style("stroke", (_d, i) => color(i))
      .attr("d", line);

  var label = serie
    .selectAll(".label")
    .data(d => d)
    .join("g")
    .attr("class", "label");

  label
    .append("circle")
      .attr("r", 15)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value));

  label
    .append("text")
      // .attr("dx", "-.75em")
      .attr("dy", ".35em")
      .attr("transform", d => "translate(" + x(d.date) + "," + y(d.value) + ")")
      .text(d => d.value)
      .filter((d, i) => i === series[0].length - 1) // or (data.length - 1)
      .attr("dx", "1.9em")
    .append("tspan")
      .attr("dy", ".99em")
      .attr("class", "label-key")
      .text(d => " " + d.key);
});
