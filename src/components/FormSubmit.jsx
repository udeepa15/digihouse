import React, { useState } from 'react';
import './FormSubmit.css';

export const FormSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const formData = new FormData(event.currentTarget);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Something went wrong during submission.');
      }

      setStatus({
        type: 'success',
        message: 'Form submitted successfully! Data saved to Google Sheets and image stored on Vercel Blob.',
      });
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setStatus({
        type: 'error',
        message: error.message || 'Submission failed. Please check your connection and configuration.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-submit-container">
      <div className="form-submit-card">
        <h2>Submit Application Details</h2>
        <form onSubmit={handleSubmit} className="form-submit-element">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image Upload</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Uploading & Saving...' : 'Submit Form'}
          </button>
        </form>

        {status.message && (
          <div className={`status-alert ${status.type}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSubmit;
