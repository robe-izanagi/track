const User = require("../models/User");
const AccountCode = require("../models/AccountCode");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client, UserRefreshClient } = require("google-auth-library");

const JWT_SECRET = process.env.JWT_SECRET || "verysecretjwtkey";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
const googleClient = GOOGLE_CLIENT_ID
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

/** Helper: add minutes */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/** Helper: sign token */
function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

exports.register = async (req, res) => {
  try {
    const { username, password, accountCode1, accountCode2 } = req.body;
    if (!username || !password || !accountCode1 || !accountCode2) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const codeDoc = await AccountCode.findOne({
      accountCode1,
      accountCode2,
    });

    const existingUsername = await User.findOne({ $or: [{ username }] });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }
    if (!codeDoc) {
      return res.status(401).json({ error: "Invalid account codes" });
    }
    if (codeDoc.usedBy) {
      return res.status(409).json({ error: "Account codes already used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = codeDoc.userType || "user";

    const user = new User({
      username,
      password: hashedPassword,
      role,
      loginAttempts: 0,
      status: "active",
      lastSuccessfulLogin: null,
      blockedUntil: null,
    });

    await user.save();

    codeDoc.usedBy = username;
    await codeDoc.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};

exports.login = async (req, res) => {
  const ATTEMPT_THRESHOLD = 8;
  const BLOCK_MINUTES = 30;

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Account not found" });
    }

    const now = new Date();

    // 🔒 Handle blocked user
    if (user.status === "blocked") {
      if (user.blockedUntil && user.blockedUntil > now) {
        return res.status(403).json({
          error: `Account blocked. Try again after ${user.blockedUntil.toISOString()}`,
        });
      }

      // auto-unblock
      user.status = "active";
      user.loginAttempts = 0;
      user.blockedUntil = null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // ❌ Wrong password
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= ATTEMPT_THRESHOLD) {
        user.status = "blocked";
        user.blockedUntil = addMinutes(now, BLOCK_MINUTES);

        await user.save();
        return res.status(403).json({
          error: `Account blocked. Try again after ${user.blockedUntil.toISOString()}`,
        });
      }

      await user.save();
      return res.status(401).json({
        error: "Invalid credentials",
        attempts: user.loginAttempts,
      });
    }

    // successful login
    user.loginAttempts = 0;
    user.status = "active";
    user.blockedUntil = null;
    user.lastSuccessfulLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userData = user.toObject();
    delete userData.password;

    return res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};

/**
 * Admin unblock endpoint (simple admin secret)
 */
exports.adminUnblock = async (req, res) => {
  try {
    const secret = req.headers["x-admin-secret"];
    if (!secret || String(secret) !== ADMIN_SECRET) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = "active";
    user.loginAttempts = 0;
    user.blockedUntil = null;
    await user.save();

    return res.json({ message: "User unblocked" });
  } catch (err) {
    console.error("Admin unblock error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* =========================
   Google SSO and Profile
   ========================= */

/**
 * POST /api/auth/google
 * Accepts { id_token } from client, verifies with Google, then
 * - if user exists -> link googleId/emailVerified/name if needed
 * - if not exists -> create user (SSO style) with random password
 * Returns { success: true, token, user }
 */
// Replace the existing exports.googleAuth with the following:

// REPLACE your existing exports.googleAuth with this exact function
exports.googleAuth = async (req, res) => {
  try {
    const { id_token } = req.body;
    console.log(">>> googleAuth called (strict-match)");

    if (!id_token) {
      console.warn("googleAuth: no id_token provided");
      return res.status(400).json({ message: "id_token required" });
    }

    if (!googleClient) {
      console.error(
        "googleAuth: googleClient not configured (GOOGLE_CLIENT_ID missing)"
      );
      return res
        .status(500)
        .json({ message: "Google client not configured on server" });
    }

    // verify token with Google
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      console.error(
        "googleAuth: verifyIdToken failed:",
        verifyErr?.message || verifyErr
      );
      return res.status(400).json({ message: "Invalid Google id_token" });
    }

    const payload = ticket.getPayload();
    console.log("googleAuth: google token payload:", {
      sub: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      email_verified: payload?.email_verified,
    });

    const googleId = payload?.sub;
    const googleEmail = payload?.email;
    const name = payload?.name || null;
    const emailVerified = Boolean(payload?.email_verified);

    if (!googleEmail && !googleId) {
      console.warn("googleAuth: payload missing email & sub");
      return res.status(400).json({ message: "Google token missing email/id" });
    }

    // STRICT MATCH: only find user if googleEmail or googleId matches stored google fields.
    const queryParts = [];
    if (googleId) queryParts.push({ googleId });
    if (googleEmail) queryParts.push({ googleEmail: googleEmail });

    console.log("googleAuth: strict queryParts:", queryParts);
    const user = await User.findOne({ $or: queryParts }).exec();

    console.log(
      "googleAuth: found user by google fields?:",
      !!user,
      user ? { id: user._id, username: user.username, role: user.role } : null
    );

    if (!user) {
      // NO AUTO-CREATION: require user to register with system codes first or link Google from profile
      console.warn(
        "googleAuth: no matching user for google account -> require register/link first"
      );
      return res.status(401).json({
        success: false,
        error:
          "Google account not linked. Please register with your TRACK account (using account codes) and link Google from Profile first.",
        redirect: "/register",
      });
    }

    // Update missing google fields if any (safe)
    let changed = false;
    if (!user.googleId && googleId) {
      user.googleId = googleId;
      changed = true;
    }
    if (!user.googleEmail && googleEmail) {
      user.googleEmail = googleEmail;
      changed = true;
    }
    if (!user.emailVerified && emailVerified) {
      user.emailVerified = true;
      changed = true;
    }
    if (!user.name && name) {
      user.name = name;
      changed = true;
    }
    if (changed) {
      await user.save();
      console.log("googleAuth: updated user google fields");
    }

    // create token and return user with saved role
    const token = signToken(user);
    console.log("googleAuth: issuing token for user", user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        // email: user.email,
        googleEmail: user.googleEmail,
        googleId: user.googleId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("googleAuth err", err);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

/**
 * POST /api/auth/google/link
 * Link Google account to CURRENT user.
 * NOTE: the user must present their JWT in Authorization header (Bearer).
 * We verify the JWT inline here (no middleware).
 * Security: require that Google email matches current user's email.
 */
// --- replace existing exports.linkGoogle with this ---
exports.linkGoogle = async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: "id_token required" });
    if (!googleClient)
      return res
        .status(500)
        .json({ error: "Google client not configured on server" });

    // verify JWT (inline; you have this pattern elsewhere)
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "Auth required (Bearer token)" });
    const token = auth.split(" ")[1];
    let payloadJwt;
    try {
      payloadJwt = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // verify google token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const g = ticket.getPayload();

    const user = await User.findById(payloadJwt.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // NOTE: per your design, system email and google email CAN be different.
    // Link google fields to this existing user record.
    user.googleId = g.sub || user.googleId;
    user.googleEmail = g.email || user.googleEmail;
    user.emailVerified = Boolean(g.email_verified) || user.emailVerified;
    user.name = g.name || user.name;
    // optionally store raw id_token
    user.emailToken = id_token;

    await user.save();

    // return updated user object (sanitized)
    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        // email: user.email,
        googleEmail: user.googleEmail,
        googleId: user.googleId,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("linkGoogle error", err);
    return res.status(500).json({ error: "Failed to link Google account" });
  }
};

/**
 * GET /api/auth/profile
 * No middleware used — JWT verified inline here.
 */
// --- replace existing exports.getProfile with this ---
exports.getProfile = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "Auth required (Bearer token)" });
    const token = auth.split(" ")[1];
    let payloadJwt;
    try {
      payloadJwt = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // include googleEmail and googleId in returned fields so frontend can show linked google
    const user = await User.findById(payloadJwt.id)
      .select(
        "username email name emailVerified googleId googleEmail lastSuccessfulLogin status blockedUntil role"
      )
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getProfile error", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * PUT /api/auth/profile
 * Update username, email, password. JWT verified inline (no middleware).
 * Body: { username?, email?, password? }
 */
exports.updateProfile = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "Auth required (Bearer token)" });
    const token = auth.split(" ")[1];
    let payloadJwt;
    try {
      payloadJwt = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { username, password } = req.body;
    const user = await User.findById(payloadJwt.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (username && username !== user.username) {
      const exists2 = await User.findOne({ username });
      if (exists2)
        return res.status(400).json({ error: "Username already in use" });
      user.username = username;
    }

    if (password && password.length >= 6) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    return res.json({
      message: "Profile updated",
      user: { id: user._id, username: user.username },
    });
  } catch (err) {
    console.error("updateProfile error", err);
    return res.status(500).json({ error: "Server error" });
  }
};
