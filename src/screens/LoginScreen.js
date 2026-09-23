/**
 * src/screens/LoginScreen.js
 * ---------------------------------------------------------------------------
 * Tela de login.
 *
 * Observe o que ela NÃO faz:
 *   - não conhece o Firebase;
 *   - não recebe uma prop para "avisar" quem entrou.
 * Ela apenas dispara o login e cuida do próprio estado visual (carregando e
 * mensagem de erro). Quando o login dá certo, o observador em App.js troca a
 * tela sozinho.
 * ---------------------------------------------------------------------------
 */
import { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";

import { entrarComGoogle, descreverErro } from "../services/autenticacao";

const LoginScreen = () => {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const aoPressionar = async () => {
    setErro(null);
    setCarregando(true);

    try {
      await entrarComGoogle();
      // Se deu certo, não fazemos nada aqui: o onAuthStateChanged assume.
      // Se o usuário cancelou, também não fazemos nada -- ele continua na tela.
    } catch (e) {
      console.log("Falha no login:", e);
      setErro(descreverErro(e));
    } finally {
      // O finally garante que o indicador SEMPRE é desligado, tenha o login
      // dado certo, falhado ou sido cancelado. Esquecer isto é o motivo mais
      // comum de um botão que "trava" carregando para sempre.
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkText}>M</Text>
      </View>
      <Text style={styles.titulo}>Monitorizador</Text>
      <Text style={styles.subtitulo}>Acompanhe suas monitorias no IFTM</Text>

      {/*
        GoogleSigninButton é o botão oficial. Além de pronto, ele atende às
        diretrizes de marca do Google, exigidas para publicar na loja.
        O disabled evita o erro IN_PROGRESS por toque duplo.
      */}
      <GoogleSigninButton
        style={styles.botaoGoogle}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={aoPressionar}
        disabled={carregando}
      />

      <Text style={styles.dominios}>
        Entre com seu e-mail institucional{"\n"}
        @estudante.iftm.edu.br ou @iftm.edu.br
      </Text>

      {/* Área reservada com altura fixa: evita a tela "pular" ao aparecer. */}
      <View style={styles.areaAviso}>
        {carregando && <ActivityIndicator />}
        {erro && <Text style={styles.erro}>{erro}</Text>}
        </View>
      </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f8f6",
    padding: 28,
  },
  brandMark: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#0d6b45",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#0d6b45",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  brandMarkText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "800",
  },
  titulo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#12352a",
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: "#587068",
    marginBottom: 30,
    textAlign: "center",
  },
  botaoGoogle: {
    width: 240,
    height: 48,
  },
  areaAviso: {
    height: 58,
    justifyContent: "center",
  },
  erro: {
    color: "#c62828",
    textAlign: "center",
    marginTop: 8,
  },
  dominios: {
    color: "#789087",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
  },
});
