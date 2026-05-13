import React from "react";
import { DoctorApplicationForm } from "./DoctorApplicationForm";
import { OfficeApplicationForm } from "./OfficeApplicationForm";
import { getApplicationByKey } from "./applicationTypes";

export const ApplicationFormPage = ({ applicationKey }) => {
  const application = getApplicationByKey(applicationKey);

  if (!application) {
    return (
      <main className="applications-page">
        <section className="applications-content">
          <div className="container text-center">
            <div className="applications-card">
              <h2>Application not found</h2>
              <p>The selected application type does not exist.</p>
              <a href="#applications" className="btn btn-custom btn-lg">
                Back to Applications
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="applications-page">
      <section className="applications-content">
        <div className="container">
          <div className="applications-card applications-card--form">
            <div className="section-title text-center">
              <h2>{application.title}</h2>
              <p>{application.description}</p>
            </div>

            <div className="applications-form-back text-center">
              <a href="#applications" className="btn btn-custom btn-lg">
                Back to Application Types
              </a>
            </div>

            {application.key === "doctor" ? <DoctorApplicationForm /> : <OfficeApplicationForm />}
          </div>
        </div>
      </section>
    </main>
  );
};