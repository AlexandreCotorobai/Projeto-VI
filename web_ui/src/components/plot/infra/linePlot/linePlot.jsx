import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const LinePlot = ({ data, width, height, margin, country }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Filtra os dados para o país selecionado
    data = data.filter((d) => d.Country === country);

    // Agrupar dados por ano e calcular médias, substituindo valores null por 0
    const parsedData = {}; // Objeto onde os dados serão armazenados

    // Obtém os anos únicos presentes no conjunto de dados
    const years = Array.from(new Set(data.map((d) => d.Year)));

    years.forEach((year) => {
      // Filtra os dados para o ano específico
      const yearData = data.filter((d) => d.Year === year);

      // Calcula a média de 5G Network Coverage (%) e Internet Penetration (%)
      const avg5G = d3.mean(yearData, (d) => +d["5G Network Coverage (%)"]);
      const avgInternet = d3.mean(
        yearData,
        (d) => +d["Internet Penetration (%)"]
      );

      // Armazena os resultados no objeto parsedData
      parsedData[year] = {
        year: new Date(year), // Converte o ano para um objeto Date
        avg5G: avg5G || 0, // Substitui valores null ou undefined por 0
        avgInternet: avgInternet || 0, // Substitui valores null ou undefined por 0
      };
    });

    // Set up the margins and dimensions for the chart
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    // Select the SVG element and clear it
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up the scales for the axes
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(Object.values(parsedData), (d) => d.year)) // X scale based on years
      .range([0, boundsWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100]) // Y scale goes from 0 to 100 for percentages
      .range([boundsHeight, 0]);

    // Set up the line generators for 5G Network Coverage and Internet Penetration
    const lineGenerator5G = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.avg5G));

    const lineGeneratorInternet = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.avgInternet));

    // Append the chart group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw the axes
    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(
            years.length > 10 // Verifica o número de anos no conjunto de dados
              ? d3.timeYear.every(2)
              : d3.timeYear.every(1) // Exibe todos os anos quando há poucos dados
          )
          .tickFormat(d3.timeFormat("%Y")) // Formata os ticks como anos (YYYY)
      );

    g.append("g").call(d3.axisLeft(yScale));

    // Add the line for 5G Network Coverage
    g.append("path")
      .datum(Object.values(parsedData)) // Pass the array of parsed data
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator5G);

    // Add the line for Internet Penetration
    g.append("path")
      .datum(Object.values(parsedData)) // Pass the array of parsed data
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("d", lineGeneratorInternet);

    // Add the legend for 5G Network Coverage
    g.append("circle")
      .attr("cx", boundsWidth - 110)
      .attr("cy", 20)
      .attr("r", 6)
      .style("fill", "steelblue");

    g.append("text")
      .attr("x", boundsWidth - 100)
      .attr("y", 20)
      .attr("dy", ".35em")
      .text("5G Coverage (%)");

    // Add the legend for Internet Penetration
    g.append("circle")
      .attr("cx", boundsWidth - 160)
      .attr("r", 6)
      .style("fill", "green");

    g.append("text")
      .attr("x", boundsWidth - 150)
      .attr("dy", ".35em")
      .text("Internet Penetration (%)");

    // Add labels
    g.append("text")
      .attr(
        "transform",
        `translate(${width / 3},${height - margin.bottom + 5})`
      )
      .text("Year");

    // Add labels
    g.append("text")
      .attr("transform", `translate(-30,${height / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Value (%)");
  }, [data, width, height, margin, country]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
