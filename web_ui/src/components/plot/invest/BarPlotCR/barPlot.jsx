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

    // Eixo X
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale));

    // Eixo Y
    g.append("g").call(d3.axisLeft(yScale));

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

    // Adicionar barras para a China
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
            `<strong>China</strong><br>Sector: ${
              d.sector
            }<br>Funding: ${d.chinaRanking.toFixed(2)}B USD`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Adicionar barras para o Japão
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
            `<strong>Japan</strong><br>Sector: ${
              d.sector
            }<br>Funding: ${d.japanRanking.toFixed(2)}B USD`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Adicionar labels aos eixos
    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 5})`
      )
      .style("text-anchor", "middle")
      .text("Tech Sectors");

    g.append("text")
      .attr("transform", `translate(-40,${boundsHeight / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Venture Capital Funding (in B USD)");

    // Legenda
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 150},${margin.top})`);

    legend
      .append("rect")
      .attr("x", 50)
      .attr("y", 1)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#e63946");

    legend
      .append("text")
      .attr("x", 70)
      .attr("y", 13)
      .text("China")
      .style("font-size", "12px");

    legend
      .append("rect")
      .attr("x", 50)
      .attr("y", 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#345d7e");

    legend
      .append("text")
      .attr("x", 68)
      .attr("y", 32)
      .text("Japão")
      .style("font-size", "12px");
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
