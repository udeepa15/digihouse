import React, { useMemo, useState } from "react";
import "./ApplicationFormBase.css";

const endpoint = process.env.REACT_APP_APPLICATIONS_WEBHOOK_URL || "/api/submit";

const createInitialState = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.name] = "";
    return accumulator;
  }, {});

const groupFieldsBySection = (fields) =>
  fields.reduce((accumulator, field) => {
    const sectionName = field.section || "Application Details";
    if (!accumulator[sectionName]) {
      accumulator[sectionName] = [];
    }
    accumulator[sectionName].push(field);
    return accumulator;
  }, {});

const renderField = (field, value, onChange, formData) => {
  const commonProps = {
    id: field.name,
    name: field.name,
    required: field.required,
    onChange,
    className: "form-control official-input",
  };

  if (field.type === "textarea") {
    return <textarea {...commonProps} value={value} rows={field.rows || "3"} />;
  }

  if (field.type === "select") {
    return (
      <select {...commonProps} value={value}>
        <option value="">Select</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "file") {
    return (
      <div>
        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={field.accept || "image/*"}
          onChange={onChange}
          className="form-control official-input official-file-input"
          required={field.required}
        />
        {formData[field.name] ? (
          <p className="official-file-name">Selected: {formData[field.name]}</p>
        ) : null}
      </div>
    );
  }

  if (field.type === "placeholderBox") {
    return (
      <div className="official-placeholder-box" aria-label={field.label}>
        <span>{field.placeholderText || "Reserved"}</span>
      </div>
    );
  }

  return <input {...commonProps} value={value} type={field.type} min={field.min} />;
};

export const ApplicationFormBase = ({ application }) => {
  const initialState = useMemo(() => createInitialState(application.fields), [application.fields]);
  const fieldSections = useMemo(() => groupFieldsBySection(application.fields), [application.fields]);
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, files, type } = event.target;
    const nextValue = type === "file" ? (files && files[0] ? files[0].name : "") : value;
    setFormData((previous) => ({ ...previous, [name]: nextValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const formDataToSend = new FormData(event.currentTarget);
      formDataToSend.append("applicationType", application.key);
      formDataToSend.append("applicationTitle", application.title);
      formDataToSend.append("submittedAt", new Date().toISOString());

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || (result && result.success === false)) {
        throw new Error(result.error || `Submission failed with status ${response.status}`);
      }

      setStatus({
        type: "success",
        message: "Application submitted successfully and saved to Google Sheets with Vercel Blob uploads.",
      });
      setFormData(initialState);
      event.currentTarget.reset();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Submission failed. Check the spreadsheet endpoint configuration.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="official-form-shell">
      <form className="application-form official-form-sheet" onSubmit={handleSubmit}>
        <header className="official-form-header">
          <h1>{application.headerTitle || "National Hospital Registration"}</h1>
          <h2>{application.headerSubtitle || "Hospital Identity / Registration Application Form"}</h2>
          <p>{application.formCode || "Form Ref: HRD-ID-01"}</p>
        </header>

        {Object.entries(fieldSections).map(([sectionName, fields]) => (
          <section key={sectionName} className="official-section">
            <h3>{sectionName}</h3>
            <div className="official-section-grid">
              {fields.map((field) => (
                <div key={field.name} className={`official-field-row ${field.fullWidth ? "full-width" : ""}`}>
                  <label htmlFor={field.name} className="official-label">
                    <span>{field.label}</span>
                    {field.labelSubtext ? (
                      <small className="official-label-subtext">{field.labelSubtext}</small>
                    ) : null}
                  </label>
                  <div className="official-input-wrap">
                    {renderField(field, formData[field.name], handleChange, formData)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="official-submit-row application-actions">
          <button type="submit" className="btn official-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </button>
        </div>

        <div className={`application-status ${status.type}`} role="status" aria-live="polite">
          {status.message}
        </div>
      </form>
    </div>
  );
};