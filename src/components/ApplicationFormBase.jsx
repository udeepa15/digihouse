import React, { useMemo, useState } from "react";
import emailjs from "emailjs-com";
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

    // Validate NIC (allow only 10 or 12 characters)
    const nicFields = application.fields.filter((f) => f.name === "nic");
    for (const field of nicFields) {
      const value = (formData[field.name] || "").trim();
      if (value && value.length !== 10 && value.length !== 12) {
        setStatus({
          type: "error",
          message: "NIC must be exactly 10 or 12 characters. / ජාතික හැඳුනුම්පත් අංකය අක්ෂර 10ක් හෝ 12ක් විය යුතුය.",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Validate Mobile/Phone (allow only 10 digits)
    const phoneFields = application.fields.filter(
      (f) => f.type === "tel" || f.name === "mobileNumber" || f.name === "phone"
    );
    for (const field of phoneFields) {
      const value = (formData[field.name] || "").trim();
      if (value && !/^\d{10}$/.test(value)) {
        const labelSinhala = field.name === "mobileNumber" ? "ජංගම දුරකථන අංකය" : "දුරකථන අංකය";
        setStatus({
          type: "error",
          message: `${field.label} must be exactly 10 digits (numbers only). / ${labelSinhala} ඉලක්කම් 10ක් විය යුතුය.`,
        });
        setIsSubmitting(false);
        return;
      }
    }

    const appNumber = `DH-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const formDataToSend = new FormData(event.currentTarget);
      formDataToSend.append("applicationType", application.key);
      formDataToSend.append("applicationTitle", application.title);
      formDataToSend.append("submittedAt", new Date().toISOString());
      formDataToSend.append("applicationNumber", appNumber);

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
        message: `Application submitted successfully! Your unique Application Number is ${appNumber}. Details have been saved.`,
      });

      // Send confirmation email via EmailJS if configured
      const emailjsServiceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const emailjsTemplateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const emailjsPublicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
        const applicantEmail = formData.email || "";
        const applicantName = formData.nameWithInitials || formData.fullName || "";

        if (applicantEmail) {
          const templateParams = {
            to_name: applicantName,
            to_email: applicantEmail,
            application_number: appNumber,
            application_title: application.title,
            submitted_at: new Date().toLocaleString(),
          };

          emailjs
            .send(emailjsServiceId, emailjsTemplateId, templateParams, emailjsPublicKey)
            .then((response) => {
              console.log("Email sent successfully via EmailJS!", response.status, response.text);
            })
            .catch((error) => {
              console.error("Failed to send email via EmailJS:", error);
            });
        }
      } else {
        console.warn("EmailJS configuration missing in environment variables. Confirmation email skipped.");
      }

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