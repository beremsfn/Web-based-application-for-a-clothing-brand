import baseTemplate from "./baseTemplate.js";

const rejectionEmail = (applicant, reason) =>
  baseTemplate(`
    <h2 style="color:#991b1b">Admission Result</h2>

    <p>Dear ${applicant.first_name},</p>

    <p>Your application has been <strong>rejected</strong>.</p>

    <p><strong>Reason:</strong></p>
    <p>${reason}</p>

    <p>You may apply again in future cycles.</p>

    <p>Regards,<br/>ACRS Admissions Office</p>
  `);

export default rejectionEmail;


