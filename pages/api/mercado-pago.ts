import { NextApiRequest, NextApiResponse } from "next";
import { MercadoPagoConfig, Preference } from "mercadopago";

// Criando uma instância do Mercado Pago corretamente
const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { id, nome, telefone, data, horario, servico } = req.body;

    try {
      const preferenceInstance = new Preference(mercadoPagoClient);

      const preferenceData = {
        items: [
          {
            id: "001", // 🔹 Adicionado ID obrigatório para o item
            title: `Agendamento - ${servico}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: 50,
          },
        ],
        payer: { 
          name: nome, 
          phone: { number: telefone } 
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/sucesso?id=${id}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/falha`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/pendente`,
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook`,
      };

      const response = await preferenceInstance.create({ body: preferenceData });

      res.status(200).json({ init_point: response.id ? response.init_point : null });
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      res.status(500).json({ error: "Erro ao criar pagamento" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
