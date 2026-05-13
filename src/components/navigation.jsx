import React from "react";

export const Navigation = (props) => {
  const currentPage = props.currentPage || "home";
  const isApplicationsPage = currentPage === "applications";
  const isFormPage = currentPage === "application-form";

  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            {" "}
            <span className="sr-only">Toggle navigation</span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
          </button>
          <a className="navbar-brand page-scroll" href={isApplicationsPage || isFormPage ? "#home" : "#page-top"}>
            ADL Digihouse
          </a>{" "}
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            {isFormPage ? (
              <>
                <li>
                  <a href="#home" className="page-scroll">
                    Home
                  </a>
                </li>
                <li className="active">
                  <a href="#applications" className="page-scroll">
                    Applications
                  </a>
                </li>
              </>
            ) : isApplicationsPage ? (
              <>
                <li>
                  <a href="#home" className="page-scroll">
                    Home
                  </a>
                </li>
                <li className="active">
                  <a href="#applications" className="page-scroll">
                    Applications
                  </a>
                </li>
                <li>
                  <a href="#contact" className="page-scroll">
                    Contact
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="#features" className="page-scroll">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#about" className="page-scroll">
                    About
                  </a>
                </li>
                <li>
                  <a href="#services" className="page-scroll">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#portfolio" className="page-scroll">
                    Our Work
                  </a>
                </li>
                <li>
                  <a href="#applications" className="page-scroll">
                    Applications
                  </a>
                </li>
                <li>
                  <a href="#contact" className="page-scroll">
                    Contact
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
