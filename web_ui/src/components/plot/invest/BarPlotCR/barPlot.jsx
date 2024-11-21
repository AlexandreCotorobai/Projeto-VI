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
      const chinaData = data.filter(
        (d) => d["Tech Sector"] === sector && d.Country === "China"
      );
      const japanData = data.filter(
        (d) => d["Tech Sector"] === sector && d.Country === "Japan"
      );

      const averageChinaRanking =
        d3.sum(chinaData, (d) => +d["Venture Capital Funding (in USD)"]) /
          1000000000 || 0;

      const averageJapanRanking =
        d3.sum(japanData, (d) => +d["Venture Capital Funding (in USD)"]) /
          1000000000 || 0;

      return {
        sector,
        chinaRanking: averageChinaRanking,
        japanRanking: averageJapanRanking,
      };
    });

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
        0,
        d3.max(groupedData, (d) => Math.max(d.chinaRanking, d.japanRanking)) +
          100,
      ])
      .range([boundsHeight, 0]);

    // Criar o SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

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

    // Adicionar grelha nos eixos
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-boundsWidth).tickFormat(""))
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "2,2");

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale).tickSize(-boundsHeight).tickFormat(""))
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "2,2");

    // Eixo X com labels alternadas acima/abaixo
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("y", (d, i) => (i % 2 === 0 ? 5 : 13)); // Alternar posições acima e abaixo

    // Eixo Y
    g.append("g").call(d3.axisLeft(yScale));

    // Adicionar barras para a China
    if (groupedData.some((d) => d.chinaRanking > 0)) {
      g.selectAll(".bar-china")
        .data(groupedData)
        .join("rect")
        .attr("class", "bar-china")
        .attr("x", (d) => xScale(d.sector))
        .attr("y", (d) => yScale(d.chinaRanking))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", (d) => boundsHeight - yScale(d.chinaRanking))
        .attr("fill", "#e63946")
        .on("mouseover", (event, d) => {
          tooltip
            .html(
              `<strong>China</strong><br>Setor: ${
                d.sector
              }<br>Financiamento: ${d.chinaRanking.toFixed(2)}B USD`
            )
            .style("visibility", "visible");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    }

    // Adicionar barras para o Japão
    if (groupedData.some((d) => d.japanRanking > 0)) {
      g.selectAll(".bar-japan")
        .data(groupedData)
        .join("rect")
        .attr("class", "bar-japan")
        .attr("x", (d) => xScale(d.sector) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d.japanRanking))
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", (d) => boundsHeight - yScale(d.japanRanking))
        .attr("fill", "#345d7e")
        .on("mouseover", (event, d) => {
          tooltip
            .html(
              `<strong>Japão</strong><br>Setor: ${
                d.sector
              }<br>Financiamento: ${d.japanRanking.toFixed(2)}B USD`
            )
            .style("visibility", "visible");
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
    }

    // Adicionar labels aos eixos
    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 5})`
      )
      .style("text-anchor", "middle")
      .text("Setores");

    g.append("text")
      .attr("transform", `translate(-40,${boundsHeight / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Financiamento de capital de risco (em Bilhões USD)");

    // Legenda condicional
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 150},${margin.top})`);

    if (groupedData.some((d) => d.chinaRanking > 0)) {
      legend
        .append("rect")
        .attr("x", 54)
        .attr("y", 1)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#e63946");

      legend
        .append("text")
        .attr("x", 74)
        .attr("y", 13)
        .text("China")
        .style("font-size", "12px");
    }

    if (groupedData.some((d) => d.japanRanking > 0)) {
      legend
        .append("rect")
        .attr("x", 54)
        .attr("y", 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#345d7e");

      legend
        .append("text")
        .attr("x", 72)
        .attr("y", 32)
        .text("Japão")
        .style("font-size", "12px");
    }
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
