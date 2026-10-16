import baseTemplate from "./baseTemplate.js";

const approvalEmail = (applicant, username, password) =>
  baseTemplate(`
    <h2 style="color:#1e3a8a">Admission Approved</h2>

    <p>Dear ${applicant.first_name},</p>

    <p>Your application has been <strong>approved</strong>.</p>

    <p><strong>Login Credentials</strong></p>
    <ul>
      <li>Username: <strong>${username}</strong></li>
      <li>Password: <strong>${password}</strong></li>
    </ul>

    <p>Please change your password after first login.</p>

    <p>Regards,<br/>ACRS Admissions Office</p>
  `);

export default approvalEmail;


