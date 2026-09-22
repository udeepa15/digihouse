import React, { useState, useEffect } from "react";

// Hero background slideshow image references (7-image rotation)
// hero-01.jpg = creative studio / general company services
// hero-02.jpg = commercial and large-format printing
// hero-03.jpg = promotional materials / printed products / merchandise
// hero-04.jpg = event printing / banners / signage
// hero-05.jpg = entertainment / concert / stage environment
// hero-06.jpg = event production / backstage / lighting / production
// hero-07.jpg = combined printing + entertainment / overall company experience
const HERO_IMAGES = [
  "/image/hero-01.jpg",
  "/image/hero-02.jpg",
  "/image/hero-03.jpg",
  "/image/hero-04.jpg",
  "/image/hero-05.jpg",
  "/image/hero-06.jpg",
  "/image/hero-07.jpg",
];

export const Header = (props) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has requested reduced motion for accessibility
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return; // Skip auto-advance if reduced motion is preferred
    }

    // Preload all slideshow images into browser cache to avoid transition flicker
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Automatic slideshow timer: advance to next slide every 5.5 seconds (5500ms)
    const interval = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  return (
    <header id="header">
      <div className="intro">
        {/* Hero background 7-image slideshow container */}
        <div className="hero-slideshow" aria-hidden="true">
          {HERO_IMAGES.map((imgSrc, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url(${imgSrc})` }}
            />
          ))}
        </div>

        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <h1>
                  {props.data ? props.data.title : "Loading"}
                  <span></span>
                </h1>
                <p>{props.data ? props.data.paragraph : "Loading"}</p>
                <a
                  href="#services"
                  className="btn btn-custom btn-lg page-scroll"
                >
                  Our Services
                </a>{" "}
                <a
                  href="#contact"
                  className="btn btn-custom btn-lg page-scroll"
                >
                  Get a Quote
                </a>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

