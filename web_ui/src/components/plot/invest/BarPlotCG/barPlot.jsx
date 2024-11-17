import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const BarPlotCG = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Filtrar setores únicos
    const sectors = Array.from(new Set(data.map((d) => d["Tech Sector"])));

    // Processar dados para calcular as médias por setor e país
    const groupedData = sectors.map((sector) => {
      const chinaData = data.filter(
        (d) => d["Tech Sector"] === sector && d.Country === "China"
      );
      const japanData = data.filter(
        (d) => d["Tech Sector"] === sector && d.Country === "Japan"
      );

      const chinaAverage =
        d3.mean(chinaData, (d) => +d["Number of Tech Workers"]) || 0;
      const japanAverage =
        d3.mean(japanData, (d) => +d["Number of Tech Workers"]) || 0;

      return {
        sector,
        China: chinaAverage,
        Japan: japanAverage,
      };
    });

    // Dimensões do gráfico
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    // Escalas
    const xScale = d3
      .scaleBand()
      .domain(groupedData.map((d) => d.sector)) // Setores no eixo x
      .range([0, boundsWidth])
      .padding(0.2);

    const xSubScale = d3
      .scaleBand()
      .domain(["China", "Japan"]) // Países no agrupamento
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(groupedData, (d) => Math.max(d.China, d.Japan))])
      .range([boundsHeight, 0]);

    // Criar o SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 15},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", (d, i) => (i % 2 === 0 ? "0.5em" : "1.5em")) // Alterna a posição vertical
      .attr("transform", (d, i) => (i % 2 === 0 ? "" : "rotate(0)")); // Pode ajustar a rotação, se necessário

    // Eixo Y
    g.append("g").call(d3.axisLeft(yScale));

    // Adicionar barras
    g.append("g")
      .selectAll("g")
      .data(groupedData)
      .join("g")
      .attr("transform", (d) => `translate(${xScale(d.sector)},0)`)
      .selectAll("rect")
      .data((d) => [
        { country: "China", value: d.China },
        { country: "Japan", value: d.Japan },
      ])
      .join("rect")
      .attr("x", (d) => xSubScale(d.country))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xSubScale.bandwidth())
      .attr("height", (d) => boundsHeight - yScale(d.value))
      .attr("fill", (d) => (d.country === "China" ? "steelblue" : "green"))
      .style("opacity", (d) => (d.value > 0 ? 1 : 0)); // Esconde barras com valor 0

    // Adicionar labels
    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 5})`
      )
      .style("text-anchor", "middle")
      .text("Setor");

    g.append("text")
      .attr("transform", `translate(-50,${boundsHeight / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Número Médio de Trabalhadores Tecnológicos");

    // Legenda
    const legend = svg
      .append("g")
      .attr("transform", `translate(${boundsWidth - 100},${margin.top})`);

    legend
      .append("circle")
      .attr("cx", 50)
      .attr("r", 6)
      .style("fill", "steelblue");

    legend
      .append("text")
      .attr("x", 60)
      .attr("y", 0)
      .text("China")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");

    legend.append("circle").attr("cx", 110).attr("r", 6).style("fill", "green");

    legend
      .append("text")
      .attr("x", 120)
      .attr("y", 0)
      .text("Japão")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
