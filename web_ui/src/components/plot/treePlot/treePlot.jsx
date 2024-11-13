import { useEffect, useRef } from "react";
import { boundsCalculator } from "../../../utils/utils.js";
import * as d3 from "d3";

export const TreePlot = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  function createHierarchy(data) {
    let filteredData = data;

    // Grouping data by Tech Sector
    const groupedBySector = d3.groups(filteredData, (d) => d["Tech Sector"]);

    // Transforming the grouped data into the required hierarchical format
    const hierarchy = {
      type: "node",
      name: "root",
      children: groupedBySector.map(([sector, records]) => ({
        type: "leaf",
        name: sector,
        value: d3.sum(records, (d) => +d["Tech Exports (in USD)"]), // Sum of Tech Exports per sector
      })),
    };

    return hierarchy;
  }

  useEffect(() => {
    if (!data) return;

    // Calculate bounds
    const { boundsWidth, boundsHeight } = boundsCalculator(
      width,
      height,
      margin
    );

    // Select the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define the hierarchical structure
    const hierarchy = d3
      .hierarchy(createHierarchy(data))
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    // Create a treemap layout
    const treeGenerator = d3
      .treemap()
      .size([boundsWidth, boundsHeight])
      .padding(1)
      .tile(d3.treemapResquarify);

    // Compute the treemap layout
    const root = treeGenerator(hierarchy);

    // Create a color scale for each sector
    const colorScale = d3
      .scaleOrdinal()
      .domain(root.leaves().map((d) => d.data.name))
      .range(d3.schemeSet2);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select("#container")
      .append("div")
      .attr("class", "tooltip");

    // Drawing rectangles for each node
    g.selectAll("rect")
      .data(root.leaves())
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", (d) => colorScale(d.data.name)) // Use a color scale function for colors
      .attr("class", "opacity-80 hover:opacity-100")
      .on("mouseover", function () {
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function (event, d) {
        return tooltip
          .style("position", "absolute")
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px")
          .html(
            `<div class="card bg-base-100 shadow"><div class="card-body"><div class="card-title">${d.data.name}</div><div class="text-sm">Tech Exports (USD): ${d.data.value}</div></div>`
          );
      })
      .on("mouseout", function () {
        return tooltip.style("visibility", "hidden");
      });

    // Adding text labels only if they fit in the rectangle
    g.selectAll("text.name")
      .data(root.leaves())
      .join("text")
      .attr("class", "name")
      .attr("x", (d) => d.x0 + 5)
      .attr("y", (d) => d.y0 + 20)
      .text((d) => d.data.name)
      .attr("font-size", (d) => Math.min(12, (d.x1 - d.x0) / 3)) // Adjust font size based on rectangle width
      .attr("fill", "black") // Changed for better legibility
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "hanging")
      .style("display", (d) =>
        d.x1 - d.x0 > d.data.name.length * 8 ? "block" : "none"
      ); // Hide text if it doesn't fit
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
