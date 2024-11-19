import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export const LinePlot = ({ allData, data, country, width, height, margin }) => {
  const svgRef = useRef();
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [sectorOptions, setSectorOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!data || data.length === 0 || !country) return;

    const countryData = data.filter((d) => d.Country === country);
    const allCountryData = allData.filter((d) => d.Country === country);

    // Obter os setores únicos
    const sectors = Array.from(
      new Set(countryData.map((d) => d["Tech Sector"]))
    ).sort();

    // Atualizar as opções de setores
    setSectorOptions(sectors);

    // Verificar se existe apenas um setor e selecionar automaticamente
    if (sectors.length === 1) {
      setSelectedSectors([sectors[0]]);
      setShowDropdown(false);
    }

    // Obter os anos únicos
    const years = Array.from(new Set(countryData.map((d) => d.Year)));
    const allYears = Array.from(new Set(allCountryData.map((d) => d.Year)));

    // Calcular média geral para cada ano
    const averageData = allYears
      .map((year) => {
        const yearData = allCountryData.filter((d) => d.Year === year);
        return {
          year: new Date(year, 0, 1),
          avgRanking:
            d3.mean(yearData, (d) => +d["Global Innovation Ranking"]) || 0,
        };
      })
      .sort((a, b) => a.year - b.year);

    // Agrupar os dados por setor e calcular médias por ano
    const parsedData = sectors.map((sector) => {
      const sectorData = countryData.filter((d) => d["Tech Sector"] === sector);
      const values = years
        .map((year) => {
          const yearData = sectorData.filter((d) => d.Year === year);
          if (yearData.length === 0) return null;

          return {
            year: new Date(year, 0, 1),
            avgRanking:
              d3.mean(yearData, (d) => +d["Global Innovation Ranking"]) || null,
          };
        })
        .filter((d) => d !== null)
        .sort((a, b) => a.year - b.year);

      return { sector, values };
    });

    // Configuração do gráfico
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(averageData, (d) => d.year))
      .range([0, boundsWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          parsedData.flatMap((d) => d.values),
          (d) => d.avgRanking
        ),
      ])
      .range([boundsHeight, 0]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${boundsHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(
            years.length > 10 ? d3.timeYear.every(2) : d3.timeYear.every(1)
          )
          .tickFormat(d3.timeFormat("%Y"))
      );

    g.append("g").call(d3.axisLeft(yScale));

    const lineGenerator = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.avgRanking));

    g.append("path")
      .datum(averageData)
      .attr("fill", "none")
      .attr("stroke", "lightgray")
      .attr("stroke-dasharray", "4 4")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(sectors);

    parsedData.forEach((sectorData) => {
      if (selectedSectors.includes(sectorData.sector)) {
        g.append("path")
          .datum(sectorData.values)
          .attr("fill", "none")
          .attr("stroke", colorScale(sectorData.sector))
          .attr("stroke-width", 1.5)
          .attr("d", lineGenerator);

        const lastPoint = sectorData.values[sectorData.values.length - 1];
        if (lastPoint) {
          g.append("text")
            .attr("x", xScale(lastPoint.year) + 5)
            .attr("y", yScale(lastPoint.avgRanking))
            .attr("dy", "0.35em")
            .style("fill", colorScale(sectorData.sector))
            .style("font-size", "10px")
            .text(sectorData.sector);
        }
      }
    });

    g.append("text")
      .attr(
        "transform",
        `translate(${boundsWidth / 2},${boundsHeight + margin.bottom - 10})`
      )
      .style("text-anchor", "middle")
      .text("Ano");

    g.append("text")
      .attr("transform", `translate(-30,${boundsHeight / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Ranking Global Médio de Inovação");
  }, [data, country, selectedSectors, width, height, margin]);

  const handleSectorChange = (sector) => {
    setSelectedSectors((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  return (
    <div>
      {sectorOptions.length > 1 && (
        <div style={{ margin: "10px 0", position: "relative" }}>
          <label
            htmlFor="sector-select"
            style={{
              marginRight: "10px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Selecione os setores:
          </label>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              cursor: "pointer",
              padding: "8px 10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              width: "200px",
              background: "#fff",
              display: "inline-block",
              fontSize: "14px",
              position: "relative",
            }}
          >
            Selecione os setores
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              ▼
            </span>
          </div>

          {showDropdown && (
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                width: "200px",
                maxHeight: "150px",
                overflowY: "auto",
                background: "#fff",
                position: "absolute",
                zIndex: 10,
                marginTop: "5px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                left: "29%",
                marginLeft: "5px",
              }}
            >
              {sectorOptions.map((sector) => (
                <label
                  key={sector}
                  style={{
                    display: "block",
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sector)}
                    onChange={() => handleSectorChange(sector)}
                    style={{ marginRight: "8px" }}
                  />
                  {sector}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};
