import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, title, price, date, time, clientName, clientPhone, clientEmail } = await req.json();

    // 🔹 Verificar se todos os dados obrigatórios estão presentes
    if (!id || !title || !price || !clientName || !clientPhone || !clientEmail || !date || !time) {
      return NextResponse.json({ error: "Dados incompletos para criar o pagamento" }, { status: 400 });
    }

    // 🔹 Criar preferência de pagamento no Mercado Pago
    const preference = {
      items: [
        {
          title,
          unit_price: price,
          quantity: 1,
          currency_id: "BRL",
        },
      ],
      payer: {
        name: clientName,
        email: clientEmail,
        phone: { number: clientPhone },
      },
      back_urls: {
        success: process.env.NEXT_PUBLIC_SITE_URL + "/success",
        failure: process.env.NEXT_PUBLIC_SITE_URL + "/failure",
        pending: process.env.NEXT_PUBLIC_SITE_URL + "/pending",
      },
      notification_url: process.env.NEXT_PUBLIC_SITE_URL + "/api/webhook", // Webhook para capturar status do pagamento
      auto_return: "approved",
      external_reference: id, // Referência para identificação no Firebase
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Erro ao criar pagamento no Mercado Pago" }, { status: response.status });
    }

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
    });
  } catch (error) {
    console.error("❌ Erro ao criar pagamento:", error);
    return NextResponse.json({ error: "Erro interno ao criar pagamento" }, { status: 500 });
  }
}
