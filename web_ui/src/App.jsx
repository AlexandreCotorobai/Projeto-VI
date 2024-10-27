import Router from "./utils/Router.jsx";
import { DataProvider, useData } from "./contexts/data.jsx";

const App = () => {
  const { isLoading } = useData();
  return (
    <DataProvider>
      {isLoading && <div>Loading...</div>}
      {!isLoading && <Router />}
    </DataProvider>
  );
};

export default App;
