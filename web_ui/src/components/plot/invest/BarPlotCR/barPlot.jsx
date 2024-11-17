import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const BarPlotCR = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Filtrar setores únicos
    const sectors = Array.from(new Set(data.map((d) => d["Tech Sector"])));

    // Processar dados para calcular as médias do ranking global para a China e o Japão
    const groupedData = sectors.map((sector) => {
      // Filtrar dados para China e Japão
      const chinaData = data.filter(
        (d) => d["Tech Sector"] === sector && d.Country === "China"
      );
      const japanData = data.filter(
        (d) => d["Tech Sector"] === sector && d.Country === "Japan"
      );

      // Calcular a média do ranking global para a China
      const averageChinaRanking =
        d3.sum(chinaData, (d) => +d["Venture Capital Funding (in USD)"]) /
          1000000000 || 0;

      // Calcular a média do ranking global para o Japão
      const averageJapanRanking =
        d3.sum(japanData, (d) => +d["Venture Capital Funding (in USD)"]) /
          1000000000 || 0;

      return {
        sector,
        chinaRanking: averageChinaRanking,
        japanRanking: averageJapanRanking,
      };
    });

    console.log(groupedData);

    // Dimensões do gráfico
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    // Escalas
    const xScale = d3
      .scaleBand()
      .domain(groupedData.map((d) => d.sector))
      .range([0, boundsWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(groupedData, (d) =>
          Math.min(d.chinaRanking - 500, d.japanRanking - 500)
        ),
        d3.max(groupedData, (d) => Math.max(d.chinaRanking, d.japanRanking)),
      ])
      .range([boundsHeight, 0]);

    // Criar o SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 15},${margin.top})`);

    // Eixo X com labels ajustadas
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", (d, i) => (i % 2 === 0 ? "0.5em" : "1.5em")) // Alterna a posição vertical
      .attr("transform", (d, i) => (i % 2 === 0 ? "" : "rotate(0)")); // Pode ajustar a rotação, se necessário

    // Eixo Y - Ranking Global
    g.append("g").call(d3.axisLeft(yScale));

    // Adicionar barras para a China
    g.append("g")
      .selectAll("g")
      .data(groupedData)
      .join("g")
      .attr("transform", (d) => `translate(${xScale(d.sector)},0)`)
      .append("rect")
      .attr("x", 0) // Barra da China começa no eixo X
      .attr("y", (d) => yScale(d.chinaRanking))
      .attr("width", xScale.bandwidth() / 2) // Largura para a barra da China
      .attr("height", (d) => boundsHeight - yScale(d.chinaRanking))
      .attr("fill", "steelblue");

    // Adicionar barras para o Japão
    g.append("g")
      .selectAll("g")
      .data(groupedData)
      .join("g")
      .attr(
        "transform",
        (d) => `translate(${xScale(d.sector) + xScale.bandwidth() / 2},0)`
      )
      .append("rect")
      .attr("x", 0) // Barra do Japão começa após a da China
      .attr("y", (d) => yScale(d.japanRanking))
      .attr("width", xScale.bandwidth() / 2) // Largura para a barra do Japão
      .attr("height", (d) => boundsHeight - yScale(d.japanRanking))
      .attr("fill", "orange");

    // Adicionar labels aos eixos
    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 5})`
      )
      .style("text-anchor", "middle")
      .text("Setores");

    g.append("text")
      .attr("transform", `translate(-40,${height / 2 - 30}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Financiamento de Capital de Risco (x10^9 USD)");

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

    legend
      .append("circle")
      .attr("cx", 50)
      .attr("cy", 20)
      .attr("r", 6)
      .style("fill", "orange");

    legend
      .append("text")
      .attr("x", 60)
      .attr("y", 20)
      .text("Japão")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
