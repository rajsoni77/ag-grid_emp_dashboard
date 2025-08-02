import React from 'react';
import EmployeeGrid from './components/EmployeeGrid';
import 'ag-grid-community/styles/ag-theme-alpine.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <EmployeeGrid />
    </div>
  );
}

export default App;