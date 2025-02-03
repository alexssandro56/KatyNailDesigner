import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { to, subject, text } = await request.json();

  // Configuração do Nodemailer (substitua com seus dados)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "05jeelo30@gmail.com",
      pass: "hethsdszetmurqwf",
    },
  });

  try {
    await transporter.sendMail({
      from: `"Agendamentos" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return NextResponse.json(
      { error: "Falha ao enviar e-mail" },
      { status: 500 }
    );
  }
}