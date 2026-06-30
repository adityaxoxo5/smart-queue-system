const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const twilio = require("twilio");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ── Schema ────────────────────────────────────────────────────────────────────
const QueueSchema = new mongoose.Schema({
  name:         String,
  email:        String,
  phone:        String,
  queueType:    { type: String, default: "General Physician" },
  priority:     { type: Number, default: 3 },   // 1=Emergency 2=Monthly 3=General
  tokenNumber:  Number,
  displayToken: String,                          // e.g. CD3, N1, GS2
  joinedAt:     { type: Date, default: Date.now }
});

const Queue = mongoose.model("Queue", QueueSchema);

// ── Twilio ────────────────────────────────────────────────────────────────────
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client     = twilio(accountSid, authToken);

// ── Doctor prefix map ─────────────────────────────────────────────────────────
const DOCTOR_PREFIX = {
  "Cardiologist":      "CD",
  "Neurologist":       "N",
  "Orthopedist":       "O",
  "Dermatologist":     "D",
  "Pediatrician":      "P",
  "General Physician": "GS",
};

const PRIORITY_LABEL = { 1:"Emergency", 2:"Monthly", 3:"General" };

// ── WhatsApp helper ───────────────────────────────────────────────────────────
async function sendWhatsApp(phone, message) {
  try {
    await client.messages.create({
      body: message,
      from: "whatsapp:+14155238886",
      to:   "whatsapp:" + phone,
    });
  } catch (err) {
    console.log("WhatsApp failed:", err.message);
  }
}

// ── JOIN QUEUE ────────────────────────────────────────────────────────────────
app.post("/join", async (req, res) => {
  try {
    const { name, email, phone, queueType, priority } = req.body;

    // Count existing tokens for this doctor to generate next token number
    const tokenCount   = await Queue.countDocuments({ queueType });
    const tokenNumber  = tokenCount + 1;
    const prefix       = DOCTOR_PREFIX[queueType] || "Q";
    const displayToken = `${prefix}${tokenNumber}`;

    // Count people ahead in priority order (lower priority number = served first)
    const aheadCount = await Queue.countDocuments({
      queueType,
      priority: { $lte: Number(priority) },   // same or higher priority
    });

    const estimatedWait   = (aheadCount) * 3;
    const priorityLabel   = PRIORITY_LABEL[priority] || "General";

    // Save user
    const user = new Queue({
      name, email, phone, queueType,
      priority:     Number(priority),
      tokenNumber,
      displayToken,
    });
    await user.save();

    // WhatsApp message
    const msg =
`Hello ${name}! 🏥

Your appointment has been booked.

🎫 Token Number  : *${displayToken}*
🩺 Doctor        : *${queueType}*
🔖 Visit Type    : *${priorityLabel}*
👥 People ahead  : ${aheadCount}
⏱ Est. wait     : ~${estimatedWait} minutes

Please wait. You will be notified when it's your turn.

– Hospital Queue System`;

    await sendWhatsApp(phone, msg);

    res.json({ message: "Joined Queue", token: tokenNumber, displayToken });

  } catch (err) {
    console.error("Join error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── GET ALL QUEUE (sorted by priority then joinedAt) ──────────────────────────
app.get("/queue", async (req, res) => {
  try {
    const queue = await Queue.find().sort({ priority: 1, joinedAt: 1 });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching queue." });
  }
});

// ── GET QUEUE BY DOCTOR ───────────────────────────────────────────────────────
app.get("/queue/:type", async (req, res) => {
  try {
    const queue = await Queue.find({ queueType: req.params.type }).sort({ priority: 1, joinedAt: 1 });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching queue." });
  }
});

// ── SERVE NEXT (auto — highest priority first) ────────────────────────────────
app.post("/serve-next", async (req, res) => {
  try {
    const { queueType } = req.body;
    const filter = queueType ? { queueType } : {};

    const nextUser = await Queue.findOne(filter).sort({ priority: 1, joinedAt: 1 });
    if (!nextUser) return res.status(404).json({ message: "Queue is empty." });

    await Queue.findByIdAndDelete(nextUser._id);

    // Notify served user
    await sendWhatsApp(nextUser.phone,
`Hello ${nextUser.name}! ✅

It's your turn!

🩺 Doctor : *${nextUser.queueType}*
🎫 Token  : *${nextUser.displayToken}*

Please proceed to the consultation room now.

– Hospital Queue System`);

    // Notify next person in same doctor's queue
    const newNext = await Queue.findOne({ queueType: nextUser.queueType }).sort({ priority: 1, joinedAt: 1 });
    if (newNext) {
      await sendWhatsApp(newNext.phone,
`Hello ${newNext.name}! ⏰

You are next in line.

🩺 Doctor : *${newNext.queueType}*
🎫 Token  : *${newNext.displayToken}*

Please be ready.

– Hospital Queue System`);
    }

    res.json({ message: "Served", served: nextUser });
  } catch (err) {
    console.error("Serve next error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── DELETE / SERVE SPECIFIC USER ─────────────────────────────────────────────
app.delete("/delete/:id", async (req, res) => {
  try {
    // Get user BEFORE deleting
    const user = await Queue.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await Queue.findByIdAndDelete(req.params.id);

    // Notify served user
    await sendWhatsApp(user.phone,
`Hello ${user.name}! ✅

You have been served.

🩺 Doctor : *${user.queueType}*
🎫 Token  : *${user.displayToken}*

Thank you for visiting. Get well soon! 💊

– Hospital Queue System`);

    // Notify next in same doctor's queue
    const nextUser = await Queue.findOne({ queueType: user.queueType }).sort({ priority: 1, joinedAt: 1 });
    if (nextUser) {
      await sendWhatsApp(nextUser.phone,
`Hello ${nextUser.name}! ⏰

It's almost your turn!

🩺 Doctor : *${nextUser.queueType}*
🎫 Token  : *${nextUser.displayToken}*

Please come to the waiting area near the consultation room.

– Hospital Queue System`);
    }

    res.json({ message: "Served and notified" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(process.env.PORT || 5000, () => console.log("Server running on port 5000"));