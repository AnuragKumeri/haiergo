const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = 3000;
const REQUESTS_FILE = path.join(__dirname, 'data/requests.json');
const PAST_REQUESTS_FILE = path.join(__dirname, 'data/past-requests.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'giene1810@gmail.com', //email_id
    pass: process.env.EMAIL_PASS || 'fvgi ztte sqls qaop'  //app_password
  }
});

app.post("/api/send-request", (req, res) => {
  const { from, to, date, passengers, email, passengerDetails } = req.body;

  const newRequest = {
    from,
    to,
    date,
    passengers,
    email,
    passengerDetails,
    status: "pending",
    timestamp: new Date().toISOString()
  };

  let requests = [];

  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading requests file:", err);
    return res.status(500).json({ success: false, message: "Server error while reading requests." });
  }

  requests.push(newRequest);

  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
  } catch (err) {
    console.error("Error writing to requests file:", err);
    return res.status(500).json({ success: false, message: "Server error while saving request." });
  }

  const passengerList = Array.isArray(passengerDetails)
    ? passengerDetails.map((p, i) => `  ${i + 1}. ${p.name}, Age: ${p.age}`).join("\n")
    : "  (No passenger details)";

  const mailOptions = {
    from: '"HaierGo Booking" <' + (process.env.EMAIL_USER || 'giene1810@gmail.com') + '>',
    to: 'kumeri23anurag@yahoo.com', //admin_email_id
    subject: 'New Flight Booking Request',
    text: `
New booking request:
From: ${from}
To: ${to}
Date: ${date}
Passengers: ${passengers}
Details:
${passengerList}
User Email: ${email}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email sending failed:", error);
      return res.status(500).json({ success: false, message: "Failed to notify admin." });
    } else {
      console.log("Email sent:", info.response);
      return res.status(200).json({ success: true, message: "Request sent successfully." });
    }
  });
});

app.get("/api/requests", (req, res) => {
  try {
    const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"));
    res.json(requests);
  } catch (err) {
    console.error("Error reading request file:", err);
    res.status(500).json({ error: "Failed to load requests." });
  }
});

app.get("/api/past-requests", (req, res) => {
  try {
    if (!fs.existsSync(PAST_REQUESTS_FILE)) return res.json([]);
    const pastRequests = JSON.parse(fs.readFileSync(PAST_REQUESTS_FILE, "utf8"));
    res.json(pastRequests);
  } catch (err) {
    console.error("Error reading past-requests file:", err);
    res.status(500).json({ error: "Failed to load past requests." });
  }
});

app.post("/api/requests/action", (req, res) => {
  const { index, action } = req.body;

  try {
    const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"));
    const request = requests[index];
    if (!request) return res.status(404).json({ message: "Request not found." });

    requests.splice(index, 1);
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));

    const handledRequest = { ...request, status: action, timestamp: new Date().toISOString() };

    let pastRequests = [];
    if (fs.existsSync(PAST_REQUESTS_FILE)) {
      pastRequests = JSON.parse(fs.readFileSync(PAST_REQUESTS_FILE, "utf8"));
    }
    pastRequests.push(handledRequest);
    fs.writeFileSync(PAST_REQUESTS_FILE, JSON.stringify(pastRequests, null, 2));

    const subject = action === "approve" ? "Flight Booking Approved" : "Booking Request Denied";
    const text = action === "approve"
      ? `Hi,\n\nYour flight from ${request.from} to ${request.to} on ${request.date} has been approved.\n\nThank you!`
      : `Hi,\n\nWe regret to inform you that your booking from ${request.from} to ${request.to} was not approved.\n\nRegards,`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'giene1810@gmail.com',
      to: request.email,
      subject,
      text
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({ message: "Action completed, but email failed." });
      }
      return res.json({ message: `Request ${action}d and saved.` });
    });

  } catch (err) {
    console.error("Error handling request action:", err);
    res.status(500).json({ message: "Server error while processing request." });
  }
});

// === Agent: Handle Booking Actions ===
app.post("/api/agent/requests/action", (req, res) => {
  const { index, action } = req.body;
  const AGENT_REQUESTS_FILE = path.join(__dirname, 'data/agent-requests.json');

  try {
    const requests = fs.existsSync(REQUESTS_FILE)
      ? JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"))
      : [];

    const agentRequests = fs.existsSync(AGENT_REQUESTS_FILE)
      ? JSON.parse(fs.readFileSync(AGENT_REQUESTS_FILE, "utf8"))
      : [];

    const request = requests[index];
    if (!request) return res.status(404).json({ message: "Request not found." });

    const agentHandled = {
      ...request,
      status: action === "approve" ? "Booked" : "Not Booked",
      processedAt: new Date().toISOString()
    };

    agentRequests.push(agentHandled);
    fs.writeFileSync(AGENT_REQUESTS_FILE, JSON.stringify(agentRequests, null, 2));

    res.json({ message: `Marked as ${agentHandled.status}` });
  } catch (err) {
    console.error("Agent request processing error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// === Agent: Get Agent Past Requests ===
app.get("/api/agent/past-requests", (req, res) => {
  const AGENT_REQUESTS_FILE = path.join(__dirname, 'data/agent-requests.json');
  try {
    const data = fs.existsSync(AGENT_REQUESTS_FILE)
      ? fs.readFileSync(AGENT_REQUESTS_FILE, "utf8")
      : "[]";

    const agentPast = JSON.parse(data);
    res.json(agentPast);
  } catch (err) {
    console.error("Agent past request load error:", err);
    res.status(500).json({ message: "Failed to load agent past requests." });
  }
});

app.get("/api/approved-requests", (req, res) => {
  try {
    const requests = fs.existsSync(REQUESTS_FILE)
      ? JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf8"))
      : [];

    // Filter only "Approved" status
    const approved = requests.filter(req => req.status === "Approved");

    res.json(approved);
  } catch (err) {
    console.error("Error reading approved requests:", err);
    res.status(500).json({ message: "Server error fetching approved requests." });
  }
});


app.use((req, res) => {
  res.status(404).send("Page not found");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
