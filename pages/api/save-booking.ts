import { NextApiRequest, NextApiResponse } from "next";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { nome, telefone, data, horario, servico } = req.body;

      if (!nome || !telefone || !data || !horario || !servico) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
      }

      const docRef = await addDoc(collection(db, "agendamentos"), {
        nome,
        telefone,
        data,
        horario,
        servico,
        status: "pendente",
        createdAt: new Date(),
      });

      res.status(200).json({ id: docRef.id, message: "Agendamento salvo com sucesso!" });
    } catch (error) {
      console.error("❌ Erro ao salvar agendamento:", error);
      res.status(500).json({ error: "Erro ao salvar no Firestore" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
