import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { createPreference } from "../utils/mercadoPago";

const Agendamento = () => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [servico, setServico] = useState("");

  const handleAgendamento = async () => {
    if (!nome || !telefone || !data || !horario || !servico) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      // Salvar agendamento no Firestore com status "pendente"
      const docRef = await addDoc(collection(db, "agendamentos"), {
        nome,
        telefone,
        data,
        horario,
        servico,
        status: "pendente",
        createdAt: new Date(),
      });

      // Criar pagamento no Mercado Pago
      const paymentUrl = await createPreference({
        id: docRef.id, // ID do agendamento no Firestore
        nome,
        telefone,
        data,
        horario,
        servico,
      });

      // Redirecionar para pagamento
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Erro ao processar agendamento. Tente novamente.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Agendamento</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <input
        type="tel"
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <input
        type="time"
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <select
        value={servico}
        onChange={(e) => setServico(e.target.value)}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      >
        <option value="">Selecione um serviço</option>
        <option value="Unha em Gel">Unha em Gel</option>
        <option value="Alongamento de Fibra">Alongamento de Fibra</option>
        <option value="Manicure Simples">Manicure Simples</option>
      </select>
      <button
        onClick={handleAgendamento}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Confirmar Agendamento
      </button>
    </div>
  );
};

export default Agendamento;
