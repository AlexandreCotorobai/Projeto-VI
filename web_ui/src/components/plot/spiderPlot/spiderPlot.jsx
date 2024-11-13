import * as d3 from "d3";
import { INNER_RADIUS, SpiderGrid } from "./grid.jsx";
import React, { useEffect, useState } from "react";

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

    // Agrupar dados por país e setor de tecnologia e calcular médias, substituindo valores null por 0
    countries.forEach((country) => {
      parsedData[country] = {};
      sectors.forEach((sector) => {
        const sectorData = data.filter(
          (d) => d.Country === country && d["Tech Sector"] === sector
        );
        const value = d3.mean(sectorData, (d) => +d["Market Share (%)"]);
        parsedData[country][sector] = value || 0; // Substituir null por 0
      });
    });

    // Calcular o máximo global para o escalonamento
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

    // Definir escalas y com base no valor máximo
    let yScales = {};
    axisConfig.forEach((axis) => {
      yScales[axis.name] = d3
        .scaleRadial()
        .domain([0, axis.max])
        .range([INNER_RADIUS, outerRadius]);
    });

    const lineGenerator = d3.lineRadial();

    // Função para calcular coordenadas para cada país
    const generateLinePath = (countryData) => {
      const coordinates = axisConfig.map((axis) => {
        const angle = xScale(axis.name) ?? 0;
        const radius = yScales[axis.name](countryData[axis.name] || 0);
        return [angle, radius];
      });

      // Verifica se o país tem pelo menos um dado válido
      const hasValidData = Object.values(countryData).some(
        (value) => value !== null && value !== 0
      );
      if (!hasValidData) return null; // Não desenhar a linha se não houver dados válidos

      coordinates.push(coordinates[0]); // Fechar o caminho
      return lineGenerator(coordinates);
    };

    // Gerar caminhos para cada país
    const linePaths = countries
      .map((country) => ({
        path: generateLinePath(parsedData[country]),
        color: country === "China" ? "blue" : "red",
      }))
      .filter((line) => line.path !== null); // Filtrar caminhos nulos

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
