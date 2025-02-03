import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Inicializa Firebase apenas se ainda não estiver inicializado
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// 🔹 Obtendo as configurações do Firebase Functions
const functionsConfig = admin.app().options;
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";


if (!EMAIL_USER || !EMAIL_PASS) {
 console.error("ERRO: Configurações de e-mail não definidas.");

}

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "05jeelo30@gmail.com", // ,
    pass:  "hethsdszetmurqwf" // 
  },
});

export const enviarEmailAgendamento = onDocumentCreated(
  "agendamentos/{agendamentoId}",
  async (event) => {
    const agendamento = event.data?.data();

    if (!agendamento) {
      console.error("ERRO: Configurações de e-mail não definidas.");

      return;
    }

    const mailOptions = {
      from: EMAIL_USER,
      to: "05jeelo30@gmail.com",
      subject: "Novo Agendamento Recebido! 💅",
      html: `
        <h2>Novo Agendamento</h2>
        <p><strong>Nome:</strong> ${agendamento.nome}</p>
        <p><strong>WhatsApp:</strong> ${agendamento.telefone}</p>
        <p><strong>Data:</strong> ${agendamento.data}</p>
        <p><strong>Horário:</strong> ${agendamento.horario}</p>
        <p><strong>Serviço:</strong> ${agendamento.servico}</p>
        <p><strong>Valor:</strong> R$ ${agendamento.valor.toFixed(2)}</p>
        <br />
        <p>📅 <strong>O agendamento foi salvo no Firestore.</strong></p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ E-mail enviado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail:", error);
    }
  }
);
