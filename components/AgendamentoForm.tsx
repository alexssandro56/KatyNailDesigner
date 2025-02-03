"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Certifique-se de importar o Firestore correto

const AgendamentoForm = () => {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [servico, setServico] = useState("");

  // Função para testar a conexão com Firestore
  const testarFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, "testes"), {
        nome: "Teste Firebase",
        telefone: "19999999999",
        data: "2025-02-03",
        hora: "10:00",
        servico: "Teste de Serviço",
        createdAt: new Date(),
      });
      console.log("🔥 Sucesso! Documento salvo com ID:", docRef.id);
    } catch (error) {
      console.error("🚨 Erro ao salvar no Firestore:", error);
    }
  };

  // Função para enviar o agendamento real
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !telefone || !data || !hora || !servico) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "agendamentos"), {
        nome,
        telefone,
        data,
        hora,
        servico,
        createdAt: new Date(),
      });

      console.log("✅ Agendamento criado com sucesso! ID:", docRef.id);
      alert("Agendamento realizado com sucesso!");

      // Limpar os campos após o envio
      setNome("");
      setTelefone("");
      setData("");
      setHora("");
      setServico("");
    } catch (error) {
      console.error("🚨 Erro ao criar agendamento:", error);
      alert("Erro ao realizar agendamento. Tente novamente.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Agendar Serviço</h2>

      {/* Formulário de Agendamento */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Digite seu nome"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Digite seu telefone"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Hora</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Serviço</label>
          <select
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Selecione um serviço</option>
            <optgroup label="Unhas">
              <option value="Gel na tips - R$120.00">Gel na tips - R$120.00</option>
              <option value="Manutenção gel - R$60.00">Manutenção gel - R$60.00</option>
              <option value="Banho de gel - R$100.00">Banho de gel - R$100.00</option>
              <option value="Manicure - R$35.00">Manicure - R$35.00</option>
              <option value="Pedicure - R$35.00">Pedicure - R$35.00</option>
              <option value="Combo Mani + Pedi - R$60.00">Combo Mani + Pedi - R$60.00</option>
            </optgroup>
            <optgroup label="Sobrancelhas">
              <option value="Designer com Henna - R$35.00">Designer com Henna - R$35.00</option>
              <option value="Designer Natural - R$25.00">Designer Natural - R$25.00</option>
            </optgroup>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Confirmar Agendamento
        </button>
      </form>

      {/* Botão para Testar Firestore */}
      <button
        onClick={testarFirestore}
        className="w-full mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Testar Conexão com Firestore
      </button>
    </div>
  );
};

export default AgendamentoForm;
