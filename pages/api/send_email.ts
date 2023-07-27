import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { name, email, note, targetUserName } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const AccepterfilePath = path.join(process.cwd(), 'templates', 'Accepter_email.html');
  const AccepterChange = fs.readFileSync(AccepterfilePath, 'utf8');
  let AccepterHtml = AccepterChange.replaceAll('http://www.example.com', `http://localhost:3000/catch/${targetUserName}`);
  if (note) {
      AccepterHtml = AccepterHtml.replace('No message', note);
  }

  const SenderfilePath = path.join(process.cwd(), 'templates', 'Sender_email.html');
  const SenderHtml =  fs.readFileSync(SenderfilePath, 'utf8');
                  

  const mailOptions1 = {
    from: process.env.EMAIL,
    to: email[0],
    subject: `약속 요청이 전송되었습니다.`,
    html: SenderHtml
  };

  const mailOptions2 = {
    from: process.env.EMAIL,
    to: email[1],
    subject: `${name}님이 약속 요청을 하셨습니다.`,
    html: AccepterHtml
  };

  await transporter.sendMail(mailOptions1);
  await transporter.sendMail(mailOptions2);

  res.status(200).json({ status: 'ok' });
}