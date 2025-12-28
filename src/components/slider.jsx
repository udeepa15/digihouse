import React, { useEffect, useState } from "react";

export const Slider = (props) => {
  const images = Array.isArray(props.data) ? props.data : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  if (!images || images.length === 0) {
    return (
      <div id="slider" className="text-center">
        <div className="container">
          <div className="section-title">
            <h2>Image Slider</h2>
            <p>Upload images to the Slider section to display here.</p>
          </div>
          <div style={{height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', borderRadius: 8}}>
            <span style={{color: '#777'}}>Images coming soon…</span>
          </div>
        </div>
      </div>
    );
  }

  const current = images[index];

  return (
    <div id="slider" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Image Slider</h2>
          <p>Showcase your work with a horizontal slideshow.</p>
        </div>
        <div className="slider-container">
          <div className="slider-frame">
            <img src={current.src} alt={current.title || `Slide ${index + 1}`} className="slider-image" />
          </div>
          <div className="slider-controls">
            <button className="btn btn-default" onClick={() => setIndex((index - 1 + images.length) % images.length)}>
              ←
            </button>
            <span className="slider-indicator">{index + 1} / {images.length}</span>
            <button className="btn btn-default" onClick={() => setIndex((index + 1) % images.length)}>
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
