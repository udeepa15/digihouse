import React from "react";
import { ApplicationFormBase } from "./ApplicationFormBase";
import { applicationTypes } from "./applicationTypes";

export const OfficeApplicationForm = () => {
  return <ApplicationFormBase application={applicationTypes.office} />;
};