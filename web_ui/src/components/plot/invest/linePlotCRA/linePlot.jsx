import { useEffect, useRef } from "react";
import * as d3 from "d3";

export const LinePlotCRA = ({ data, width, height, margin }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Agrupar dados por ano e calcular médias, substituindo valores null por 0
    const parsedData = {}; // Objeto onde os dados serão armazenados

    // Obtém os anos únicos presentes no conjunto de dados
    const years = Array.from(new Set(data.map((d) => d.Year)));

    years.forEach((year) => {
      // Filtra os dados para o ano específico
      const yearData = data.filter((d) => d.Year === year);

      // Calcula a média de 5G Network Coverage (%) e Internet Penetration (%)
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

      // Armazena os resultados no objeto parsedData
      parsedData[year] = {
        year: new Date(year), // Converte o ano para um objeto Date
        sumStartupsChina: sumStartupsChina || 0, // Substitui valores null ou undefined por 0
        sumStartupsJapan: sumStartupsJapan || 0, // Substitui valores null ou undefined por 0
      };
    });

    // Set up the margins and dimensions for the chart
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    console.log(Object.values(parsedData));
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
      .domain([
        0,
        d3.max(Object.values(parsedData), (d) =>
          Math.max(d.sumStartupsChina, d.sumStartupsJapan)
        ),
      ])
      .range([boundsHeight, 0]);

    // Set up the line generators for 5G Network Coverage and Internet Penetration
    const lineGeneratorChina = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sumStartupsChina));

    const lineGeneratorJapan = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.sumStartupsJapan));

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
      .attr("d", lineGeneratorChina);

    // Add the line for Internet Penetration
    g.append("path")
      .datum(Object.values(parsedData)) // Pass the array of parsed data
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1.5)
      .attr("d", lineGeneratorJapan);

    // Add the legend for 5G Network Coverage
    g.append("circle")
      .attr("cx", boundsWidth - 50)
      .attr("cy", 20)
      .attr("r", 6)
      .style("fill", "steelblue");

    g.append("text")
      .attr("x", boundsWidth - 40)
      .attr("y", 20)
      .attr("dy", ".35em")
      .text("China");

    // Add the legend for Internet Penetration
    g.append("circle")
      .attr("cx", boundsWidth - 50)
      .attr("r", 6)
      .style("fill", "green");

    g.append("text")
      .attr("x", boundsWidth - 40)
      .attr("dy", ".35em")
      .text("Japão");

    // Add labels
    g.append("text")
      .attr(
        "transform",
        `translate(${width / 3},${height - margin.bottom + 5})`
      )
      .text("Year");

    // Add labels
    g.append("text")
      .attr("transform", `translate(-30,${height / 2 - 30}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Financiamento de Capital de Risco (x10^9 USD)");
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};
