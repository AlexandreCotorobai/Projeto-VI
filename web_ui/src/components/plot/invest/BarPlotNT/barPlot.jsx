import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const BarPlotNT = ({ data, width, height, margin }) => {
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
      .padding(0); // Remover o espaço entre as barras do mesmo setor

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(groupedData, (d) => Math.max(d.China, d.Japan)) + 50000,
      ])
      .range([boundsHeight, 0]);

    // Criar o SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 15},${margin.top})`);

    // Configurar tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border-radius", "4px")
      .style("border", "1px solid #ccc")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Adicionar grelha no eixo Y
    g.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale).tickSize(-boundsWidth).tickFormat("") // Remove os labels da grelha
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "2,2");

    // Adicionar grelha no eixo X
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(
        d3.axisBottom(xScale).tickSize(-boundsHeight).tickFormat("") // Remove os labels da grelha
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "2,2");

    // Eixo X com labels alternadas
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("y", (d, i) => (i % 2 === 0 ? 5 : 15))
      .attr("transform", (d, i) => (i % 2 === 0 ? "" : "rotate(0)"));

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
      .attr("fill", (d) => (d.country === "China" ? "#e63946" : "#345d7e"))
      .style("opacity", (d) => (d.value > 0 ? 1 : 0)) // Esconde barras com valor 0
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>${
              d.country === "China" ? "China" : "Japão"
            }</strong><br>Setor: ${
              d.sector
            }<br>Trabalhadores: ${d.value.toFixed(0)}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

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

    // Legenda condicional
    const legend = svg
      .append("g")
      .attr("transform", `translate(${boundsWidth - 100},${margin.top})`);

    if (groupedData.some((d) => d.China > 0)) {
      legend
        .append("rect")
        .attr("x", 110)
        .attr("y", 2)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#e63946");

      legend
        .append("text")
        .attr("x", 130)
        .attr("y", 12)
        .text("China")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    }

    if (groupedData.some((d) => d.Japan > 0)) {
      legend
        .append("rect")
        .attr("x", 110)
        .attr("y", 22)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#345d7e");

      legend
        .append("text")
        .attr("x", 128)
        .attr("y", 32)
        .text("Japão")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    }
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
