import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const LinePlot = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Parse and prepare the data
    const parsedData = data.map((d) => ({
      year: +d.Year, // Convert year to number
      "5gCoverage": +d["5G Network Coverage (%)"], // Coverage percentage
      internetPenetration: +d["Internet Penetration (%)"], // Internet penetration percentage
    }));

    // Set up the margins and dimensions for the chart
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    // Select the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up the scales for the axes
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(parsedData, (d) => d.year)) // X scale based on years
      .range([0, boundsWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100]) // Y scale goes from 0 to 100 for percentages
      .range([boundsHeight, 0]);

    // Set up the line generators for 5G Network Coverage and Internet Penetration
    const lineGenerator5G = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d["5gCoverage"]));

    const lineGeneratorInternet = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.internetPenetration));

    // Append the chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw the axes
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    // Add the line for 5G Network Coverage
    g.append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator5G);

    // Add the line for Internet Penetration
    g.append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("d", lineGeneratorInternet);

    // Add the legend for 5G Network Coverage
    g.append("circle")
      .attr("cx", boundsWidth - 100)
      .attr("cy", 20)
      .attr("r", 6)
      .style("fill", "steelblue");

    g.append("text")
      .attr("x", boundsWidth - 90)
      .attr("y", 20)
      .attr("dy", ".35em")
      .text("5G Coverage (%)");

    // Add the legend for Internet Penetration
    g.append("circle")
      .attr("cx", boundsWidth - 100)
      .attr("cy", 40)
      .attr("r", 6)
      .style("fill", "green");

    g.append("text")
      .attr("x", boundsWidth - 90)
      .attr("y", 40)
      .attr("dy", ".35em")
      .text("Internet Penetration (%)");
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
