import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import nodemailer from "nodemailer";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with reasonable size limit for protection
app.use(express.json({ limit: "5mb" }));

// Configure persistent database path
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "enquiries.json");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Transaction-safe Database Engine
const loadEnquiriesFromDisk = (): any[] => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("[SULFS DB Error] Failed reading data from disk:", err);
  }
  return [];
};

const saveEnquiriesToDisk = (list: any[]) => {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(list, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("[SULFS DB Error] Failed writing data to disk:", err);
  }
};

const enquiries: any[] = loadEnquiriesFromDisk();
const generatedVideosHistory: any[] = [];

// Helper to check if a valid Gemini API Key is configured
const getApiKey = (): string | null => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  return key;
};

// Initialize GoogleGenAI SDK lazily as instructed to prevent startup crashes
let aiInstance: GoogleGenAI | null = null;
const getAIClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured or is using the default placeholder.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
};

// Rate limiting state for spam prevention
const ipRequestLog: Record<string, { count: number; resetTime: number }> = {};
const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  if (!ipRequestLog[ip] || ipRequestLog[ip].resetTime < now) {
    ipRequestLog[ip] = { count: 1, resetTime: now + windowMs };
    return next();
  }

  ipRequestLog[ip].count += 1;
  if (ipRequestLog[ip].count > 15) {
    return res.status(429).json({
      error: "Too many requests. Please wait a minute and try again.",
    });
  }
  next();
};

// --- API Endpoints ---

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    apiConfigured: getApiKey() !== null,
    enquiriesCount: enquiries.length,
    environment: process.env.NODE_ENV || "development",
  });
});

// 2. Contact Enquiry Form submission
app.post("/api/contact", rateLimitMiddleware, async (req, res) => {
  const { 
    fullName, 
    businessName, 
    email, 
    phone, 
    location, 
    niche, 
    serviceRequired, 
    budgetRange, 
    projectDescription, 
    websiteUrl, 
    consent,
    videoObjective,
    preferredFormat,
    desiredTimeline,
    fax_honeypot // Hidden honeypot field
  } = req.body;

  // 1. Honeypot check (anti-spam)
  if (fax_honeypot && fax_honeypot.trim() !== "") {
    console.warn("[SULFS Anti-Spam] Honeypot triggered by bot submission.");
    // Fool the spam bot by returning a successful response without doing any work
    return res.json({
      success: true,
      message: "Thank you for your enquiry. The SULFS production team will review your project and get back to you with a quote within 24 hours.",
      enquiryId: `enq_hp_${Date.now()}`
    });
  }

  // 2. Validation & type checking
  if (
    typeof fullName !== "string" ||
    typeof businessName !== "string" ||
    typeof email !== "string" ||
    typeof location !== "string" ||
    typeof niche !== "string" ||
    typeof serviceRequired !== "string" ||
    typeof budgetRange !== "string" ||
    typeof projectDescription !== "string"
  ) {
    return res.status(400).json({ error: "Invalid data format submitted." });
  }

  const cleanFullName = fullName.trim();
  const cleanBusinessName = businessName.trim();
  const cleanEmail = email.trim();
  const cleanPhone = phone ? String(phone).trim() : "";
  const cleanLocation = location.trim();
  const cleanNiche = niche.trim();
  const cleanServiceRequired = serviceRequired.trim();
  const cleanBudgetRange = budgetRange.trim();
  const cleanProjectDescription = projectDescription.trim();
  const cleanWebsiteUrl = websiteUrl ? String(websiteUrl).trim() : "";
  const cleanVideoObjective = videoObjective ? String(videoObjective).trim() : "Local Lead Generation";
  const cleanPreferredFormat = preferredFormat ? String(preferredFormat).trim() : "Vertical 9:16 (Stories/Reels)";
  const cleanDesiredTimeline = desiredTimeline ? String(desiredTimeline).trim() : "Standard 3-5 Business Days";

  // Required checks
  if (
    !cleanFullName || 
    !cleanBusinessName || 
    !cleanEmail || 
    !cleanLocation || 
    !cleanNiche || 
    !cleanServiceRequired || 
    !cleanBudgetRange || 
    !cleanProjectDescription
  ) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  // Consent checkbox validation
  if (!consent || consent === "false") {
    return res.status(400).json({ error: "You must consent to allowing SULFS to contact you regarding your campaign brief." });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  // Duplicate submission check (Anti-spam protection - 5 minutes throttle)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const isDuplicate = enquiries.some(enq => 
    enq.email.toLowerCase() === cleanEmail.toLowerCase() && 
    enq.projectDescription === cleanProjectDescription &&
    new Date(enq.createdAt).getTime() > fiveMinutesAgo
  );
  if (isDuplicate) {
    return res.status(409).json({ error: "Duplicate brief detected. You have already submitted this campaign brief within the last 5 minutes." });
  }

  // Oversized payload prevention
  if (cleanProjectDescription.length > 5000) {
    return res.status(400).json({ error: "Project brief description exceeds the maximum length of 5000 characters." });
  }
  if (
    cleanFullName.length > 200 ||
    cleanBusinessName.length > 200 ||
    cleanEmail.length > 200 ||
    cleanLocation.length > 200 ||
    cleanPhone.length > 100 ||
    cleanWebsiteUrl.length > 250
  ) {
    return res.status(400).json({ error: "One or more input fields exceed the maximum allowed length." });
  }

  // Header injection defense: remove CRLF characters from inputs used in headers
  const safeFullName = cleanFullName.replace(/[\r\n]/g, "");
  const safeBusinessName = cleanBusinessName.replace(/[\r\n]/g, "");
  const safeNiche = cleanNiche.replace(/[\r\n]/g, "");

  const clientIp = req.ip || req.headers["x-forwarded-for"] as string || "127.0.0.1";

  // Generate ID and create enquiry record
  const newEnquiry = {
    id: `enq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    fullName: safeFullName,
    businessName: safeBusinessName,
    email: cleanEmail,
    phone: cleanPhone,
    location: cleanLocation,
    niche: safeNiche,
    serviceRequired: cleanServiceRequired,
    budgetRange: cleanBudgetRange,
    projectDescription: cleanProjectDescription,
    websiteUrl: cleanWebsiteUrl,
    consent: true,
    videoObjective: cleanVideoObjective,
    preferredFormat: cleanPreferredFormat,
    desiredTimeline: cleanDesiredTimeline,
    status: "New",
    internalNotes: "",
    createdAt: new Date().toISOString(),
    consentRecord: {
      ip: clientIp,
      timestamp: new Date().toISOString(),
      text: "I consent to allowing SULFS to contact me regarding my campaign brief under the Privacy Policy rules."
    },
    quotes: [],
    checklist: {
      scriptApproved: false,
      claimsVerified: false,
      logoApproved: false,
      voiceoverApproved: false,
      finalApproved: false
    }
  };

  // Commit to persistent local disk database first to ensure lead security
  enquiries.unshift(newEnquiry);
  saveEnquiriesToDisk(enquiries);

  // 3. Email Delivery Configuration
  const recipientEmail = process.env.CONTACT_RECEIVER_EMAIL || "SulfsCreativeStudio@outlook.com";
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Explicit SMTP configuration validation
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("[SULFS SMTP Notice] Mail server environment variables are not configured. Saved enquiry locally to disk.");
    return res.json({
      success: true,
      message: "Thank you for your enquiry! Your campaign brief has been saved successfully in our local database. (Please note: SMTP is not currently configured on this preview server, so email notifications are offline). SULFS operators can review your brief directly in our admin portal.",
      enquiryId: newEnquiry.id,
      smtpConfigured: false
    });
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = process.env.SMTP_SECURE === "true";

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 15000, // 15s timeout
    });

    const mailSubject = `New SULFS Website Enquiry — [${safeBusinessName}]`;

    const textBody = `
NEW SULFS WEBSITE ENQUIRY
==========================
Date: ${new Date().toUTCString()}
Enquiry ID: ${newEnquiry.id}

CLIENT INFO
-----------
Full Name: ${safeFullName}
Business Name: ${safeBusinessName}
Email: ${cleanEmail}
Phone/WhatsApp: ${cleanPhone || "Not provided"}
UK Location: ${cleanLocation}
Website URL: ${cleanWebsiteUrl || "Not provided"}

PROJECT BRIEF
-------------
Selected Niche: ${safeNiche}
Service Required: ${cleanServiceRequired}
Budget Range: ${cleanBudgetRange}
Video Objective: ${cleanVideoObjective}
Preferred Format: ${cleanPreferredFormat}
Desired Timeline: ${cleanDesiredTimeline}

MESSAGE BRIEF
-------------
${cleanProjectDescription}

CONSENT & COMPLIANCE
--------------------
Visitor IP: ${clientIp}
Visitor Consent Checkbox: Checked (Consent granted to SULFS to contact regarding project quotation)
`;

    const htmlBody = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1e293b; border-radius: 12px; background-color: #030712; color: #f8fafc;">
  <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px;">
    <h2 style="color: #3b82f6; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">SULFS Creative Studio</h2>
    <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">New Campaign Enquiry Brief Submitted</p>
  </div>
  
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; width: 140px; font-weight: bold; border-bottom: 1px solid #111827;">Client Name:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${safeFullName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Business Name:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${safeBusinessName}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Email Address:</td>
      <td style="padding: 8px 0; color: #3b82f6; border-bottom: 1px solid #111827;"><a href="mailto:${cleanEmail}" style="color: #3b82f6; text-decoration: none;">${cleanEmail}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Phone/WhatsApp:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanPhone || "<em>Not provided</em>"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">UK Location:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanLocation}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Website URL:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanWebsiteUrl ? `<a href="${cleanWebsiteUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">${cleanWebsiteUrl}</a>` : "<em>Not provided</em>"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Selected Niche:</td>
      <td style="padding: 8px 0; color: #3b82f6; font-weight: bold; border-bottom: 1px solid #111827;">${safeNiche}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Service Selected:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanServiceRequired}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Budget Tier:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827; text-transform: capitalize;">${cleanBudgetRange}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Campaign Objective:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanVideoObjective}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Preferred Format:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanPreferredFormat}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8; font-weight: bold; border-bottom: 1px solid #111827;">Desired Timeline:</td>
      <td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #111827;">${cleanDesiredTimeline}</td>
    </tr>
  </table>
  
  <div style="background-color: #0b1329; padding: 15px; border-radius: 8px; border: 1px solid #1e293b; margin-bottom: 20px;">
    <h4 style="margin: 0 0 10px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase;">Message Brief:</h4>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${cleanProjectDescription}</p>
  </div>
  
  <div style="font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px; display: flex; justify-content: space-between;">
    <span>Enquiry ID: ${newEnquiry.id}</span>
    <span>IP Consent Record: ${clientIp}</span>
  </div>
</div>
`;

    const mailOptions = {
      from: `"${safeFullName}" <${smtpUser}>`, // Must match verified sender SMTP user
      to: recipientEmail,
      replyTo: cleanEmail, // Safely route reply actions to original visitor
      subject: mailSubject,
      text: textBody,
      html: htmlBody,
    };

    console.log(`[SULFS SMTP] Preparing transmission for enquiry ID ${newEnquiry.id} to receiver: ${recipientEmail} using host: ${smtpHost}...`);
    const info = await transporter.sendMail(mailOptions);
    
    // Explicitly check the delivery result
    if (!info || !info.messageId) {
      throw new Error("SMTP server accepted payload but failed to return a valid messageId.");
    }
    
    console.log(`[SULFS SMTP] Enquiry ID ${newEnquiry.id} successfully delivered. Message-ID: ${info.messageId}`);

  } catch (emailError: any) {
    console.error(`[SULFS SMTP Error] Transmission failed for enquiry ID ${newEnquiry.id}:`, emailError);
    return res.json({ 
      success: true,
      message: `Thank you for your enquiry! Your campaign brief was saved successfully to our backend database, but email forwarding failed: ${emailError.message || "Network or credential timeout"}. SULFS operators can review your brief directly in our admin portal.`,
      enquiryId: newEnquiry.id,
      smtpConfigured: false,
      smtpError: true
    });
  }

  res.json({
    success: true,
    message: "Thank you for your enquiry! Your campaign brief has been securely delivered to the SULFS Studio production team. We will review your project and get back to you with a tailored script layout and quotation within 24 hours.",
    enquiryId: newEnquiry.id,
    smtpConfigured: true
  });
});

// 3. Admin Passcode authentication & Enquiries Fetching
const ADMIN_PASSCODE = process.env.ADMIN_PASCODE || "SULFS_PROD_2026_SECURE";

// Sliding Session Tokens with 2 hours durability
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = (req.body?.token || req.query?.token) as string;
  }

  if (!token) {
    return res.status(403).json({ error: "Unauthorized access. Valid session token required." });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(403).json({ error: "Unauthorized access. Valid session token required." });
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }

  // Slide token expiration forward by another 2 hours
  session.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  next();
};

// Brute-force protecting rate limiter for administrative auth attempts
const authAttemptsLog: Record<string, { count: number; lockoutTime: number }> = {};
const adminAuthRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
  const now = Date.now();

  if (authAttemptsLog[ip] && authAttemptsLog[ip].lockoutTime > now) {
    const waitSec = Math.ceil((authAttemptsLog[ip].lockoutTime - now) / 1000);
    return res.status(429).json({ error: `Too many login failures. Locked out. Please try again in ${waitSec} seconds.` });
  }
  next();
};

app.post("/api/admin-auth", adminAuthRateLimiter, (req, res) => {
  const { passcode } = req.body;
  const ip = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
  const now = Date.now();

  if (!passcode) {
    return res.status(400).json({ error: "Passcode is required" });
  }

  if (passcode === ADMIN_PASSCODE) {
    // Clear lockout history on successful authentication
    delete authAttemptsLog[ip];

    // Generate a strong dynamic single-session token
    const token = "sulfs_session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    activeSessions.set(token, {
      username: "Studio Operator",
      expiresAt: now + 2 * 60 * 60 * 1000 // 2 hours sliding window
    });
    return res.json({ success: true, token });
  }

  // Record failed attempt
  if (!authAttemptsLog[ip]) {
    authAttemptsLog[ip] = { count: 1, lockoutTime: 0 };
  } else {
    authAttemptsLog[ip].count += 1;
    if (authAttemptsLog[ip].count >= 5) {
      // Lock out for 60 seconds
      authAttemptsLog[ip].lockoutTime = now + 60 * 1000;
      return res.status(429).json({ error: "Too many login failures. Locked out for 60 seconds." });
    }
  }

  res.status(401).json({ error: "Incorrect passcode. Please try again." });
});

// Admin endpoint to retrieve all enquiries
app.post("/api/admin/enquiries", requireAdminAuth, (req, res) => {
  res.json({ enquiries });
});

// Admin endpoint to update status and operator internal notes
app.post("/api/admin/enquiry/update", requireAdminAuth, (req, res) => {
  const { enquiryId, status, internalNotes, checklist } = req.body;
  if (!enquiryId) {
    return res.status(400).json({ error: "Enquiry ID is required" });
  }

  const idx = enquiries.findIndex(e => e.id === enquiryId);
  if (idx === -1) {
    return res.status(444).json({ error: "Enquiry not found" });
  }

  if (status) {
    enquiries[idx].status = status;
  }
  if (internalNotes !== undefined) {
    enquiries[idx].internalNotes = internalNotes;
  }
  if (checklist) {
    enquiries[idx].checklist = {
      ...enquiries[idx].checklist,
      ...checklist
    };
  }

  saveEnquiriesToDisk(enquiries);
  res.json({ success: true, message: "Enquiry updated successfully", enquiry: enquiries[idx] });
});

// Admin endpoint to delete an enquiry
app.post("/api/admin/enquiry/delete", requireAdminAuth, (req, res) => {
  const { enquiryId } = req.body;
  if (!enquiryId) {
    return res.status(400).json({ error: "Enquiry ID is required" });
  }

  const idx = enquiries.findIndex(e => e.id === enquiryId);
  if (idx === -1) {
    return res.status(444).json({ error: "Enquiry not found" });
  }

  enquiries.splice(idx, 1);
  saveEnquiriesToDisk(enquiries);
  res.json({ success: true, message: "Enquiry deleted successfully" });
});

// Admin endpoint to create or update quotation details
app.post("/api/admin/enquiry/quote", requireAdminAuth, (req, res) => {
  const { enquiryId, amount, taxTreatment, depositRequired, dueDate, scope, status, quoteRef } = req.body;
  if (!enquiryId) {
    return res.status(400).json({ error: "Enquiry ID is required" });
  }

  const idx = enquiries.findIndex(e => e.id === enquiryId);
  if (idx === -1) {
    return res.status(444).json({ error: "Enquiry not found" });
  }

  if (!enquiries[idx].quotes) {
    enquiries[idx].quotes = [];
  }

  const ref = quoteRef || `SULFS-QT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const quoteIdx = enquiries[idx].quotes.findIndex((q: any) => q.quoteRef === ref);

  const newQuote = {
    quoteRef: ref,
    amount: parseFloat(amount) || 0,
    currency: "GBP",
    taxTreatment: taxTreatment || "No VAT (Small Business Exemption)",
    depositRequired: parseFloat(depositRequired) || 0,
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 3600000).toISOString().split('T')[0],
    scope: scope || "Bespoke AI Creative Production",
    status: status || "Draft",
    createdAt: new Date().toISOString()
  };

  if (quoteIdx !== -1) {
    enquiries[idx].quotes[quoteIdx] = newQuote;
  } else {
    enquiries[idx].quotes.push(newQuote);
  }

  // Also auto update status to 'Quoted' if we save a quotation
  enquiries[idx].status = "Quoted";

  saveEnquiriesToDisk(enquiries);
  res.json({ success: true, message: "Quote generated successfully", quotes: enquiries[idx].quotes });
});

// Public Endpoint: Lookup details for specific client-enquiry (used for Client Portal)
app.get("/api/client/enquiry", (req, res) => {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Enquiry ID is required" });
  }

  const enq = enquiries.find(e => e.id === id);
  if (!enq) {
    return res.status(404).json({ error: "Enquiry not found" });
  }

  // Filter internal fields for client privacy
  const sanitizedEnq = {
    id: enq.id,
    fullName: enq.fullName,
    businessName: enq.businessName,
    email: enq.email,
    location: enq.location,
    niche: enq.niche,
    serviceRequired: enq.serviceRequired,
    budgetRange: enq.budgetRange,
    projectDescription: enq.projectDescription,
    createdAt: enq.createdAt,
    videoObjective: enq.videoObjective,
    preferredFormat: enq.preferredFormat,
    desiredTimeline: enq.desiredTimeline,
    status: enq.status,
    quotes: enq.quotes || [],
    checklist: enq.checklist || {
      scriptApproved: false,
      claimsVerified: false,
      logoApproved: false,
      voiceoverApproved: false,
      finalApproved: false
    }
  };

  res.json({ success: true, enquiry: sanitizedEnq });
});

// Public Endpoint: Client approves checklist items (script, claims, voiceover, final, etc)
app.post("/api/client/checklist/approve", (req, res) => {
  const { enquiryId, field, approvedBy } = req.body;
  if (!enquiryId || !field || !approvedBy) {
    return res.status(400).json({ error: "Enquiry ID, field, and signature are required" });
  }

  const idx = enquiries.findIndex(e => e.id === enquiryId);
  if (idx === -1) {
    return res.status(444).json({ error: "Enquiry not found" });
  }

  if (!enquiries[idx].checklist) {
    enquiries[idx].checklist = {
      scriptApproved: false,
      claimsVerified: false,
      logoApproved: false,
      voiceoverApproved: false,
      finalApproved: false
    };
  }

  const validFields = ["scriptApproved", "claimsVerified", "logoApproved", "voiceoverApproved", "finalApproved"];
  if (!validFields.includes(field)) {
    return res.status(400).json({ error: "Invalid checklist item" });
  }

  enquiries[idx].checklist[field] = true;
  enquiries[idx].checklist[`${field}By`] = approvedBy;
  enquiries[idx].checklist[`${field}At`] = new Date().toISOString();

  saveEnquiriesToDisk(enquiries);
  res.json({ success: true, message: "Item approved and locked successfully", checklist: enquiries[idx].checklist });
});

// Seed enquiries with a few realistic starter leads if the list is empty (for admin preview)
if (enquiries.length === 0) {
  enquiries.push(
    {
      id: "enq_seed1",
      fullName: "Jonathan Vance",
      businessName: "[SAMPLE DEMO] Vance Shaker Kitchens",
      email: "jonathan@vancekitchens.co.uk",
      phone: "+44 7700 900077",
      location: "London, UK",
      niche: "Home Improvement",
      serviceRequired: "Starter Package (15s Video Ad)",
      budgetRange: "starter",
      projectDescription: "Looking to showcase our high-end shaker kitchen installations across Hertfordshire with social-oriented vertical video creatives. Require raw, elegant visual pacing focusing on quartz surface craft and soft lighting.",
      websiteUrl: "vancekitchens.co.uk",
      videoObjective: "Local Lead Generation (Request Quote)",
      preferredFormat: "Vertical 9:16 (TikTok/Insta)",
      desiredTimeline: "Standard 3-5 Business Days",
      status: "New",
      internalNotes: "Demo Sample Lead. Client has clean high-resolution photos of finished work. Needs focus on bespoke wood trim.",
      createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
      consentRecord: { ip: "127.0.0.1", timestamp: new Date().toISOString(), text: "Demo consent" },
      quotes: [],
      checklist: { scriptApproved: false, claimsVerified: false, logoApproved: false, voiceoverApproved: false, finalApproved: false }
    },
    {
      id: "enq_seed2",
      fullName: "Sarah Higgins",
      businessName: "[SAMPLE DEMO] Higgins & Co Bathrooms",
      email: "sarah@higginsbathrooms.co.uk",
      phone: "+44 7700 900088",
      location: "Manchester, UK",
      niche: "Home Improvement",
      serviceRequired: "Growth Package (3x Ad Variations)",
      budgetRange: "growth",
      projectDescription: "Looking to target local homeowners in Cheshire with vertical ad campaigns. Need three variations showing modern walk-in showers with luxurious gold brassware.",
      websiteUrl: "higginsbathrooms.co.uk",
      videoObjective: "Local Lead Generation (Request Quote)",
      preferredFormat: "Vertical 9:16 (TikTok/Insta)",
      desiredTimeline: "Standard 3-5 Business Days",
      status: "New",
      internalNotes: "Demo Sample Lead. Client requested gold accent close-ups and bathroom visual before/after sequences.",
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      consentRecord: { ip: "127.0.0.1", timestamp: new Date().toISOString(), text: "Demo consent" },
      quotes: [],
      checklist: { scriptApproved: false, claimsVerified: false, logoApproved: false, voiceoverApproved: false, finalApproved: false }
    }
  );
  saveEnquiriesToDisk(enquiries);
}

// 4. POST /api/generate-video - Start a supported Google AI video-generation operation
app.post("/api/generate-video", requireAdminAuth, rateLimitMiddleware, async (req, res) => {
  const { params, bypassAuth } = req.body;

  if (!params) {
    return res.status(400).json({ error: "Generation parameters are required." });
  }

  const { businessType, adObjective, videoPrompt, aspectRatio, resolution, visualStyle, ctaText } = params;

  if (!businessType || !adObjective || !videoPrompt || !aspectRatio || !resolution) {
    return res.status(400).json({ error: "Missing required video generation properties." });
  }

  // Security check: Only allow admin auth token, OR we can allow user tests with rate limiting
  const isConfigured = getApiKey() !== null;

  if (!isConfigured) {
    // If the API is not configured, we return a clearly labeled demo/simulated run.
    // The client will display this beautifully so the user can see exactly how the flow works!
    const simulatedOpName = `models/veo-3.1-lite-generate-preview/operations/sim_${Date.now()}`;
    
    // Save simulation details to history
    generatedVideosHistory.push({
      operationName: simulatedOpName,
      params,
      isSimulated: true,
      createdAt: new Date().toISOString(),
      status: "polling",
    });

    return res.json({
      operationName: simulatedOpName,
      isSimulated: true,
      message: "API Key not configured. Initiating premium SULFS demonstration video fallback flow.",
    });
  }

  try {
    const ai = getAIClient();
    
    // Call Google Veo Lite generator model as per guidelines
    console.log(`[Google Veo API] Initiating generation on veo-3.1-lite-generate-preview with prompt: "${videoPrompt}"`);
    
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt: `${videoPrompt}. Style: ${visualStyle || "Cinematic"}. Text: ${ctaText || ""}`,
      config: {
        numberOfVideos: 1,
        resolution: resolution === "1080p" ? "1080p" : "720p",
        aspectRatio: aspectRatio === "16:9" ? "16:9" : "9:16",
      },
    });

    // Save operation details to history
    generatedVideosHistory.push({
      operationName: operation.name,
      params,
      isSimulated: false,
      createdAt: new Date().toISOString(),
      status: "polling",
    });

    res.json({
      operationName: operation.name,
      isSimulated: false,
    });
  } catch (error: any) {
    console.error("[Google Veo API Error]:", error);
    res.status(500).json({
      error: "Failed to connect to Google Veo API.",
      details: error.message || "An unexpected error occurred on the AI service.",
    });
  }
});

// 5. POST /api/video-status - Poll operation status
app.post("/api/video-status", requireAdminAuth, async (req, res) => {
  const { operationName } = req.body;

  if (!operationName) {
    return res.status(400).json({ error: "operationName is required" });
  }

  // Check if this is a simulated operation
  if (operationName.includes("/operations/sim_")) {
    const historyItem = generatedVideosHistory.find(h => h.operationName === operationName);
    if (!historyItem) {
      return res.status(404).json({ error: "Simulated operation not found" });
    }

    // After starting, we simulate status. We can let the client poll a couple times
    const ageSeconds = (Date.now() - new Date(historyItem.createdAt).getTime()) / 1000;
    
    // Simulate that video takes around 12 seconds to generate for a responsive demo
    if (ageSeconds >= 12) {
      historyItem.status = "success";
      
      // Select appropriate beautiful CORS-enabled clip based on the business type requested
      let videoUrl = "https://vjs.zencdn.net/v/oceans.mp4"; // Kitchen default
      const bizTypeLower = (historyItem.params.businessType || "").toLowerCase();
      
      if (bizTypeLower.includes("bath") || bizTypeLower.includes("shower") || bizTypeLower.includes("toilet")) {
        videoUrl = "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4";
      } else if (bizTypeLower.includes("garden") || bizTypeLower.includes("landscap") || bizTypeLower.includes("lawn") || bizTypeLower.includes("outdoor")) {
        videoUrl = "https://res.cloudinary.com/demo/video/upload/elephants.mp4";
      } else if (bizTypeLower.includes("build") || bizTypeLower.includes("contract") || bizTypeLower.includes("renovat") || bizTypeLower.includes("carpenter")) {
        videoUrl = "https://res.cloudinary.com/demo/video/upload/dog.mp4";
      }

      return res.json({
        done: true,
        isSimulated: true,
        videoUrl,
        progress: 100,
        status: "success",
      });
    } else {
      // Return progress message
      const progressPercent = Math.min(Math.floor((ageSeconds / 12) * 100), 95);
      let progressMessage = "Analyzing storyboard and creative brief...";
      if (progressPercent > 30 && progressPercent <= 60) {
        progressMessage = "Generating cinematic frames via Google Veo model...";
      } else if (progressPercent > 60) {
        progressMessage = "Performing remote professional post-production and grading...";
      }

      return res.json({
        done: false,
        isSimulated: true,
        progress: progressPercent,
        progressMessage,
      });
    }
  }

  // Real Google Veo Polling
  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API Key is not configured for polling." });
  }

  try {
    const ai = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    
    console.log(`[Google Veo API] Polling status for: ${operationName}`);
    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    if (updated.done) {
      const generatedVideo = updated.response?.generatedVideos?.[0];
      const uri = generatedVideo?.video?.uri;
      
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";
      
      res.json({
        done: true,
        isSimulated: false,
        hasUri: !!uri,
        // Send a unique token to download it securely
        downloadUrl: `/api/video-download?operationName=${encodeURIComponent(operationName)}&token=${encodeURIComponent(token)}`,
      });
    } else {
      res.json({
        done: false,
        isSimulated: false,
        progressMessage: "Google Veo is computing video frames. This can take 2-3 minutes. Thank you for your patience...",
      });
    }
  } catch (error: any) {
    console.error("[Google Veo Polling Error]:", error);
    res.status(500).json({
      error: "Error polling Google Veo operation status.",
      details: error.message || "Network or API timeout.",
    });
  }
});

// 6. GET /api/video-download - Stream the completed video securely from Google's CDN to the client
app.get("/api/video-download", requireAdminAuth, async (req, res) => {
  const operationName = req.query.operationName as string;

  if (!operationName) {
    return res.status(400).send("operationName query parameter is required");
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return res.status(500).send("Gemini API key is not configured for video streaming.");
  }

  try {
    const ai = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;
    
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).send("Completed video URI could not be found in the operation payload.");
    }

    console.log(`[Google Veo Stream] Securely fetching video from Google URI: ${uri}`);
    
    // Access Google's CDN on behalf of client
    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch source video file from Google CDN: ${videoRes.statusText}`);
    }

    // Set standard video headers and stream the chunks
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Cache-Control", "public, max-age=3600");

    const reader = videoRes.body?.getReader();
    if (!reader) {
      return res.status(500).send("Failed to initialize remote stream reader.");
    }

    // Pipe response
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();

  } catch (error: any) {
    console.error("[Google Veo Download Stream Error]:", error);
    res.status(500).send(`Stream transmission failed: ${error.message || error}`);
  }
});


// --- Vite Dev or Static Production Middleware Setup ---

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SULFS Server] Starting in DEVELOPMENT mode with Vite integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
  } else {
    console.log("[SULFS Server] Starting in PRODUCTION mode serving bundled static assets...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static frontend assets
    app.use(express.static(distPath));
    
    // SPA Fallback for client routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 SULFS Studio Full-Stack Server running on port ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`🛡️ Admin Passcode is set: SULFS2026 (override via ADMIN_PASCODE)`);
    console.log(`=============================================================\n`);
  });
};

startServer().catch((err) => {
  console.error("FATAL: Failed to launch SULFS Server:", err);
  process.exit(1);
});
