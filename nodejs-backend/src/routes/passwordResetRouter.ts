import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import {prisma} from '../../prisma';
import { Prisma } from '@prisma/client';
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/password-reset-link', async (req, res) => {
  const { email } = req.body;
  
  console.log(email);
  // 1. verify if email is in database
  let user;
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        email: email
      }
    })
  } catch (error) {
    // Handle other potential errors here
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code=="P2025") {
      return res.status(500).json({ message: "Email not found" });
    }
    
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  const timestamp = Date.now();
  const currentDate = new Date(timestamp);

  console.log(email, currentDate.toLocaleString());

  const token = crypto.randomBytes(20).toString('hex');
  const resetLink = process.env.FRONTEND_URL + `password-reset/${token}`;
  // Validate the email (make sure it's registered, etc.)

  // Create a reset token and expiry date for the user
  await prisma.user.update({
    where: { email: user.email },
    data: {
      resetToken: token,
      resetTokenExpiry: Date.now() + 3600000, // 1 hour from now
    },
  });

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your preferred email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset',
    text: `Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.`
    // You'd typically generate a unique link for the user to reset their password
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Reset email sent successfully.' });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ error: 'Failed to send reset email.' });
  }
});


router.post('/password-reset/confirm', async (req, res) => {
  const { token, password } = req.body;
  console.log(token, password);

  // 1. Find the user by the token
  const user = await prisma.user.findUnique({
    where: {
      resetToken: token
    }
  })

  if (!user || !user.resetToken || !user.resetTokenExpiry) {
    return res.status(200).send({ message: 'User not found from provided token.' });
  }

  // 2. Verify that the token hasn't expired
  if (BigInt(Date.now()) - user.resetTokenExpiry > 0) {
    return res.status(200).send({
      message: "Expired token, please try again."
    })
  }

  // 3. Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log("Hashed new password - " + hashedPassword);
  // 4. Update the user's password in the database
  await prisma.user.update({
    where: {
      resetToken: token
    }, 
    data: {
      password: hashedPassword
    }
  })

  // 5. Invalidate the token so it can't be used again
  // by set the resetExpiryDate to the current time
  await prisma.user.update({
    where: {
      resetToken: token
    },
    data: {
      resetTokenExpiry: Date.now() - 1
    }
  })

  return res.status(200).send({
    message: "reset password success"
  })
});


export default router;
