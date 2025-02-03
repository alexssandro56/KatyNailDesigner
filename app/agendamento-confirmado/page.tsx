import { redirect } from "next/navigation"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import nodemailer from "nodemailer"

async function enviarEmail(dados: any) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "05jeelo30@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const mailOptions = {
    from: "05jeelo30@gmail.com",
    to: "05jeelo30@gmail.com",
    subject: "Novo Agendamento Confirmado",
    text: `
      Nome: ${dados.nome}
      Telefone: ${dados.telefone}
      Data: ${dados.data}
      Hora: ${dados.horario}
      Serviço: ${dados.servico}
    `,
  }

  await transporter.sendMail(mailOptions)
}

export default async function AgendamentoConfirmado({ searchParams }: { searchParams: { [key: string]: string } }) {
  const { collection_id, collection_status, external_reference } = searchParams

  if (!external_reference || collection_status !== "approved") {
    redirect("/")
  }

  try {
    const bookingRef = doc(db, "agendamentos", external_reference)
    const bookingSnap = await getDoc(bookingRef)

    if (bookingSnap.exists()) {
      const bookingData = bookingSnap.data()
      await updateDoc(bookingRef, {
        status: "confirmado",
        paymentId: collection_id,
      })

      await enviarEmail(bookingData)

      return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Agendamento Confirmado</h1>
          <p>Seu agendamento foi confirmado com sucesso!</p>
          <p>Nome: {bookingData.nome}</p>
          <p>Data: {bookingData.data}</p>
          <p>Hora: {bookingData.horario}</p>
          <p>Serviço: {bookingData.servico}</p>
        </div>
      )
    } else {
      throw new Error("Agendamento não encontrado")
    }
  } catch (error) {
    console.error("Erro ao processar confirmação:", error)
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Erro na Confirmação</h1>
        <p>Ocorreu um erro ao confirmar seu agendamento. Por favor, entre em contato conosco.</p>
      </div>
    )
  }
}

