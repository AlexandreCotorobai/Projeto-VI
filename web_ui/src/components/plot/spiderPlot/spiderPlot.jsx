import * as d3 from "d3";
import { INNER_RADIUS, SpiderGrid } from "./grid.jsx";
import React, { useEffect, useState } from "react";
import { DEFAULT_COLOR } from "../../../utils/utils.js";

const MARGIN = 30;

export const SpiderPlot = ({ data, width, height }) => {
  const [svgElements, setSvgElements] = useState({
    linePaths: [],
    xScale: null,
    axisConfig: [],
    outerRadius: 0,
  });

  useEffect(() => {
    if (!data || !width || !height) return;

    const countries = ["China", "Japan"];
    const sectors = [
      "AI",
      "Biotechnology",
      "Cloud Computing",
      "Robotics",
      "Semiconductor",
      "Software",
      "Telecommunications",
    ];

    let parsedData = {};

    // Group data by Country and Tech Sector and calculate average values
    countries.forEach((country) => {
      parsedData[country] = {};
      sectors.forEach((sector) => {
        const sectorData = data.filter(
          (d) => d.Country === country && d["Tech Sector"] === sector
        );
        parsedData[country][sector] = d3.mean(
          sectorData,
          (d) => +d["Market Share (%)"]
        );
      });
    });

    // Calculate the global maximum across all sectors for scaling
    const maxValue = d3.max(Object.values(parsedData).flatMap(Object.values));

    const axisConfig = sectors.map((sector) => ({
      name: sector,
      max: maxValue,
    }));
    const outerRadius = Math.min(width, height) / 2 - MARGIN;

    const allVariableNames = axisConfig.map((axis) => axis.name);
    const xScale = d3
      .scaleBand()
      .domain(allVariableNames)
      .range([0, 2 * Math.PI]);

    // Define y-scales based on max value
    let yScales = {};
    axisConfig.forEach((axis) => {
      yScales[axis.name] = d3
        .scaleRadial()
        .domain([0, axis.max])
        .range([INNER_RADIUS, outerRadius]);
    });

    const lineGenerator = d3.lineRadial();

    // Function to calculate coordinates for each country
    const generateLinePath = (countryData) => {
      const coordinates = axisConfig.map((axis) => {
        const angle = xScale(axis.name) ?? 0;
        const radius = yScales[axis.name](countryData[axis.name] || 0);
        return [angle, radius];
      });
      coordinates.push(coordinates[0]); // Close the path
      return lineGenerator(coordinates);
    };

    // Generate paths for each country
    const linePaths = countries.map((country) => ({
      path: generateLinePath(parsedData[country]),
      color: country === "China" ? "blue" : "red",
    }));

    setSvgElements({ linePaths, xScale, axisConfig, outerRadius });
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
        {svgElements.linePaths.map((lineData, index) => (
          <path
            key={index}
            d={lineData.path}
            stroke={lineData.color}
            strokeWidth={3}
            fill={lineData.color}
            fillOpacity={0.1}
          />
        ))}
      </g>
    </svg>
  );
};
