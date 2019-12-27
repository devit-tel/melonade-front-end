import React from "react";
import { DateRangeProvider } from "./contexts/DateRangeContext";
import Router from "./Router";

const App: React.FC = () => {
  return (
    <DateRangeProvider>
      <Router />
    </DateRangeProvider>
  );
};

export default App;
