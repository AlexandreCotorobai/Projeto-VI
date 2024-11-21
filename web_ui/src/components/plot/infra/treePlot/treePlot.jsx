import { useEffect, useRef } from "react";
import { boundsCalculator } from "../../../../utils/utils.js";
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
      .sort((a, b) => b.value - a.value); // Sort by value, descending

    // Create a treemap layout
    const treeGenerator = d3
      .treemap()
      .size([boundsWidth, boundsHeight])
      .padding(1)
      .tile(d3.treemapResquarify);

    // Compute the treemap layout
    const root = treeGenerator(hierarchy);

    // Create a color scale with faster gradient change
    const maxVal = d3.max(root.leaves(), (d) => d.value);
    const colorScale = d3
      .scaleLinear()
      .domain([0, maxVal * 0.25, maxVal]) // Adjusted for faster gradient change
      .range(["#e63946", "#6b97c9", "#345d7e"]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip setup
    const tooltip = d3
      .select("#container")
      .append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 0 5px rgba(0, 0, 0, 0.3)");

    // Drawing rectangles for each node
    g.selectAll("rect")
      .data(root.leaves())
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .style("fill", (d) => colorScale(d.value)) // Apply adjusted gradient color
      .attr("class", "opacity-80 hover:opacity-100")
      .on("mouseover", function (event, d) {
        tooltip
          .html(
            `<strong>Setor:</strong> ${d.data.name}s<br><strong>Tech Exports (USD):</strong>  ${d.data.value}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    // Adding names and numbers in each rectangle
    g.selectAll("text")
      .data(root.leaves())
      .join("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2) // Center horizontally
      .attr("y", (d) => (d.y0 + d.y1) / 2) // Center vertically
      .attr("dy", "-0.5em") // Adjust position for the name
      .text((d) => d.data.name) // Display the sector name
      .attr("font-size", (d) => Math.min(12, (d.x1 - d.x0) / 6)) // Adjust font size based on rectangle size
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle");

    g.selectAll("text.number")
      .data(root.leaves())
      .join("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2) // Center horizontally
      .attr("y", (d) => (d.y0 + d.y1) / 2 + 12) // Center vertically, below name
      .text((d, i) => i + 1) // Display the order number
      .attr("font-size", (d) => Math.min(10, (d.x1 - d.x0) / 6)) // Adjust font size based on rectangle size
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle");
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
