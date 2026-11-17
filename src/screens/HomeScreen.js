import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { sair } from "../services/autenticacao";
import { adicionarMonitoria, observarMonitorias } from "../services/monitorias";

const coresMaterias = ["#e2f0e8", "#f7ead5", "#e5e7f8", "#dceefa", "#f4e3eb", "#e9efd9"];

const abas = [
  { id: "inicio", label: "Início", icon: "⌂" },
  { id: "monitorias", label: "Monitorias", icon: "▤" },
  { id: "calendario", label: "Calendário", icon: "□" },
  { id: "conta", label: "Conta", icon: "○" },
];

const saudacao = () => {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
};

const HomeScreen = ({ usuario }) => {
  const [abaAtiva, setAbaAtiva] = useState("inicio");
  const [saindo, setSaindo] = useState(false);
  const [monitorias, setMonitorias] = useState([]);
  const [carregandoMonitorias, setCarregandoMonitorias] = useState(true);
  const [erroMonitorias, setErroMonitorias] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [salvandoMonitoria, setSalvandoMonitoria] = useState(false);
  const [erroFormulario, setErroFormulario] = useState("");
  const [campos, setCampos] = useState({
    nome: "",
    dia: "",
    horario: "",
    sala: "",
    monitor: "",
    area: "",
  });
  const primeiroNome = usuario.displayName?.trim().split(" ")[0] ?? "estudante";
  const proximaOrdem =
    monitorias.reduce((maior, item) => Math.max(maior, item.ordem), 0) + 1;

  useEffect(() => {
    return observarMonitorias(
      (itens) => {
        setMonitorias(itens);
        setCarregandoMonitorias(false);
        setErroMonitorias(false);
      },
      (erro) => {
        console.log("Falha ao carregar monitorias do Firestore:", erro);
        setErroMonitorias(true);
        setCarregandoMonitorias(false);
      }
    );
  }, []);

  const aoSair = async () => {
    setSaindo(true);
    try {
      await sair();
    } catch (e) {
      console.log("Falha ao sair:", e);
      setSaindo(false);
    }
  };

  const renderConteudo = () => {
    if (abaAtiva === "conta") {
      return (
        <View style={styles.conta}>
          <Avatar usuario={usuario} grande />
          <Text style={styles.nomeConta}>{usuario.displayName ?? "Estudante"}</Text>
          <Text style={styles.emailConta}>{usuario.email}</Text>
          <Pressable style={styles.botaoSair} onPress={aoSair} disabled={saindo}>
            {saindo ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoSairTexto}>Sair da conta</Text>}
          </Pressable>
        </View>
      );
    }

    if (abaAtiva === "calendario") {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>□</Text>
          <Text style={styles.emptyTitle}>Seu calendário</Text>
          <Text style={styles.emptyText}>As monitorias da semana aparecerão aqui.</Text>
        </View>
      );
    }

    if (abaAtiva === "monitorias") {
      if (adicionando) {
        return (
          <FormularioMonitoria
            campos={campos}
            erro={erroFormulario}
            salvando={salvandoMonitoria}
            aoAlterar={(campo, valor) =>
              setCampos((atuais) => ({ ...atuais, [campo]: valor }))
            }
            aoCancelar={() => {
              setAdicionando(false);
              setErroFormulario("");
            }}
            aoSalvar={aoSalvarMonitoria}
          />
        );
      }

      return (
        <Monitorias
          itens={monitorias}
          carregando={carregandoMonitorias}
          erro={erroMonitorias}
          aoAdicionar={() => {
            setCampos({
              nome: "",
              dia: "",
              horario: "",
              sala: "",
              monitor: "",
              area: "",
            });
            setErroFormulario("");
            setAdicionando(true);
          }}
        />
      );
    }

    return (
      <>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{saudacao()}, {primeiroNome}!</Text>
            <Text style={styles.muted}>Confira suas monitorias disponíveis</Text>
          </View>
          <Avatar usuario={usuario} />
        </View>

        {carregandoMonitorias ? (
          <View style={styles.statusCard}>
            <ActivityIndicator color="#0d6b45" />
            <Text style={styles.statusText}>Carregando monitorias...</Text>
          </View>
        ) : erroMonitorias ? (
          <StatusVazio mensagem="Não foi possível carregar as monitorias. Verifique a conexão e as regras do Firestore." />
        ) : monitorias.length === 0 ? (
          <StatusVazio mensagem="Ainda não há monitorias cadastradas." />
        ) : (
          <>
            <View style={styles.nextCard}>
              <View style={styles.nextCardTop}>
                <Text style={styles.nextLabel}>MONITORIA EM DESTAQUE</Text>
                <Text style={styles.nextBadge}>Destaque</Text>
              </View>
              <Text style={styles.nextTitle}>{monitorias[0].nome}</Text>
              <View style={styles.nextDetails}>
                <Text style={styles.detail}>◷  {monitorias[0].dia}, {monitorias[0].horario}</Text>
                <Text style={styles.detail}>⌖  Sala {monitorias[0].sala}</Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Suas monitorias</Text>
              <Pressable onPress={() => setAbaAtiva("monitorias")}>
                <Text style={styles.seeAll}>Ver todas</Text>
              </Pressable>
            </View>
            {monitorias.slice(0, 2).map((item, index) => (
              <MonitoriaRow key={item.id} item={item} index={index} />
            ))}
          </>
        )}
      </>
    );
  };

  const aoSalvarMonitoria = async () => {
    const monitoria = Object.fromEntries(
      Object.entries(campos).map(([campo, valor]) => [campo, valor.trim()])
    );
    const campoObrigatorio = Object.entries(monitoria).find(([, valor]) => !valor);

    if (campoObrigatorio) {
      setErroFormulario("Preencha todos os campos para continuar.");
      return;
    }

    setSalvandoMonitoria(true);
    setErroFormulario("");
    try {
      await adicionarMonitoria({ ...monitoria, ordem: proximaOrdem });
      setAdicionando(false);
    } catch (erro) {
      console.log("Falha ao adicionar monitoria no Firestore:", erro);
      setErroFormulario(
        "Não foi possível salvar. Verifique a conexão e se as regras do Firestore permitem adicionar monitorias."
      );
    } finally {
      setSalvandoMonitoria(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderConteudo()}
      </ScrollView>
      <View style={styles.nav}>
        {abas.map((aba) => {
          const ativa = aba.id === abaAtiva;
          return (
            <Pressable key={aba.id} style={styles.navItem} onPress={() => setAbaAtiva(aba.id)}>
              <Text style={[styles.navIcon, ativa && styles.navIconActive]}>{aba.icon}</Text>
              <Text style={[styles.navLabel, ativa && styles.navLabelActive]}>{aba.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const Avatar = ({ usuario, grande = false }) => (
  usuario.photoURL ? (
    <Image style={[styles.avatar, grande && styles.avatarGrande]} source={{ uri: usuario.photoURL }} />
  ) : (
    <View style={[styles.avatar, styles.avatarFallback, grande && styles.avatarGrande]}>
      <Text style={[styles.avatarText, grande && styles.avatarTextGrande]}>
        {(usuario.displayName ?? "?").charAt(0).toUpperCase()}
      </Text>
    </View>
  )
);

const Monitorias = ({ itens, carregando, erro, aoAdicionar }) => (
  <>
    <View style={styles.monitoriasHeader}>
      <View>
        <Text style={styles.pageTitle}>Monitorias</Text>
        <Text style={styles.muted}>Suas monitorias disponíveis</Text>
      </View>
      <Pressable style={styles.addButton} onPress={aoAdicionar}>
        <Text style={styles.addButtonText}>+ Adicionar</Text>
      </Pressable>
    </View>
    {carregando ? (
      <View style={styles.statusCard}>
        <ActivityIndicator color="#0d6b45" />
        <Text style={styles.statusText}>Carregando monitorias...</Text>
      </View>
    ) : erro ? (
      <StatusVazio mensagem="Não foi possível carregar as monitorias. Verifique a conexão e as regras do Firestore." />
    ) : itens.length === 0 ? (
      <StatusVazio mensagem="Ainda não há monitorias cadastradas." />
    ) : (
      <View style={styles.list}>
        {itens.map((item, index) => <MonitoriaRow key={item.id} item={item} index={index} />)}
      </View>
    )}
  </>
);

const FormularioMonitoria = ({
  campos,
  erro,
  salvando,
  aoAlterar,
  aoCancelar,
  aoSalvar,
}) => {
  const entradas = [
    { chave: "nome", titulo: "Disciplina", exemplo: "Ex.: Cálculo I" },
    { chave: "dia", titulo: "Dia da semana", exemplo: "Ex.: Quarta-feira" },
    { chave: "horario", titulo: "Horário", exemplo: "Ex.: 19:40" },
    { chave: "sala", titulo: "Sala", exemplo: "Ex.: B205" },
    { chave: "monitor", titulo: "Monitor", exemplo: "Nome do monitor" },
    { chave: "area", titulo: "Área", exemplo: "Ex.: Matemática" },
  ];

  return (
    <View>
      <Pressable style={styles.backButton} onPress={aoCancelar} disabled={salvando}>
        <Text style={styles.backButtonText}>‹  Voltar para monitorias</Text>
      </Pressable>
      <Text style={styles.pageTitle}>Nova monitoria</Text>
      <Text style={[styles.muted, styles.formSubtitle]}>
        Preencha os dados para adicionar à lista.
      </Text>

      {entradas.map((entrada) => (
        <View key={entrada.chave} style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{entrada.titulo}</Text>
          <TextInput
            accessibilityLabel={entrada.titulo}
            autoCapitalize="words"
            editable={!salvando}
            onChangeText={(valor) => aoAlterar(entrada.chave, valor)}
            placeholder={entrada.exemplo}
            placeholderTextColor="#9aaba2"
            style={styles.textInput}
            value={campos[entrada.chave]}
          />
        </View>
      ))}

      {erro ? <Text style={styles.formError}>{erro}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.saveButton, salvando && styles.saveButtonDisabled]}
        onPress={aoSalvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Adicionar monitoria</Text>
        )}
      </Pressable>
    </View>
  );
};

const StatusVazio = ({ mensagem }) => (
  <View style={styles.statusCard}>
    <Text style={styles.statusText}>{mensagem}</Text>
  </View>
);

const MonitoriaRow = ({ item, index }) => (
  <View style={styles.monitoriaRow}>
    <View style={[styles.subjectIcon, { backgroundColor: coresMaterias[index % coresMaterias.length] }]}>
      <Text style={styles.subjectIconText}>{item.nome.charAt(0)}</Text>
    </View>
    <View style={styles.monitoriaInfo}>
      <Text style={styles.monitoriaName}>{item.nome}</Text>
      <Text style={styles.monitoriaMeta}>{item.dia} · {item.horario} · Sala {item.sala}</Text>
      <Text style={styles.monitoriaMonitor}>Monitor: {item.monitor} ({item.area})</Text>
    </View>
  </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7faf8" },
  content: { padding: 24, paddingBottom: 30 },
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 26 },
  greeting: { color: "#12352a", fontSize: 24, fontWeight: "800", marginBottom: 5 },
  muted: { color: "#789087", fontSize: 14 },
  avatar: { width: 48, height: 48, borderRadius: 16 },
  avatarGrande: { width: 88, height: 88, borderRadius: 30 },
  avatarFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#d9eee2" },
  avatarText: { color: "#0d6b45", fontSize: 20, fontWeight: "800" },
  avatarTextGrande: { fontSize: 36 },
  nextCard: { backgroundColor: "#0d6b45", borderRadius: 22, padding: 21, marginBottom: 29, shadowColor: "#0d6b45", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  nextCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nextLabel: { color: "#bce7cf", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  nextBadge: { color: "#0d6b45", backgroundColor: "#d7f1e1", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "700" },
  nextTitle: { color: "#fff", fontSize: 21, fontWeight: "800", marginTop: 22, marginBottom: 17 },
  nextDetails: { flexDirection: "row", justifyContent: "space-between" },
  detail: { color: "#d7f1e1", fontSize: 13 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sectionTitle: { color: "#12352a", fontSize: 19, fontWeight: "800" },
  seeAll: { color: "#0d6b45", fontSize: 13, fontWeight: "700" },
  monitoriaRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 15, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: "#edf2ee" },
  subjectIcon: { width: 46, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 13 },
  subjectIconText: { color: "#315545", fontSize: 20, fontWeight: "800" },
  monitoriaInfo: { flex: 1 },
  monitoriaName: { color: "#183a2d", fontSize: 16, fontWeight: "800", marginBottom: 4 },
  monitoriaMeta: { color: "#637b70", fontSize: 12, marginBottom: 5 },
  monitoriaMonitor: { color: "#96a79f", fontSize: 11 },
  nav: { flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#edf2ee", paddingTop: 10, paddingBottom: 8 },
  navItem: { flex: 1, alignItems: "center" },
  navIcon: { color: "#9aaba2", fontSize: 22, height: 27 },
  navIconActive: { color: "#0d6b45" },
  navLabel: { color: "#9aaba2", fontSize: 11, marginTop: 3 },
  navLabelActive: { color: "#0d6b45", fontWeight: "800" },
  pageTitle: { color: "#12352a", fontSize: 30, fontWeight: "800", marginTop: 10, marginBottom: 6 },
  list: { marginTop: 26 },
  conta: { alignItems: "center", paddingTop: 44 },
  nomeConta: { color: "#12352a", fontSize: 22, fontWeight: "800", marginTop: 18 },
  emailConta: { color: "#789087", fontSize: 14, marginTop: 5 },
  botaoSair: { backgroundColor: "#0d6b45", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 35, marginTop: 34 },
  botaoSairTexto: { color: "#fff", fontWeight: "800", fontSize: 15 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 180 },
  emptyIcon: { color: "#0d6b45", fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: "#12352a", fontSize: 21, fontWeight: "800", marginBottom: 8 },
  emptyText: { color: "#789087", textAlign: "center", fontSize: 14 },
  statusCard: { alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#edf2ee", padding: 22, marginTop: 24 },
  statusText: { color: "#789087", fontSize: 13, textAlign: "center", lineHeight: 20 },
  monitoriasHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  addButton: { backgroundColor: "#0d6b45", paddingHorizontal: 15, paddingVertical: 11, borderRadius: 13, marginTop: 8 },
  addButtonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  backButton: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 10 },
  backButtonText: { color: "#0d6b45", fontSize: 14, fontWeight: "700" },
  formSubtitle: { marginBottom: 22 },
  inputGroup: { marginBottom: 15 },
  inputLabel: { color: "#315545", fontSize: 13, fontWeight: "700", marginBottom: 7 },
  textInput: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dce7e0", borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, color: "#183a2d", fontSize: 15 },
  formError: { color: "#b42318", fontSize: 13, lineHeight: 19, marginBottom: 14 },
  saveButton: { alignItems: "center", justifyContent: "center", backgroundColor: "#0d6b45", minHeight: 50, borderRadius: 14, marginTop: 8, marginBottom: 20 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
