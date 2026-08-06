import React from "react";

export const Services = (props) => {
  return (
    <div id="services" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Our Services</h2>
          <p>
            Professional digital printing and photography services tailored to your needs.
          </p>
        </div>

        <div className="mobile-swipe-hint">
          <i className="fa fa-hand-o-left"></i>
          <span>Swipe left &amp; right to explore all services</span>
          <i className="fa fa-hand-o-right"></i>
        </div>

        <div className="services-grid">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="service-card">
                  <div className="service-icon-wrap">
                    <i className={d.icon}></i>
                  </div>
                  <div className="service-desc">
                    <h3>{d.name}</h3>
                    <p>{d.text}</p>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};

export default Services;
