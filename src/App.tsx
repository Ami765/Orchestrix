import React from "react";
import { HashRouter as Router } from "react-router-dom";
import AppRouter from "./router";

export default function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}
