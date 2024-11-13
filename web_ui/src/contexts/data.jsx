import { createContext, useContext, useEffect, useState } from "react";
import * as d3 from "d3";

export const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching Data");
        const data = await d3.csv("dataset.csv");
        setData(data);
        console.log(data);
        console.log("Data Fetched");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data, isLoading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};
