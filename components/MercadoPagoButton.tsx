"use client";

import { useEffect, useState } from "react";

export default function MercadoPagoButton() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Serviço de Beleza",
          price: 100, // Defina o valor correto
          paymentMethod: "credit",
        }),
      });

      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redireciona para o Mercado Pago
      } else {
        alert("Erro ao processar pagamento");
      }
    } catch (error) {
      console.error("Erro ao criar preferência de pagamento:", error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-4 py-2 bg-blue-500 text-white rounded-md"
    >
      {loading ? "Processando..." : "Pagar com Mercado Pago"}
    </button>
  );
}
