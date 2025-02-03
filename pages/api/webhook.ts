import { NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 Webhook recebido:", body);

    if (!body || !body.data || !body.type) {
      return NextResponse.json({ error: "Webhook sem dados válidos" }, { status: 400 });
    }

    const paymentId = body.data.id;
    const paymentStatus = body.data.status; // 🔹 Status do pagamento (approved, pending, rejected)
    const externalReference = body.data.external_reference; // 🔹 ID do agendamento no Firebase

    if (!externalReference) {
      return NextResponse.json({ error: "Webhook ignorado, ID ausente" }, { status: 400 });
    }

    // 🔹 Atualizar o status no Firebase
    const bookingRef = doc(db, "agendamentos", externalReference);
    await updateDoc(bookingRef, { status: paymentStatus });

    console.log(`✅ Agendamento ${externalReference} atualizado para: ${paymentStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro no Webhook:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}