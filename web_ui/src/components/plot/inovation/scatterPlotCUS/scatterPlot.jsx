import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const ScatterPlotCUS = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Extrair as informações necessárias para o gráfico de dispersão
    const plotData = data.map((d) => ({
      country: d["Country"], // Supondo que você tenha um campo 'Country' nos dados
      patents: +d["Number of Patents Filed (Annual)"],
      rndInvestment: +d["R&D Investment (in USD)"],
    }));

    console.log(plotData);

    // Definir as escalas para os eixos
    const xScale = d3
      .scaleLog() // Usar escala logarítmica para o investimento em R&D (para lidar com grandes variações)
      .domain([
        d3.min(plotData, (d) => d.rndInvestment),
        d3.max(plotData, (d) => d.rndInvestment),
      ])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear() // Escala linear para o número de patentes
      .domain([0, d3.max(plotData, (d) => d.patents)])
      .range([height - margin.top - margin.bottom, 0]);

    // Limpar qualquer conteúdo anterior do gráfico
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Adicionar grupo para os eixos
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Eixo X com ticks de 10 em 10
    g.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(
        d3.axisBottom(xScale).ticks(10) // Usar a base 10 para intervalos consistentes
      ); // Usar a base 10 para intervalos consistentes

    // Eixo Y
    g.append("g").call(d3.axisLeft(yScale));

    // Criar os círculos do gráfico de dispersão
    g.selectAll("circle")
      .data(plotData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.rndInvestment))
      .attr("cy", (d) => yScale(d.patents))
      .attr("r", 5)
      .style("fill", (d) => {
        if (d.country === "Japan") return "red"; // Cor vermelha para o Japão
        if (d.country === "China") return "green"; // Cor verde para a China
        return "steelblue"; // Cor padrão
      })
      .style("opacity", 0.7);
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
