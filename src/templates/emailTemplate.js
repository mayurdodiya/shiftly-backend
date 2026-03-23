const fs = require('fs');
const path = require('path');


const sendResetPwdLink = (resetLink) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin:0; padding:0; background:#f9f9f9;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:15px;">
      <tr>
        <td align="center">

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="max-width:600px; background:#f9f9f9; border-radius:10px; border:1px solid #e0e0e0; padding:20px; font-family: Arial, sans-serif; color:#333;">
            
            <tr>
              <td>
                <h2 style="text-align:center; color:#444; margin-top:0;">Reset Your Password</h2>

                <p>Hello,</p>

                <p>
                  We received a request to reset the password for your account associated with this email address.
                </p>

                <p>
                  If you made this request, please click the button below to reset your password:
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
                  <tr>
                    <td align="center">
                      <a href="${resetLink}"
                        style="display:inline-block; background-color:#007BFF; color:#ffffff; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>

                <p>This link will expire in 15 minutes for security reasons.</p>

                <p>
                  If you did not request a password reset, please ignore this email. Your password will remain unchanged.
                </p>

                <br>

                <p>
                  Thank you,<br>
                  <strong>Algomatic Team</strong>
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
  return html;
};

const paymentSuccessFullForClinic = (jobTitle, name, paymentId, transactionId, amount) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin:0; padding:0; background-color:#f0faf4;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:15px;">
      <tr>
        <td align="center">

          <!-- Container -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.1); font-family:'Segoe UI', Roboto, sans-serif;">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#2ecc71,#27ae60); padding:28px 20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:800; letter-spacing:2px;">SHIFTLY</h1>
                <p style="color:#d5f5e3; margin:5px 0 0; font-size:13px;">Hospital shift Management Platform</p>
              </td>
            </tr>

            <!-- Success Banner -->
            <tr>
              <td style="background-color:#eafaf1; padding:14px 20px; text-align:center; border-bottom:2px solid #a9dfbf;">
                <p style="margin:0; color:#1e8449; font-size:17px; font-weight:bold;">
                  ✅ Payment Successful!
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:25px 20px;">
                <p style="font-size:17px; color:#2c3e50;">Hi <strong>${name}</strong>,</p>

                <p style="font-size:14px; color:#666; line-height:1.7;">
                  We've successfully received your payment. Please find your transaction details below. 
                  Keep this for your records.
                </p>

                <!-- Transaction Details -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                  style="margin-top:24px; border-collapse:collapse; font-size:14px;">

                  <tr style="background:linear-gradient(135deg,#2ecc71,#27ae60);">
                    <td colspan="2" style="padding:12px 16px; color:#fff; font-weight:bold; font-size:15px;">
                      🧾 Transaction Summary
                    </td>
                  </tr>

                  <!-- Jobpost -->
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:12px 10px; font-weight:600; color:#555; width:40%;">
                      🏢 Job Role
                    </td>
                    <td style="padding:12px 10px; color:#2ecc71; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-word;">
                      ${jobTitle}
                    </td>
                  </tr>

                  <!-- Payment ID -->
                  <tr style="border-bottom:1px solid #eee;">
                    <td style="padding:12px 10px; font-weight:600; color:#555;">
                      💳 Payment ID
                    </td>
                    <td style="padding:12px 10px; color:#2ecc71; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
                      ${paymentId}
                    </td>
                  </tr>

                  <!-- Transaction ID -->
                  <tr style="background-color:#f9fffe; border-bottom:1px solid #eee;">
                    <td style="padding:12px 10px; font-weight:600; color:#555;">
                      🔁 Transaction ID
                    </td>
                    <td style="padding:12px 10px; color:#27ae60; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
                      ${transactionId}
                    </td>
                  </tr>

                  <!-- Amount -->
                  <tr style="background-color:#eafaf1;">
                    <td style="padding:12px 10px; font-weight:600; color:#555;">
                      💰 Amount Paid
                    </td>
                    <td style="padding:12px 10px; color:#1e8449; font-weight:800; font-size:20px;">
                      ₹${amount}
                    </td>
                  </tr>

                </table>

                <!-- Note -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                  <tr>
                    <td style="background-color:#f4fdf7; border-left:4px solid #2ecc71; padding:12px 16px; border-radius:4px;">
                      <p style="margin:0; font-size:13px; color:#555; line-height:1.6;">
                        📌 Please save your <strong>Payment ID</strong> and <strong>Transaction ID</strong> for future reference or disputes.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Support -->
                <p style="font-size:13px; color:#999; margin-top:24px; line-height:1.7;">
                  Need help? Reach out to us at 
                  <a href="mailto:amithshiftly@gmail.com" style="color:#27ae60; font-weight:600; text-decoration:none;">
                    amithshiftly@gmail.com
                  </a>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:linear-gradient(135deg,#2ecc71,#27ae60); padding:16px 20px; text-align:center;">
                <p style="margin:0; color:#fff; font-size:13px; font-weight:bold; letter-spacing:1px;">
                  SHIFTLY TECHNOLOGICAL PRIVATE LIMITED
                </p>
                <p style="margin:4px 0 0; color:#d5f5e3; font-size:11px;">
                  © ${new Date().getFullYear()} Shiftly. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

const paymentSuccessFullForEmployee = (
  name,
  paymentId,
  transactionId,
  amount,
  clinicName,
  clinicAddress,
  jobTitle,
  shiftDate,
  jobEndDate,
  totalDays
) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0; padding:0; background-color:#f0faf4;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:15px;">
<tr>
<td align="center">

<!-- Container -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.1); font-family:'Segoe UI', Roboto, sans-serif;">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#2ecc71,#27ae60); padding:28px 20px; text-align:center;">
<h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:800; letter-spacing:2px;">SHIFTLY</h1>
<p style="color:#d5f5e3; margin:5px 0 0; font-size:13px;">Hospital Shift Management Platform</p>
</td>
</tr>

<!-- Success Banner -->
<tr>
<td style="background-color:#eafaf1; padding:14px 20px; text-align:center; border-bottom:2px solid #a9dfbf;">
<p style="margin:0; color:#1e8449; font-size:17px; font-weight:bold;">
💸 Shift Payment Completed!
</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:25px 20px;">

<p style="font-size:17px; color:#2c3e50;">Hi <strong>${name}</strong>,</p>

<p style="font-size:14px; color:#666; line-height:1.7;">
Great news! Your payment for the completed shift has been successfully processed by <strong>Shiftly</strong>.
The amount has been transferred to your registered bank account.
</p>

<!-- Clinic Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:24px; border-collapse:collapse; font-size:14px;">
<tr style="background:linear-gradient(135deg,#3498db,#2980b9);">
<td colspan="2" style="padding:12px 16px; color:#fff; font-weight:bold; font-size:15px;">
🏥 Clinic Details
</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555; width:40%;">Clinic Name</td>
<td style="padding:12px 10px; color:#2c3e50; word-break:break-word;">${clinicName}</td>
</tr>

<tr style="background-color:#f8fbff;">
<td style="padding:12px 10px; font-weight:600; color:#555;">Clinic Address</td>
<td style="padding:12px 10px; color:#2c3e50; word-break:break-word;">${clinicAddress}</td>
</tr>
</table>

<!-- Shift Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:20px; border-collapse:collapse; font-size:14px;">
<tr style="background:linear-gradient(135deg,#8e44ad,#6c3483);">
<td colspan="2" style="padding:12px 16px; color:#fff; font-weight:bold; font-size:15px;">
🩺 Shift Details
</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555; width:40%;">Job Role</td>
<td style="padding:12px 10px; color:#2c3e50; word-break:break-word;">${jobTitle}</td>
</tr>

<tr style="background-color:#faf7ff; border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555;">Shift Start Date</td>
<td style="padding:12px 10px; color:#2c3e50;">${shiftDate}</td>
</tr>

<tr style="background-color:#faf7ff; border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555;">Shift End Date</td>
<td style="padding:12px 10px; color:#2c3e50;">${jobEndDate}</td>
</tr>

<tr style="background-color:#f3ecff;">
<td style="padding:12px 10px; font-weight:600; color:#555;">Shift Total Days</td>
<td style="padding:12px 10px; color:#2c3e50;">${totalDays}</td>
</tr>
</table>

<!-- Payment Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:24px; border-collapse:collapse; font-size:14px;">

<tr style="background:linear-gradient(135deg,#2ecc71,#27ae60);">
<td colspan="2" style="padding:12px 16px; color:#fff; font-weight:bold; font-size:15px;">
🧾 Payment Details
</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555; width:40%;">📄 Payment Record ID</td>
<td style="padding:12px 10px; color:#2ecc71; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
${paymentId}
</td>
</tr>

<tr style="background-color:#f9fffe; border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555;">🔁 Transaction ID</td>
<td style="padding:12px 10px; color:#27ae60; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
${transactionId}
</td>
</tr>

<tr style="background-color:#eafaf1;">
<td style="padding:12px 10px; font-weight:600; color:#555;">💰 Amount Received</td>
<td style="padding:12px 10px; color:#1e8449; font-weight:800; font-size:20px;">
₹${amount}
</td>
</tr>

</table>

<!-- Note -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
<tr>
<td style="background-color:#f4fdf7; border-left:4px solid #2ecc71; padding:12px 16px; border-radius:4px;">
<p style="margin:0; font-size:13px; color:#555; line-height:1.6;">
📌 The payment has been transferred to your registered bank account. Please keep the transaction details for future reference.
</p>
</td>
</tr>
</table>

<!-- Support -->
<p style="font-size:13px; color:#999; margin-top:24px; line-height:1.7;">
If you have any questions regarding this payment, please contact us at
<a href="mailto:amithshiftly@gmail.com" style="color:#27ae60; font-weight:600; text-decoration:none;">
amithshiftly@gmail.com
</a>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:linear-gradient(135deg,#2ecc71,#27ae60); padding:16px 20px; text-align:center;">
<p style="margin:0; color:#fff; font-size:13px; font-weight:bold; letter-spacing:1px;">
SHIFTLY TECHNOLOGICAL PRIVATE LIMITED
</p>
<p style="margin:4px 0 0; color:#d5f5e3; font-size:11px;">
© ${new Date().getFullYear()} Shiftly. All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

const paymentNotificationForAdmin = (
  employeeName,
  paymentId,
  transactionId,
  amount,
  clinicName,
  clinicAddress,
  jobTitle,
  shiftStartDate,
  shiftEndDate,
  totalDays
) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0; padding:0; background:#f4f6f9;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:20px;">
<tr>
<td align="center">

<!-- Container -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:650px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08); font-family:'Segoe UI', Roboto, Arial;">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#2c3e50,#34495e); padding:24px; text-align:center;">
<h1 style="margin:0;color:white;letter-spacing:2px;font-size:26px;">SHIFTLY</h1>
<p style="margin:6px 0 0;color:#d0d6dc;font-size:13px;">Admin Payment Notification</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:24px;">

<p style="font-size:16px;color:#2c3e50;margin-top:0;">
A payout has been successfully processed for an employee.
</p>

<!-- Employee Section -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="border-collapse:collapse;margin-top:20px;font-size:14px;">

<tr style="background:#ecf0f1;">
<td colspan="2" style="padding:12px 16px;font-weight:700;color:#2c3e50;">
👤 Employee Details
</td>
</tr>

<tr>
<td style="padding:12px 10px;border-bottom:1px solid #eee;width:40%;font-weight:600;color:#555;">
Employee Name
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee;color:#2c3e50; word-break:break-word;">
${employeeName}
</td>
</tr>

</table>

<!-- Clinic Section -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="border-collapse:collapse;margin-top:20px;font-size:14px;">

<tr style="background:#ecf4ff;">
<td colspan="2" style="padding:12px 16px;font-weight:700;color:#2c3e50;">
🏥 Clinic Details
</td>
</tr>

<tr>
<td style="padding:12px 10px;border-bottom:1px solid #eee;width:40%;font-weight:600;color:#555;">
Clinic Name
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee;color:#2c3e50; word-break:break-word;">
${clinicName}
</td>
</tr>

<tr style="background:#f8fbff;">
<td style="padding:12px 10px;font-weight:600;color:#555;">
Address
</td>
<td style="padding:12px 10px;color:#2c3e50; word-break:break-word;">
${clinicAddress}
</td>
</tr>

</table>

<!-- Job Section -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="border-collapse:collapse;margin-top:20px;font-size:14px;">

<tr style="background:#f6ecff;">
<td colspan="2" style="padding:12px 16px;font-weight:700;color:#2c3e50;">
🩺 Job / Shift Details
</td>
</tr>

<tr>
<td style="padding:12px 10px;border-bottom:1px solid #eee;width:40%;font-weight:600;color:#555;">
Job Role
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee; word-break:break-word;">
${jobTitle}
</td>
</tr>

<tr style="background:#fbf8ff;">
<td style="padding:12px 10px;border-bottom:1px solid #eee;font-weight:600;">
Shift Start
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee;">
${shiftStartDate}
</td>
</tr>

<tr>
<td style="padding:12px 10px;border-bottom:1px solid #eee;font-weight:600;">
Shift End
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee;">
${shiftEndDate}
</td>
</tr>

<tr style="background:#fbf8ff;">
<td style="padding:12px 10px;font-weight:600;">
Total Days
</td>
<td style="padding:12px 10px;">
${totalDays}
</td>
</tr>

</table>

<!-- Payment Section -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="border-collapse:collapse;margin-top:24px;font-size:14px;">

<tr style="background:linear-gradient(135deg,#27ae60,#2ecc71);color:white;">
<td colspan="2" style="padding:12px 16px;font-weight:700;">
💰 Payment Details
</td>
</tr>

<tr>
<td style="padding:12px 10px;border-bottom:1px solid #eee;width:40%;font-weight:600;">
Payment ID
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee;font-family:monospace; word-break:break-all;">
${paymentId}
</td>
</tr>

<tr style="background:#f9fffb;">
<td style="padding:12px 10px;border-bottom:1px solid #eee;font-weight:600;">
Transaction ID
</td>
<td style="padding:12px 10px;border-bottom:1px solid #eee;font-family:monospace; word-break:break-all;">
${transactionId}
</td>
</tr>

<tr>
<td style="padding:12px 10px;font-weight:700;color:#2c3e50;">
Amount Paid
</td>
<td style="padding:12px 10px;font-size:20px;font-weight:800;color:#27ae60;">
₹${amount}
</td>
</tr>

</table>

<!-- Footer note -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
<tr>
<td style="background:#f8f9fb;border-left:4px solid #2ecc71;padding:12px 16px;font-size:13px;color:#555;border-radius:4px;">
This is an automated notification generated by the Shiftly payment system.
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#2c3e50;padding:16px;text-align:center;">
<p style="margin:0;color:white;font-size:13px;font-weight:bold;">
SHIFTLY TECHNOLOGICAL PRIVATE LIMITED
</p>
<p style="margin-top:4px;color:#bdc3c7;font-size:11px;">
© ${new Date().getFullYear()} Shiftly. Internal System Notification
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

const paymentRejectedForEmployee = (jobPostTitle, name, paymentId, transactionId, amount) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0; padding:0; background-color:#fff7f7;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:15px;">
<tr>
<td align="center">

<!-- Container -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.1); font-family:'Segoe UI', Roboto, sans-serif;">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#e74c3c,#c0392b); padding:28px 20px; text-align:center;">
<h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:800; letter-spacing:2px;">SHIFTLY</h1>
<p style="color:#fadbd8; margin:5px 0 0; font-size:13px;">Hospital Shift Management Platform</p>
</td>
</tr>

<!-- Alert Banner -->
<tr>
<td style="background-color:#fdecea; padding:14px 20px; text-align:center; border-bottom:2px solid #f5b7b1;">
<p style="margin:0; color:#c0392b; font-size:17px; font-weight:bold;">
⚠️ Payment Processing Issue
</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:25px 20px;">

<p style="font-size:17px; color:#2c3e50;">Hi <strong>${name}</strong>,</p>

<p style="font-size:14px; color:#666; line-height:1.7;">
We attempted to process your payment for the completed shift, but unfortunately the transaction was <strong>rejected by the bank</strong>.
</p>

<p style="font-size:14px; color:#666; line-height:1.7;">
Don't worry — our system will automatically retry the payout and your payment will be processed by <strong>the next business day</strong>.
</br>
</br>

Please make sure that your <strong>bank account number</strong>, <strong>IFSC code</strong>, and <strong>account holder name</strong> are correct in your Shiftly profile. Incorrect bank details may cause payment failures.
</p>

<!-- Transaction Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:24px; border-collapse:collapse; font-size:14px;">

<tr style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
<td colspan="2" style="padding:12px 16px; color:#fff; font-weight:bold; font-size:15px;">
🧾 Payment Attempt Details
</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555; width:40%;">
🏢 Job Role
</td>
<td style="padding:12px 10px; color:#c0392b; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
${jobPostTitle}
</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555; width:40%;">
📄 Payment Record ID
</td>
<td style="padding:12px 10px; color:#c0392b; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
${paymentId}
</td>
</tr>

<tr style="background-color:#fff5f5; border-bottom:1px solid #eee;">
<td style="padding:12px 10px; font-weight:600; color:#555;">
🔁 Transaction ID
</td>
<td style="padding:12px 10px; color:#c0392b; font-weight:bold; font-family:monospace; font-size:13px; word-break:break-all;">
${transactionId}
</td>
</tr>

<tr style="background-color:#fdecea;">
<td style="padding:12px 10px; font-weight:600; color:#555;">
💰 Amount
</td>
<td style="padding:12px 10px; color:#c0392b; font-weight:800; font-size:20px;">
₹${amount}
</td>
</tr>

</table>

<!-- Info box -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
<tr>
<td style="background-color:#fff4f4; border-left:4px solid #e74c3c; padding:12px 16px; border-radius:4px;">
<p style="margin:0; font-size:13px; color:#555; line-height:1.6;">
📌 If the payment is not received within the next day, please contact the Shiftly support team for assistance.
</p>
</td>
</tr>
</table>

<!-- Support -->
<p style="font-size:13px; color:#999; margin-top:24px; line-height:1.7;">
Need help? Please contact our admin team at
<a href="mailto:amithshiftly@gmail.com" style="color:#c0392b; font-weight:600; text-decoration:none;">
amithshiftly@gmail.com
</a>
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:linear-gradient(135deg,#e74c3c,#c0392b); padding:16px 20px; text-align:center;">
<p style="margin:0; color:#fff; font-size:13px; font-weight:bold; letter-spacing:1px;">
SHIFTLY TECHNOLOGICAL PRIVATE LIMITED
</p>
<p style="margin:4px 0 0; color:#fadbd8; font-size:11px;">
© ${new Date().getFullYear()} Shiftly. All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

const payoutRejectedAdminAlert = (
  adminName,
  jobId,
  jobTitle,
  employeeName,
  employeeEmail,
  employeePhone,
  bankName,
  branchName,
  accountNumber,
  ifscCode,
  paymentId,
  transactionId,
  amount,
  clinicName,
  clinicEmail,
  clinicPhone,
) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="margin:0; padding:0; background-color:#fff7f7;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:15px;">
<tr>
<td align="center">

<!-- Container -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="max-width:650px; margin:auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.1); font-family:'Segoe UI', Roboto, sans-serif;">

<!-- Header -->
<tr>
<td style="background:linear-gradient(135deg,#e74c3c,#c0392b); padding:28px 20px; text-align:center;">
<h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:800; letter-spacing:2px;">SHIFTLY ADMIN ALERT</h1>
<p style="color:#fadbd8; margin:5px 0 0; font-size:13px;">Hospital Shift Management Platform</p>
</td>
</tr>

<!-- Alert Banner -->
<tr>
<td style="background-color:#fdecea; padding:14px 20px; text-align:center; border-bottom:2px solid #f5b7b1;">
<p style="margin:0; color:#c0392b; font-size:18px; font-weight:bold;">
⚠️ Employee Payout Rejected
</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:25px 20px;">

<p style="font-size:16px; color:#2c3e50;">
Hello <strong>${adminName}</strong>,
</p>
<p style="font-size:14px; color:#666; line-height:1.7;">
A payout attempt for an employee shift has been <strong>rejected by the bank</strong>.
Please review the details below and check your RazorpayX account balance.
</p>

<!-- Job Info -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:20px; border-collapse:collapse; font-size:14px;">
<tr style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
<td colspan="2" style="padding:10px 14px; font-weight:bold; color:#fff;">🧾 Job Information</td>
</tr>
<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555; width:40%;">Job ID</td>
<td style="padding:10px 10px; font-family:monospace; color:#c0392b; word-break:break-all;">${jobId}</td>
</tr>
<tr style="background:#fff7f7; border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Job Title</td>
<td style="padding:10px 10px; font-weight:bold; color:#2c3e50; word-break:break-word;">${jobTitle}</td>
</tr>
</table>

<!-- Clinic Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:20px; border-collapse:collapse; font-size:14px;">
<tr style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
<td colspan="2" style="padding:10px 14px; font-weight:bold; color:#fff;">🏥 Clinic Details</td>
</tr>
<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555; width:40%;">Clinic Name</td>
<td style="padding:10px 10px; word-break:break-word;">${clinicName}</td>
</tr>
<tr style="background:#fff7f7; border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Email</td>
<td style="padding:10px 10px; word-break:break-all;">${clinicEmail}</td>
</tr>
<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Phone</td>
<td style="padding:10px 10px;">${clinicPhone}</td>
</tr>
</table>

<!-- Employee Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:20px; border-collapse:collapse; font-size:14px;">
<tr style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
<td colspan="2" style="padding:10px 14px; font-weight:bold; color:#fff;">👤 Employee Details</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555; width:40%;">Name</td>
<td style="padding:10px 10px;">${employeeName}</td>
</tr>

<tr style="background:#fff7f7; border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Email</td>
<td style="padding:10px 10px; word-break:break-all;">${employeeEmail}</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Phone</td>
<td style="padding:10px 10px;">${employeePhone}</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Bank Name</td>
<td style="padding:10px 10px; word-break:break-word;">${bankName}</td>
</tr>

<tr style="background:#fff7f7; border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Branch</td>
<td style="padding:10px 10px; word-break:break-word;">${branchName}</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Account Number</td>
<td style="padding:10px 10px; font-family:monospace; word-break:break-all;">${accountNumber}</td>
</tr>

<tr style="background:#fff7f7;">
<td style="padding:10px 10px; font-weight:600; color:#555;">IFSC Code</td>
<td style="padding:10px 10px; font-family:monospace; word-break:break-all;">${ifscCode}</td>
</tr>

</table>

<!-- Payment Details -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
style="margin-top:20px; border-collapse:collapse; font-size:14px;">
<tr style="background:linear-gradient(135deg,#e74c3c,#c0392b);">
<td colspan="2" style="padding:10px 14px; font-weight:bold; color:#fff;">💳 Payment Details</td>
</tr>

<tr style="border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555; width:40%;">Payment Record ID</td>
<td style="padding:10px 10px; font-family:monospace; color:#c0392b; word-break:break-all;">${paymentId}</td>
</tr>

<tr style="background:#fff7f7; border-bottom:1px solid #eee;">
<td style="padding:10px 10px; font-weight:600; color:#555;">Transaction ID</td>
<td style="padding:10px 10px; font-family:monospace; color:#c0392b; word-break:break-all;">${transactionId}</td>
</tr>

<tr>
<td style="padding:10px 10px; font-weight:600; color:#555;">Amount</td>
<td style="padding:10px 10px; font-weight:800; font-size:18px; color:#c0392b;">₹${amount}</td>
</tr>

</table>

<!-- Warning Note -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:25px;">
<tr>
<td style="background:#fff4f4; padding:14px 16px; border-left:4px solid #e74c3c; border-radius:4px;">
<p style="margin:0; font-size:13px; color:#555; line-height:1.6;">
📌 Please verify the employee's bank details and ensure sufficient balance in the RazorpayX account. 
The Shiftly banking payout system will automatically process this payment the next business day.
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#2c3e50; padding:14px 20px; text-align:center;">
<p style="color:#ecf0f1; font-size:12px; margin:0;">
© ${new Date().getFullYear()} Shiftly Technological Private Limited
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};

const sendOTP = (to, otp) => {
  const html = `
    <div style="background-color: #f4f4f4; padding: 40px 0; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; background-color: #ffffff; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border: 1px solid #e0e0e0;">
        
        <h2 style="text-align: center; color: #333333; margin-bottom: 20px;">Verify Your Email</h2>
        
        <p style="font-size: 16px; color: #555555;">Hi there,</p>
        
        <p style="font-size: 16px; color: #555555;">
          Please use the following One-Time Password (OTP) to complete your verification. This OTP is valid for the next <strong>60 seconds</strong>:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background-color: #f0f4ff; padding: 15px 30px; border-radius: 6px; font-size: 28px; letter-spacing: 6px; color: #0037ff; font-weight: bold;">
            ${otp}
          </div>
        </div>
  
        <p style="font-size: 16px; color: #555555;">
          If you did not request this, you can safely ignore this email.
        </p>
        
        <p style="font-size: 16px; color: #555555;">Thanks,<br><strong>Algomatic Team</strong></p>
      </div>
    </div>
    `;
  return html;
};


module.exports = {
  // sendOTP,
  sendResetPwdLink,
  paymentSuccessFullForClinic,
  paymentSuccessFullForEmployee,
  paymentRejectedForEmployee,
  payoutRejectedAdminAlert,
  paymentNotificationForAdmin
};
