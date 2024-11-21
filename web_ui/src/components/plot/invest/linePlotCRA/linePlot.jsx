import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const LinePlotCRA = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Agrupar dados por ano e calcular médias
    const parsedData = {};
    const years = Array.from(new Set(data.map((d) => d.Year)));

    years.forEach((year) => {
      const yearData = data.filter((d) => d.Year === year);

      const sumStartupsChina =
        d3.sum(
          yearData.filter((d) => d.Country === "China"),
          (d) => +d["Venture Capital Funding (in USD)"]
        ) / 1000000000;
      const sumStartupsJapan =
        d3.sum(
          yearData.filter((d) => d.Country === "Japan"),
          (d) => +d["Venture Capital Funding (in USD)"]
        ) / 1000000000;

      parsedData[year] = {
        year: new Date(year),
        sumStartupsChina: sumStartupsChina || null,
        sumStartupsJapan: sumStartupsJapan || null,
      };
    });

    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(Object.values(parsedData), (d) => d.year))
      .range([0, boundsWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(Object.values(parsedData), (d) =>
          Math.min(
            d.sumStartupsChina || Infinity,
            d.sumStartupsJapan || Infinity
          )
        ) - 100,
        d3.max(Object.values(parsedData), (d) =>
          Math.max(
            d.sumStartupsChina || -Infinity,
            d.sumStartupsJapan || -Infinity
          )
        ) + 150,
      ])
      .range([boundsHeight, 0]);

    const lineGeneratorChina = d3
      .line()
      .defined((d) => d.sumStartupsChina !== null) // Ensure the line is drawn only if data exists
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sumStartupsChina));

    const lineGeneratorJapan = d3
      .line()
      .defined((d) => d.sumStartupsJapan !== null) // Ensure the line is drawn only if data exists
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sumStartupsJapan));

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("border", "1px solid #ccc")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Grelha nos eixos
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

    // Eixos principais
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    g.append("g").call(d3.axisLeft(yScale));

    // Linha para China
    g.append("path")
      .datum(Object.values(parsedData))
      .attr("fill", "none")
      .attr("stroke", "#e63946")
      .attr("stroke-width", 1.5)
      .attr("d", lineGeneratorChina);

    // Linha para Japão
    g.append("path")
      .datum(Object.values(parsedData))
      .attr("fill", "none")
      .attr("stroke", "#345d7e")
      .attr("stroke-width", 1.5)
      .attr("d", lineGeneratorJapan);

    // Pontos e tooltips para China
    g.selectAll(".dot-china")
      .data(
        Object.values(parsedData).filter((d) => d.sumStartupsChina !== null)
      ) // Only show points with data
      .join("circle")
      .attr("class", "dot-china")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.sumStartupsChina))
      .attr("r", 4)
      .attr("fill", "#e63946")
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>Year:</strong> ${d3.timeFormat("%Y")(
              d.year
            )}<br><strong>Venture Capital:</strong> ${d.sumStartupsChina.toFixed(
              2
            )}B USD`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Pontos e tooltips para Japão
    g.selectAll(".dot-japan")
      .data(
        Object.values(parsedData).filter((d) => d.sumStartupsJapan !== null)
      ) // Only show points with data
      .join("circle")
      .attr("class", "dot-japan")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.sumStartupsJapan))
      .attr("r", 4)
      .attr("fill", "#345d7e")
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `<strong>Year:</strong> ${d3.timeFormat("%Y")(
              d.year
            )}<br><strong>Venture Capital:</strong> ${d.sumStartupsChina.toFixed(
              2
            )}B USD`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // Labels
    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .text("Ano");

    g.append("text")
      .attr("transform", `translate(-40,${boundsHeight / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Financiamento de capital de risco (em Bilhões USD)");

    if (Object.values(parsedData).some((d) => d.sumStartupsChina !== null)) {
      g.append("rect")
        .attr("x", boundsWidth - 60)
        .attr("y", boundsHeight - 277)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "#e63946");

      g.append("text")
        .attr("x", boundsWidth - 40)
        .attr("y", boundsHeight - 270)
        .attr("dy", ".35em")
        .text("China");
    }

    if (Object.values(parsedData).some((d) => d.sumStartupsJapan !== null)) {
      g.append("rect")
        .attr("x", boundsWidth - 60)
        .attr("y", boundsHeight - 302)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "#345d7e");

      g.append("text")
        .attr("x", boundsWidth - 42)
        .attr("y", boundsHeight - 295)
        .attr("dy", ".35em")
        .text("Japão");
    }
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
