import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../firebaseConfig";

export function observarMonitorias(aoAtualizar, aoFalhar) {
  const consulta = query(collection(db, "monitorias"), orderBy("ordem", "asc"));

  return onSnapshot(
    consulta,
    (snapshot) => {
      const itens = snapshot.docs.map((documento) => ({
        ...documento.data(),
        id: documento.id,
      }));
      const invalido = itens.find((item) =>
        ["nome", "dia", "horario", "sala", "monitor", "area"].some(
          (campo) => typeof item[campo] !== "string"
        ) ||
        typeof item.ordem !== "number" ||
        !Number.isFinite(item.ordem)
      );

      if (invalido) {
        aoFalhar(
          new Error(
            `O documento "${invalido.id}" está incompleto ou possui tipos de campo inválidos.`
          )
        );
        return;
      }

      aoAtualizar(itens);
    },
    aoFalhar
  );
}

export function adicionarMonitoria(monitoria) {
  return addDoc(collection(db, "monitorias"), monitoria);
}
