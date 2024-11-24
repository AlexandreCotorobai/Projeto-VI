import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const HistogramPlot = ({ data, country, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0 || !country) return;

    // Filter the data to include only the selected country
    const countryData = data.filter((d) => d.Country === country);

    if (countryData.length === 0) return;

    // Get unique sectors
    const sectors = Array.from(
      new Set(countryData.map((d) => d["Tech Sector"]))
    ).sort();

    // Group data by sector, then calculate the averages
    const parsedData = sectors
      .map((sector) => {
        const sectorData = countryData.filter(
          (d) => d["Tech Sector"] === sector
        );

        const avgResearchCollaborations = d3.sum(
          sectorData,
          (d) => +d["University Research Collaborations"]
        );
        const avgPatentsFiled = d3.sum(
          sectorData,
          (d) => +d["Number of Patents Filed (Annual)"]
        );

        return { sector, avgResearchCollaborations, avgPatentsFiled };
      })
      .filter(
        (d) =>
          d.avgResearchCollaborations !== null && d.avgPatentsFiled !== null
      );

    // Setup chart dimensions
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Adjusted scale for X-axis (University Research Collaborations)
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(parsedData, (d) => d.avgResearchCollaborations))
      .nice()
      .range([0, boundsWidth]);

    // Adjusted scale for Y-axis (Number of Patents Filed (Annual))
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.avgPatentsFiled)])
      .nice()
      .range([boundsHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 15},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale));

    g.append("g").call(d3.axisLeft(yScale));

    // Define color scale for sectors
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(sectors);

    // Create bars for the sectors of the selected country
    parsedData.forEach((sectorData) => {
      const barWidth = 20;
      const barHeight = boundsHeight - yScale(sectorData.avgPatentsFiled);

      // Create the bar
      g.append("rect")
        .attr("x", xScale(sectorData.avgResearchCollaborations))
        .attr("y", yScale(sectorData.avgPatentsFiled))
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", colorScale(sectorData.sector));

      // Add the sector name inside the bar
      g.append("text")
        .attr("x", xScale(sectorData.avgResearchCollaborations) + barWidth / 2)
        .attr("y", yScale(sectorData.avgPatentsFiled) + barHeight / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "#fff")
        .style("font-size", "10px");
    });

    // Create the legend for sectors
    const legend = g
      .append("g")
      .attr(
        "transform",
        `translate(${boundsWidth - 130},${boundsHeight + margin.bottom - 210})`
      );

    // Add a white rectangle as the background for the legend
    const legendBackgroundWidth = 135;
    const legendBackgroundHeight = sectors.length * 20 + 10;

    legend
      .append("rect")
      .attr("width", legendBackgroundWidth)
      .attr("height", legendBackgroundHeight)
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("rx", 5); // Rounded corners

    // Add legend items
    legend
      .selectAll(".legend-item")
      .data(sectors)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(10, ${i * 20 + 5})`)
      .each(function (sector) {
        const item = d3.select(this);
        const sectorColor = colorScale(sector);

        item
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", sectorColor);

        item
          .append("text")
          .attr("x", 15)
          .attr("y", 10)
          .style("font-size", "12px")
          .style("fill", "#333")
          .text(sector);
      });

    // Axis labels
    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .text("University Research Collaborations");

    g.append("text")
      .attr("transform", `translate(-50,${boundsHeight / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Number of Patents");
  }, [data, country, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
