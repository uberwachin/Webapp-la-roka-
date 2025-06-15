import { useState } from "react";
import { config } from "./configuracion_app";

const menu = {
  pizzas: ["Margarita", "Fugazzeta", "Napolitana", "Cuatro Quesos"],
  empanadas: ["Carne", "Jamón y Queso", "Humita", "Pollo"]
};

const precios = {
  pizzas: {
    Margarita: 24000,
    Fugazzeta: 25000,
    Napolitana: 23000,
    "Cuatro Quesos": 25000
  },
  pizzasChicas: {
    Margarita: 16000,
    Fugazzeta: 17000,
    Napolitana: 15000,
    "Cuatro Quesos": 17000
  },
  empanadas: {
    Carne: 1200,
    "Jamón y Queso": 1200,
    Humita: 1200,
    Pollo: 1200
  }
};

export default function PedidoApp() {
  const ahora = new Date();
  const [horaA, minA] = config.horaApertura.split(":").map(Number);
  const [horaC, minC] = config.horaCierre.split(":").map(Number);
  const horaApertura = new Date();
  horaApertura.setHours(horaA, minA, 0);
  const horaCierre = new Date();
  horaCierre.setHours(horaC, minC, 0);
  const cerrado = ahora < horaApertura || ahora > horaCierre;

  const [pedido, setPedido] = useState({ pizzasChicas: {}, pizzasGrandes: [], empanadas: {} });
  const [mitades, setMitades] = useState({ izq: "", der: "" });
  const [modoEntrega, setModoEntrega] = useState("retiro");
  const [datoEntrega, setDatoEntrega] = useState("");

  const handleAddChica = (item) => {
    setPedido((prev) => ({
      ...prev,
      pizzasChicas: {
        ...prev.pizzasChicas,
        [item]: (prev.pizzasChicas[item] || 0) + 1
      }
    }));
  };

  const handleAddGrande = () => {
    if (mitades.izq && mitades.der) {
      setPedido((prev) => ({
        ...prev,
        pizzasGrandes: [...prev.pizzasGrandes, { mitad1: mitades.izq, mitad2: mitades.der }]
      }));
      setMitades({ izq: "", der: "" });
    }
  };

  const handleAddEmpanada = (item) => {
    setPedido((prev) => ({
      ...prev,
      empanadas: {
        ...prev.empanadas,
        [item]: (prev.empanadas[item] || 0) + 1
      }
    }));
  };

  const calcularPrecioGrande = (p1, p2) => {
    const precio1 = precios.pizzas[p1] || 0;
    const precio2 = precios.pizzas[p2] || 0;
    return Math.round((precio1 + precio2) / 2);
  };

  const calcularTotal = () => {
    let total = 0;
    Object.entries(pedido.pizzasChicas).forEach(([p, c]) => {
      total += (precios.pizzasChicas[p] || 0) * c;
    });
    pedido.pizzasGrandes.forEach(({ mitad1, mitad2 }) => {
      total += calcularPrecioGrande(mitad1, mitad2);
    });
    Object.entries(pedido.empanadas).forEach(([e, c]) => {
      total += (precios.empanadas[e] || 0) * c;
    });
    return total;
  };

  const total = calcularTotal();
  const totalEfectivo = Math.round(total * 0.9);

  const generarMensaje = () => {
    const lineas = [];
    Object.entries(pedido.pizzasChicas).forEach(([nombre, cantidad]) => {
      lineas.push(`${cantidad} x Pizza chica de ${nombre}`);
    });
    pedido.pizzasGrandes.forEach(({ mitad1, mitad2 }) => {
      lineas.push(`1 x Pizza grande mitad ${mitad1} y mitad ${mitad2}`);
    });
    Object.entries(pedido.empanadas).forEach(([nombre, cantidad]) => {
      lineas.push(`${cantidad} x Empanada de ${nombre}`);
    });
    if (modoEntrega === "domicilio") {
      lineas.push(`\\nEnviar a domicilio: ${datoEntrega}`);
    } else {
      lineas.push(`\\nRetiro en el local a nombre de: ${datoEntrega}`);
    }
    lineas.push(`\\nTotal (tarjeta): $${total.toLocaleString()}`);
    lineas.push(`Total (efectivo -10%): $${totalEfectivo.toLocaleString()}`);
    return `Hola! Quiero hacer un pedido:\\n${lineas.join("\\n")}`;
  };

  const mensajeWhatsApp = encodeURIComponent(generarMensaje());
  const linkWhatsApp = `https://wa.me/5491123456789?text=${mensajeWhatsApp}`;
  const vistaPrevia = generarMensaje().split("\\n").slice(1);

  if (cerrado) {
    const mensaje = ahora < horaApertura
      ? `🚫 Aún no abrimos. Nuestro horario es de ${config.horaApertura} a ${config.horaCierre}.`
      : "🚫 Ya cerramos por hoy. Volvé mañana para hacer tu pedido 😊";

    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-[#fffef6] shadow-md rounded-md mt-20 border border-[#c62828]">
        <h1 className="text-4xl font-serif text-[#c62828]">Pizzería La Roka</h1>
        <p className="mt-6 text-lg text-[#2e2e2e] font-medium">{mensaje}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-[#fffdf8] shadow-md border border-[#c62828] rounded-md space-y-6">
      <h1 className="text-4xl font-serif text-center text-[#c62828]">🍕 La Roka - Menú</h1>
      <p className="text-center text-base text-[#2e2e2e] font-medium italic">
        💵 Pagando en efectivo tenés 10% de descuento
      </p>

      <div className="bg-[#fff8f0] p-4 rounded shadow text-sm">
        <h2 className="font-bold mb-2">Tu pedido</h2>
        <ul className="list-disc list-inside">
          {vistaPrevia.map((linea, i) => <li key={i}>{linea}</li>)}
        </ul>
      </div>

      <div className="text-center text-sm text-gray-700">
        <p>Total (tarjeta): <strong>${total.toLocaleString()}</strong></p>
        <p>Total (efectivo -10%): <strong>${totalEfectivo.toLocaleString()}</strong></p>
      </div>

      <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer">
        <button className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded">Enviar pedido por WhatsApp</button>
      </a>
    </div>
  );
}