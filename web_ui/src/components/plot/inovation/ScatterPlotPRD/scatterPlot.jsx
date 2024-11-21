import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const ScatterPlotPRD = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Extrair as informações necessárias para o gráfico de dispersão
    const plotData = data.map((d) => ({
      country: d["Country"],
      patents: +d["Number of Patents Filed (Annual)"],
      rndInvestment: +d["R&D Investment (in USD)"],
    }));

    // Verificar se há dados para os países
    const hasChinaData = plotData.some((d) => d.country === "China");
    const hasJapanData = plotData.some((d) => d.country === "Japan");

    // Definir as escalas para os eixos
    const xScale = d3
      .scaleLog()
      .domain([
        d3.min(plotData, (d) => d.rndInvestment),
        d3.max(plotData, (d) => d.rndInvestment),
      ])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(plotData, (d) => d.patents)])
      .range([height - margin.top - margin.bottom, 0]);

    // Limpar qualquer conteúdo anterior do gráfico
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Adicionar grupo principal para os elementos do gráfico
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip para exibir informações ao passar o mouse sobre os pontos
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
        d3
          .axisLeft(yScale)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "2,2");

    // Adicionar grelha no eixo X
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10, "~s")
          .tickSize(-height + margin.top + margin.bottom)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "2,2");

    // Eixo X
    g.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10, "~s"))
      .append("text")
      .attr("x", width / 2 - margin.left)
      .attr("y", 35)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Investimento em R&D (USD)");

    // Eixo Y
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 + margin.top)
      .attr("y", -39)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Número de Patentes");

    // Criar os círculos do gráfico de dispersão
    g.selectAll("circle")
      .data(plotData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.rndInvestment))
      .attr("cy", (d) => yScale(d.patents))
      .attr("r", 6)
      .style("fill", (d) => {
        if (d.country === "Japan") return "#345d7e";
        if (d.country === "China") return "#e63946";
        return "steelblue";
      })
      .style("opacity", 0.8)
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>${d.country}</strong><br>Investimento: ${d.rndInvestment}<br>Patentes: ${d.patents}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Adicionar a legenda condicionalmente
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 10},${margin.top})`);

    if (hasChinaData) {
      legend
        .append("rect")
        .attr("x", 450)
        .attr("y", -28)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#e63946");

      legend
        .append("text")
        .attr("x", 470)
        .attr("y", -20)
        .text("China")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    }

    if (hasJapanData) {
      legend
        .append("rect")
        .attr("x", 380)
        .attr("y", -28)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#345d7e");

      legend
        .append("text")
        .attr("x", 400)
        .attr("y", -20)
        .text("Japão")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
    }
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
