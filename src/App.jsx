import React, { useEffect, useState } from "react";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Gallery } from "./components/gallery";
import { Contact } from "./components/contact";
import { Applications } from "./components/applications";
import { ApplicationFormPage } from "./components/ApplicationFormPage";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const parseHash = () => {
  const hash = window.location.hash.replace(/^#/, "");

  if (hash.startsWith("applications/")) {
    return {
      view: "application-form",
      applicationKey: hash.split("/")[1] || "",
    };
  }

  if (hash === "applications") {
    return { view: "applications" };
  }

  return { view: "home" };
};

const App = () => {
  const [landingPageData] = useState(JsonData);
  const [pageState, setPageState] = useState(parseHash());

  useEffect(() => {
    const handleHashChange = () => setPageState(parseHash());

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageState.view, pageState.applicationKey]);

  return (
    <div>
      <Navigation currentPage={pageState.view} />
      {pageState.view === "application-form" ? (
        <ApplicationFormPage applicationKey={pageState.applicationKey} />
      ) : pageState.view === "applications" ? (
        <Applications />
      ) : (
        <>
          <Header data={landingPageData.Header} />
          <Features data={landingPageData.Features} />
          <About data={landingPageData.About} />
          <Services data={landingPageData.Services} />
          <Gallery data={landingPageData.Gallery} />
          <Contact data={landingPageData.Contact} />
        </>
      )}
    </div>
  );
};

export default App;
