import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

export async function GET(req: NextRequest) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!accessToken) {
      console.error("A variável de ambiente MERCADOPAGO_ACCESS_TOKEN não está definida.")
      return NextResponse.json({ error: "Erro interno: Configuração inválida." }, { status: 500 })
    }

    // Configuração correta do Mercado Pago
    const client = new MercadoPagoConfig({ accessToken })
    const paymentInstance = new Payment(client)

    const paymentId = req.nextUrl.searchParams.get("payment_id")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID não fornecido" }, { status: 400 })
    }

    const response = await paymentInstance.get({ id: paymentId })

    return NextResponse.json({
      status: response.status,
      details: response,
    })
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido ao verificar status do pagamento" },
      { status: 500 }
    )
  }
}
