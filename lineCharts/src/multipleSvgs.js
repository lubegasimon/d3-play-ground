/**
 * references that are worthy visiting.
 *
 * https://bl.ocks.org/mbostock/9490313
 * https://bl.ocks.org/mbostock/9490516
 * https://bl.ocks.org/mbostock/1157787
 */

const margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 800,
  height = 69;

const parseDate = d3.timeParse("%b %Y");

const x = d3.scaleTime().range([margin.left, width - margin.right]);

d3.tsv(
  "https://gist.githubusercontent.com/mbostock/9490313/raw/96df05a546ada0b3093054d34112cef26321cf84/stocks.tsv"
).then(data => {
  data.forEach(d => {
    d.date = parseDate(d.date);
    d.price = +d.price;

    return d;
  });

  const symbols = d3
    .nest()
    .key(d => d.symbol)
    .entries(data);

  x.domain([
    d3.min(symbols, d => d.values[0].date),
    d3.max(symbols, d => d.values[d.values.length - 1].date)
  ]);

  const svg = d3
    .select("body")
    .selectAll("svg")
    .data(symbols)
    .enter()
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
      .each(multiple);

  svg
    .append("text")
      .attr(
        "transform",
        "translate(" +
          (width - margin.right - 5) +
          ", " +
          (height - margin.bottom - 5) +
          ")"
      )
      .text(d => d.key);
});

function multiple(symbol) {
  // or with arrow function, use (symbol, i, nodes) as args
  // https://medium.com/@yonester/on-d3-and-arrow-functions-b6559c1cebb8#.34m7omc3j

  const svg = d3.select(this); // then ....select(node(i))

  const y = d3.scaleLinear(
    [0, d3.max(symbol.values, d => d.price)],
    [height - margin.bottom, margin.top]
  );

  const line = d3
    .line()
    .x(d => x(d.date))
    .y(d => y(d.price));

  const area = d3
    .area()
    .x(d => x(d.date))
    .y0(height - margin.bottom)
    .y1(d => y(d.price));

  svg
    .append("path")
      .attr("class", "line")
      .attr("d", line(symbol.values));

  svg
    .append("path")
      .attr("class", "area")
      .attr("d", area(symbol.values));
}
