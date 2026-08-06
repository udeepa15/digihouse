import React from "react";

export const Header = (props) => {
  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <div className="hero-logo-wrap">
                  <img src="img/Logo.png" alt="ADL Digihouse Logo" className="hero-logo-img" />
                </div>
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
