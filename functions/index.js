/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "your-email@gmail.com",
		pass: "your-email-password",
	},
});

exports.sendEmailOTP = functions.https.onCall(async (data, context) => {
	const mailOptions = {
		from: "your-email@gmail.com",
		to: data.email,
		subject: "Your OTP Code",
		text: `Your OTP is: ${data.otp}`,
	};

	try {
		await transporter.sendMail(mailOptions);
		return { success: true };
	} catch (error) {
		console.error("Error sending email: ", error);
		return { success: false, error: error.message };
	}
});
