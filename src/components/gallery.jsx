import { Image } from "./image";
import React, { useState, useEffect } from "react";

export const Gallery = (props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = props.data || [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, data.length - 1) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= data.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!data.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= data.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  return (
    <div id="portfolio" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Our Work</h2>
          <p>
            Browse our showcase of printing projects, event setups, and high-quality productions.
          </p>
        </div>

        {/* Horizontal Slideshow */}
        <div className="work-carousel-wrapper">
          <button
            type="button"
            className="carousel-control-btn prev-btn"
            onClick={handlePrev}
            aria-label="Previous Work"
          >
            <i className="fa fa-chevron-left"></i>
          </button>

          <div className="work-carousel-track-container">
            <div
              className="work-carousel-track"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {data.map((d, i) => (
                <div key={`${d.title}-${i}`} className="work-carousel-slide">
                  <Image
                    title={d.title}
                    largeImage={d.largeImage}
                    smallImage={d.smallImage}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="carousel-control-btn next-btn"
            onClick={handleNext}
            aria-label="Next Work"
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>

        {/* Carousel Indicators / Dots */}
        <div className="carousel-dots">
          {data.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

