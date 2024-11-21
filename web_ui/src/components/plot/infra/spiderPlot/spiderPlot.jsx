import * as d3 from "d3";
import { INNER_RADIUS, SpiderGrid } from "./grid.jsx";
import React, { useEffect, useState, useRef } from "react";

const MARGIN = 30;

export const SpiderPlot = ({ data, width, height }) => {
  const tooltipRef = useRef();
  const [svgElements, setSvgElements] = useState({
    linePaths: [],
    xScale: null,
    axisConfig: [],
    outerRadius: 0,
    points: [],
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

    countries.forEach((country) => {
      parsedData[country] = {};
      sectors.forEach((sector) => {
        const sectorData = data.filter(
          (d) => d.Country === country && d["Tech Sector"] === sector
        );
        const value = d3.mean(sectorData, (d) => +d["Market Share (%)"]);
        parsedData[country][sector] = value || 0;
      });
    });

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

    let yScales = {};
    axisConfig.forEach((axis) => {
      yScales[axis.name] = d3
        .scaleRadial()
        .domain([0, axis.max])
        .range([INNER_RADIUS, outerRadius]);
    });

    const lineGenerator = d3.lineRadial();

    const generateLinePath = (countryData) => {
      const coordinates = axisConfig.map((axis) => {
        const angle = xScale(axis.name) ?? 0;
        const radius = yScales[axis.name](countryData[axis.name] || 0);
        return [angle, radius];
      });

      const hasValidData = Object.values(countryData).some(
        (value) => value !== null && value !== 0
      );
      if (!hasValidData) return null;

      coordinates.push(coordinates[0]);
      return {
        path: lineGenerator(coordinates),
        points: coordinates.map((coord, i) => ({
          angle: coord[0],
          radius: coord[1],
          sector: axisConfig[i]?.name,
          value: Object.values(countryData)[i],
        })),
      };
    };

    const linePaths = countries
      .map((country) => {
        const result = generateLinePath(parsedData[country]);
        return {
          path: result?.path,
          points: result?.points || [],
          color: country === "China" ? "#e63946" : "#345d7e",
          country,
        };
      })
      .filter((line) => line.path !== null);

    setSvgElements({ linePaths, xScale, axisConfig, outerRadius });
  }, [data, width, height]);

  return (
    <div style={{ position: "relative" }}>
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
            <g key={index}>
              <path
                d={lineData.path}
                stroke={lineData.color}
                strokeWidth={3}
                fill={lineData.color}
                fillOpacity={0.1}
              />
              {lineData.points.map((point, idx) => {
                const x = point.radius * Math.cos(point.angle - Math.PI / 2);
                const y = point.radius * Math.sin(point.angle - Math.PI / 2);

                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={lineData.color}
                    stroke="white"
                    strokeWidth={1.5}
                    onMouseOver={(event) => {
                      const tooltip = d3.select(tooltipRef.current);
                      tooltip
                        .style("visibility", "visible")
                        .style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`)
                        .html(
                          `<strong>${lineData.country}</strong><br>Sector: ${
                            point.sector
                          }<br>Value: ${point.value.toFixed(2)}%`
                        );
                    }}
                    onMouseMove={(event) => {
                      const tooltip = d3.select(tooltipRef.current);
                      tooltip
                        .style("top", `${event.pageY - 10}px`)
                        .style("left", `${event.pageX + 10}px`);
                    }}
                    onMouseOut={() => {
                      const tooltip = d3.select(tooltipRef.current);
                      tooltip.style("visibility", "hidden");
                    }}
                  />
                );
              })}
            </g>
          ))}
        </g>
        {/* Legenda */}
        <g
          transform={`translate(${MARGIN}, ${height - MARGIN * 2})`}
          style={{ fontSize: "12px" }}
        >
          <g transform="translate(0, 0)">
            <rect width="15" height="15" fill="#e63946" />
            <text
              x="20"
              y="9"
              style={{ fill: "black", alignmentBaseline: "middle" }}
            >
              China
            </text>
          </g>
          <g transform="translate(0, 20)">
            <rect width="15" height="15" fill="#345d7e" />
            <text
              x="20"
              y="9"
              style={{ fill: "black", alignmentBaseline: "middle" }}
            >
              Japan
            </text>
          </g>
        </g>
      </svg>
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          backgroundColor: "white",
          padding: "5px",
          borderRadius: "5px",
          border: "1px solid black",
          fontSize: "12px",
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
};
