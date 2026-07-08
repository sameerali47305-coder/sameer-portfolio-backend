const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

// Same check used in authController - only try sending email if
// real credentials are configured, otherwise skip silently.
const isEmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes("yourgmail");

const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await Contact.create({
      name,
      email,
      subject,
      message,
    });

    // Notify the site owner by email (best-effort - never blocks the
    // response, since the message is already saved in the database).
    if (isEmailConfigured()) {
      try {
        await sendEmail(
          process.env.EMAIL_USER,
          `New Contact Message: ${subject}`,
          `You received a new message from your portfolio contact form.\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `Message:\n${message}`
        );
      } catch (emailError) {
        console.log("Contact notification email failed:", emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  sendMessage,
};