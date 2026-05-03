import React from 'react'
import PlantDiseasePredictor from './PlantDiseasePredictor'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Leaf Disease AI</h1>
        <p>Instantly diagnose plant diseases using advanced machine learning</p>
      </header>
      
      <main>
        <PlantDiseasePredictor />
      </main>
    </div>
  )
}

export default App
