import React from "react";
import { ApplicationFormBase } from "./ApplicationFormBase";
import { applicationTypes } from "./applicationTypes";

export const DoctorApplicationForm = () => {
  return <ApplicationFormBase application={applicationTypes.doctor} />;
};