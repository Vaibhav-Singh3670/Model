import React, { useState } from 'react';
import './PlantDiseasePredictor.css';

const PlantDiseasePredictor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://model-bwm8.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to predict. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-container">
      <button className="open-modal-btn" onClick={handleOpen}>
        Predict Plant Disease
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleClose}>&times;</button>
            <h2>Upload Leaf Image</h2>
            
            <div className="upload-area">
              <input 
                type="file" 
                accept="image/*" 
                id="file-upload" 
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-upload" className="file-label">
                {preview ? (
                  <img src={preview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="upload-placeholder">
                    <span>Click to select an image</span>
                  </div>
                )}
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            {result && (
              <div className="result-container">
                <h3>Prediction Result</h3>
                <p><strong>Disease:</strong> <span className="disease-name">{result.prediction.replace(/___/g, ' - ').replace(/_/g, ' ')}</span></p>
                <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
              </div>
            )}

            <button 
              className={`predict-btn ${loading ? 'loading' : ''}`} 
              onClick={handlePredict}
              disabled={loading || !selectedFile}
            >
              {loading ? 'Predicting...' : 'Predict'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDiseasePredictor;
