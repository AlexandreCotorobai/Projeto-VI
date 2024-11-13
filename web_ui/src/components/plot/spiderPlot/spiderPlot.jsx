import * as d3 from "d3";
import { INNER_RADIUS, SpiderGrid } from "./grid.jsx";
import React, { useEffect, useState } from "react";
import { DEFAULT_COLOR } from "../../../utils/utils.js";

const MARGIN = 30;

export const SpiderPlot = ({ data, width, height }) => {
  const [svgElements, setSvgElements] = useState({
    linePath: "",
    xScale: null,
    axisConfig: [],
    outerRadius: 0,
  });

  useEffect(() => {
    if (!data || !width || !height) return;

    let parsedData = {};

    // Group data by Tech Sector
    d3.groups(data, (d) => d["Tech Sector"]).forEach(
      ([techSector, sectorData]) => {
        // Calculate the average (mean) values for each relevant field within this sector
        parsedData[techSector] = d3.mean(
          sectorData,
          (d) => +d["Market Share (%)"]
        );
      }
    );

    // Calculate the global maximum of the average values for scaling
    const meanValue = d3.max(Object.values(parsedData));

    const axisConfig = [
      { name: "AI", max: meanValue },
      { name: "Biotechnology", max: meanValue },
      { name: "Cloud Computing", max: meanValue },
      { name: "Robotics", max: meanValue },
      { name: "Semiconductor", max: meanValue },
      { name: "Software", max: meanValue },
      { name: "Telecommunications", max: meanValue },
    ];
    const outerRadius = Math.min(width, height) / 2 - MARGIN;

    const allVariableNames = axisConfig.map((axis) => axis.name);
    const xScale = d3
      .scaleBand()
      .domain(allVariableNames)
      .range([0, 2 * Math.PI]);

    let yScales = {};
    axisConfig.forEach((axis) => {
      yScales[axis.name] = d3
        .scaleRadial()
        .domain([0, axis.max])
        .range([INNER_RADIUS, outerRadius]);
    });

    const lineGenerator = d3.lineRadial();
    const allCoordinates = axisConfig.map((axis) => {
      const yScale = yScales[axis.name];
      const angle = xScale(axis.name) ?? 0;
      const radius = yScale(parsedData[axis.name] || 0);
      return [angle, radius];
    });

    allCoordinates.push(allCoordinates[0]);
    const linePath = lineGenerator(allCoordinates);

    setSvgElements({ linePath, xScale, axisConfig, outerRadius });
  }, [data, width, height]);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {svgElements.xScale && (
          <SpiderGrid
            outerRadius={svgElements.outerRadius}
            xScale={svgElements.xScale}
            axisConfig={svgElements.axisConfig}
          />
        )}
        <path
          d={svgElements.linePath}
          stroke={DEFAULT_COLOR}
          strokeWidth={3}
          fill={DEFAULT_COLOR}
          fillOpacity={0.1}
        />
      </g>
    </svg>
  );
};
