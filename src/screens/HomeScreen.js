import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { sair } from "../services/autenticacao";

const monitorias = [
  { nome: "Cálculo I", dia: "Quarta-feira", horario: "19:40", sala: "B205", cor: "#e2f0e8" },
  { nome: "Álgebra Linear", dia: "Terça-feira", horario: "19:40", sala: "B287", cor: "#f7ead5" },
  { nome: "Geometria Analítica", dia: "Sexta-feira", horario: "19:40", sala: "B205", cor: "#e5e7f8" },
];

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
  const primeiroNome = usuario.displayName?.trim().split(" ")[0] ?? "estudante";

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
      return <Monitorias />;
    }

    return (
      <>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>{saudacao()}, {primeiroNome}!</Text>
            <Text style={styles.muted}>Confira sua próxima monitoria</Text>
          </View>
          <Avatar usuario={usuario} />
        </View>

        <View style={styles.nextCard}>
          <View style={styles.nextCardTop}>
            <Text style={styles.nextLabel}>PRÓXIMA MONITORIA</Text>
            <Text style={styles.nextBadge}>Hoje</Text>
          </View>
          <Text style={styles.nextTitle}>Monitor de Matemática</Text>
          <View style={styles.nextDetails}>
            <Text style={styles.detail}>◷  Terça-feira, 19:40</Text>
            <Text style={styles.detail}>⌖  Sala B205</Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Suas monitorias</Text>
          <Pressable onPress={() => setAbaAtiva("monitorias")}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </Pressable>
        </View>
        {monitorias.slice(0, 2).map((item) => <MonitoriaRow key={item.nome} item={item} />)}
      </>
    );
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

const Monitorias = () => (
  <>
    <Text style={styles.pageTitle}>Monitorias</Text>
    <Text style={styles.muted}>Suas monitorias disponíveis</Text>
    <View style={styles.list}>{monitorias.map((item) => <MonitoriaRow key={item.nome} item={item} />)}</View>
  </>
);

const MonitoriaRow = ({ item }) => (
  <View style={styles.monitoriaRow}>
    <View style={[styles.subjectIcon, { backgroundColor: item.cor }]}>
      <Text style={styles.subjectIconText}>{item.nome.charAt(0)}</Text>
    </View>
    <View style={styles.monitoriaInfo}>
      <Text style={styles.monitoriaName}>{item.nome}</Text>
      <Text style={styles.monitoriaMeta}>{item.dia} · {item.horario} · Sala {item.sala}</Text>
      <Text style={styles.monitoriaMonitor}>Monitor: Rogerio (Matemática)</Text>
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
});
