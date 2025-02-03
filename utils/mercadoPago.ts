export const createPreference = async (agendamento: any) => {
  const res = await fetch("/api/mercado-pago", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agendamento),
  });

  const data = await res.json();
  return data.init_point;
};
