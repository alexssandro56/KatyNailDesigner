import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error("A variável de ambiente MERCADOPAGO_ACCESS_TOKEN não está definida.")
      return NextResponse.json({ error: "Erro interno: Configuração inválida." }, { status: 500 })
    }

    const body = await req.json()
    const { title, price, paymentMethod, date, time, clientName, clientPhone } = body

    // Configuração do Mercado Pago
    const client = new MercadoPagoConfig({ accessToken })
    const preferenceInstance = new Preference(client)

    // Dados da preferência
    const preferenceData = {
      items: [
        {
          id: "1234", // Campo obrigatório!
          title,
          unit_price: price,
          quantity: 1,
        },
      ],
      payment_methods: {
        excluded_payment_types: paymentMethod === "credit" ? [{ id: "ticket" }] : [{ id: "credit_card" }],
      },
      external_reference: `${clientName}-${date}-${time}`,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago-webhook`,
    }

    // Criando a preferência de pagamento
    const response = await preferenceInstance.create({ body: preferenceData })

    return NextResponse.json({
      id: response.id,
      init_point: response.init_point,
    })
  } catch (error: any) {
    console.error("Erro ao criar a preferência de pagamento:", error)
    return NextResponse.json({ error: "Erro ao criar a preferência de pagamento", details: error.message }, { status: 500 })
  }
}
