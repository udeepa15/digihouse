import React, { useState, useEffect, Suspense } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const Features = React.lazy(() => import("./components/features").then(m => ({ default: m.Features })));
const About = React.lazy(() => import("./components/about").then(m => ({ default: m.About })));
const Services = React.lazy(() => import("./components/services").then(m => ({ default: m.Services })));
const Gallery = React.lazy(() => import("./components/gallery").then(m => ({ default: m.Gallery })));
const Contact = React.lazy(() => import("./components/contact").then(m => ({ default: m.Contact })));

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <div>
      <Navigation />
      <Header data={landingPageData.Header} />
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <Features data={landingPageData.Features} />
      </Suspense>
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <About data={landingPageData.About} />
      </Suspense>
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <Services data={landingPageData.Services} />
      </Suspense>
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <Gallery data={landingPageData.Gallery} />
      </Suspense>
      <Suspense fallback={<div className="loading">Loading…</div>}>
        <Contact data={landingPageData.Contact} />
      </Suspense>
    </div>
  );
};

export default App;
