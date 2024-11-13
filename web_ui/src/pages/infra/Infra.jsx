import React, { useEffect, useRef, useState } from "react";
import { useData } from "../../contexts/data.jsx";
import information from "./information.json";
import { DEFAULT_MARGIN } from "../../utils/utils.js";
import { Modal } from "../../components/modal/index.js";
import { Card } from "../../components/card/index.js";
import { ResponsiveWrapper } from "../../components/responsiveWrapper/index.js";
import { SpiderPlot } from "../../components/plot/spiderPlot/index.js";
import { TreePlot } from "../../components/plot/treePlot/index.js";
import { LinePlot } from "../../components/plot/linePlot/index.js";

export const Infra = (props) => {
  const [years, setYears] = useState([]);
  const [country, setCountry] = useState("all");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [modal, setModal] = useState({ title: "", content: "" });

  const sectorRef = useRef(null);
  const countryRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  const { data } = useData();
  const [filteredData, setFilteredData] = useState(data);

  const clearFilters = () => {
    setCountry("all");
    setStart("");
    setEnd("");
    setFilteredData(data);
    countryRef.current.value = "all";
    startRef.current.value = "";
    endRef.current.value = "";
  };

  const filterByCountry = (row) => country == "all" || row.Country == country;

  const filterByStart = (row) => start == "" || parseInt(row.Year) >= start;

  const filterByEnd = (row) => end == "" || parseInt(row.Year) <= end;

  const filterData = () =>
    data &&
    setFilteredData(() =>
      data.filter(
        (row) => filterByCountry(row) && filterByStart(row) && filterByEnd(row),
        []
      )
    );

  useEffect(() => {
    filterData();
  }, [country, start, end]);

  useEffect(() => {
    if (data) {
      const uniqueYears = Array.from(
        new Set(data.map((item) => item.Year))
      ).sort((a, b) => b - a);
      setYears(uniqueYears);
    }
    setFilteredData(() => data);
  }, [data]);

  return (
    <div
      className={
        "grid grid-cols-10 h-full gap-x-4 lg:overflow-y-hidden gap-y-2 lg:gap-y-0 mx-2"
      }
      id={"container"}
    >
      <div className={"col-span-full lg:col-span-2"}>
        <div className={"card bg-base-100"}>
          <div className={"card-body"}>
            <div className={"card-title mx-auto text-3xl"}>Filtros</div>
            <div className={"flex flex-col gap-2 m-5"}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-xl">País</span>
                </label>
                <select
                  className="select select-bordered"
                  onChange={(e) => setCountry(e.target.value)}
                  ref={countryRef}
                >
                  <option value={"all"}>All</option>
                  <option value={"China"}>China</option>
                  <option value={"Japan"}>Japão</option>
                </select>

                <label className="label">
                  <span className="label-text font-bold text-xl">Desde</span>
                </label>
                <select
                  className="select select-bordered"
                  onChange={(e) => setStart(e.target.value)}
                  ref={startRef}
                >
                  <option value=""></option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <label className="label">
                  <span className="label-text font-bold text-xl">Até</span>
                </label>
                <select
                  className="select select-bordered"
                  onChange={(e) => setEnd(e.target.value)}
                  ref={endRef}
                >
                  <option value=""></option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className={"btn btn-block bg-blue-500 text-white"}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          "col-span-full lg:col-span-8 grid grid-cols-4 lg:overflow-y-auto gap-2 pb-3 felx"
        }
      >
        {(country === "China" || country === "all") && (
          <Card
            title={"Utilização da Internet e Cobertura 5G - China"}
            info={information[0]}
            setModal={setModal}
          >
            <ResponsiveWrapper>
              {({ width, height }) => (
                <LinePlot
                  data={filteredData}
                  width={width}
                  height={height}
                  margin={DEFAULT_MARGIN}
                  country={"China"}
                />
              )}
            </ResponsiveWrapper>
          </Card>
        )}

        {(country === "Japan" || country === "all") && (
          <Card
            title={"Utilização da Internet e Cobertura 5G - Japão"}
            info={information[1]}
            setModal={setModal}
          >
            <ResponsiveWrapper>
              {({ width, height }) => (
                <LinePlot
                  data={filteredData}
                  width={width}
                  height={height}
                  margin={DEFAULT_MARGIN}
                  country={"Japan"}
                />
              )}
            </ResponsiveWrapper>
          </Card>
        )}
        <Card title={"Exportações"} info={information[2]} setModal={setModal}>
          <ResponsiveWrapper>
            {({ width, height }) => (
              <TreePlot
                data={filteredData}
                width={width}
                height={height}
                margin={DEFAULT_MARGIN}
              />
            )}
          </ResponsiveWrapper>
        </Card>
        <Card
          title={"Distribuição do Mercado"}
          info={information[3]}
          setModal={setModal}
        >
          <ResponsiveWrapper>
            {({ width, height }) => (
              <SpiderPlot data={filteredData} width={width} height={height} />
            )}
          </ResponsiveWrapper>
        </Card>
        <Modal title={modal.title} content={modal.content} />
      </div>
    </div>
  );
};
