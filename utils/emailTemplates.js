const getAppointmentEmail = (name, status, date, time) => {
  let statusColor = "#007bff"; // Blue for Pending
  let statusMessage = "We have received your appointment request.";
  let title = "Appointment Request Received";

  if (status === "Accepted") {
    statusColor = "#28a745"; // Green
    statusMessage = `
            Your appointment has been <b>ACCEPTED</b>.<br/><br/>
            <b>Please visit the clinic 5 minutes prior to your booking.</b><br/>
            📍 <a href="https://maps.app.goo.gl/LyYPptC8QEPoEngr7" style="color: #007bff; text-decoration: none;">Click here for Clinic Location</a>
        `;
    title = "Appointment Confirmed";
  } else if (status === "Declined") {
    statusColor = "#dc3545"; // Red
    statusMessage = `
            Your appointment request has been <b>DECLINED</b>.<br/><br/>
            If you have questions, please contact us directly:<br/>
            📧 <a href="mailto:mdclinicjalandhar@gmail.com" style="color:#007bff;">mdclinicjalandhar@gmail.com</a><br/>
            📞 <a href="tel:9877214745" style="color:#007bff;">9877214745</a>
        `;
    title = "Appointment Update";
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .container {
          font-family: 'Arial', sans-serif;
          max-width: 600px;
          margin: 0 auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #007bff;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .details-table td {
          padding: 10px;
          border-bottom: 1px solid #eeeeee;
        }
        .details-table td:first-child {
          font-weight: bold;
          color: #555;
          width: 40%;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          color: white;
          background-color: ${statusColor};
          font-weight: bold;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Modern Dental Clinic</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>Hello <b>${name}</b>,</p>
          <p>${statusMessage}</p>
          
          <table class="details-table">
            <tr>
              <td>Status</td>
              <td><span class="status-badge">${status}</span></td>
            </tr>
            <tr>
              <td>Date</td>
              <td>${date}</td>
            </tr>
            <tr>
              <td>Time</td>
              <td>${time}</td>
            </tr>
          </table>

          <p>If you have any questions, please contact us.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Developed By Webaura. All rights reserved.</p>
          <p>Phagwara, Punjab</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getAppointmentEmail };
