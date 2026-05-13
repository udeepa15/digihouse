import React from "react";
import { applicationList } from "./applicationTypes";

export const Applications = () => {
  return (
    <main id="applications" className="applications-page">
      <section className="applications-hero">
        <div className="container">
          <div className="row">
            <div className="col-md-10 col-md-offset-1 text-center">
              <span className="applications-kicker">Applications</span>
              <h1>Select the application type you want to fill</h1>
              <p>
                Choose one of the available application types below. You will be taken to a
                dedicated page containing only the form for that application.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="applications-content">
        <div className="container">
          <div className="row">
            {applicationList.map((application) => (
              <div key={application.key} className="col-md-6">
                <a className="application-card" href={`#applications/${application.key}`}>
                  <div className="application-card-inner">
                    <span className="application-card-label">Application Type</span>
                    <h3>{application.title}</h3>
                    <p>{application.description}</p>
                    <span className="application-card-link">Open form only</span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};