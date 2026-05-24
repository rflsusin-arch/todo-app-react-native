import React, { useState } from "react"; //import react e usestate
import { 
  View, // igual uma div no html
  Text, //texto na tela 
  StyleSheet, //estilos
  ScrollView, //pra poder rolar a tela
  TextInput,  //texto pro usuario digitar
  Modal, //janela que sobrepõe
  Pressable, //pra detectar os toques na tela
  KeyboardAvoidingView, //ajusta o teclado quando ele aparece
  Platform, //pra saber se o app esta  rodando em android ou IOS
  Keyboard, //controle do teclado, usado pra fechar
  LogBox, //gerenciador de avisos do console no desenvolvimento
} from "react-native"; //componentes do React Native
import { StatusBar } from "expo-status-bar"; //controle da barra do topo da tela
import Checkbox from "expo-checkbox"; //checkbox nativo da expo
import { MaterialIcons } from "@expo/vector-icons"; //icones "+" do FAB
import EmojiPicker from "react-native-emoji-chooser"; //seletor de emojis

//Suprime aviso interno da lib de emojis (FlatList em ScrollView)
//seria muito pesado carregar todos de uma vez com ScrollView
//Por isso a biblioteca usa FlatList internamente para mostrar só os emojis visíveis
//e carregar os outros conforme você rola, isso gera um aviso interno já esperado
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

// DADOS INICIAIS DE EXEMPLO
//essa lista ja vai existir quando abrir o app pela primeira vez
const TAREFAS_INICIAIS = [ //valor fixo, 5 propriedades
  //id: identificador único | text: nome | emoji: ícone | category: categoria | done: concluída?
  //done: true, faz esta tarefa aparecer na seção "Realizadas"
  { id: 1, text: "Estudar React", emoji: "📱", category: "Estudo", done: false },
  { id: 2, text: "Atividade Fisica", emoji: "🏋️", category: "Saúde", done: false },
  { id: 3, text: "Ler um livro", emoji: "📚", category: "Lazer", done: true },
];

// FUNÇÃO: formata a data atual em português
// Exemplo de saída: "20 de maio de 2026"
function formatarDataAtual() {
  //Cria um objeto com dat e hora do dispositivo
  //formata em português
  return new Date().toLocaleDateString("pt-BR", {
    day: "numeric", //numero
    month: "long", //mês por extenso
    year: "numeric", 
  });
}

//COMPONENTE PRINCIPAL carrega ao iniciar
export default function App() {
  //Estado das tarefas
  //Lista de todas as tarefas começa com as tarefas iniciais de exemplo
  const [tasks, setTasks] = useState(TAREFAS_INICIAIS);

  //Estados do modal
  const [modalVisivel, setModalVisivel] = useState(false); //visivel ou não
  const [novaTarefa, setNovaTarefa] = useState(""); //começa vazio
  const [categoria, setCategoria] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("😀"); //emoji padrão
  const [emojiPickerAberto, setEmojiPickerAberto] = useState(false);

  //Contadores calculados a partir do estado das tarefas
  //.filter() retorna um novo array com o que passa na condição
  const totalIncompletas = tasks.filter((t) => !t.done).length; //done false
  const totalRealizadas = tasks.filter((t) => t.done).length; //done true

  //Listas separadas, arrays usado pra renderizar as listas mesma lógica
  const tarefasIncompletas = tasks.filter((t) => !t.done);
  const tarefasRealizadas = tasks.filter((t) => t.done);

  //FUNÇÃO: fecharModal
  //Fechar modal fecha primeiro o teclado
  function fecharModal() {
    Keyboard.dismiss(); // a principio evita bug de layout no Android
    setModalVisivel(false); //fecha modal
    setEmojiPickerAberto(false); //fecha emoji, quando abre modal novamente esta fechado
  }

  //FUNÇÃO: alternarTarefa
  //Muda uma tarefa de "pendente" para "realizada" ou ao contrario
  function alternarTarefa(id) {
    //recebe o estado atual
    setTasks((prev) => 
      //.map percorre as tarefas
      //=== compara até ser o id da tarefa clicada
      //cria uma copia com done invertido
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  //FUNÇÃO: adicionarTarefa
  //Cria uma nova tarefa com os dados preenchidos
  function adicionarTarefa() {
    //depois do trim remover espaços no inicio e fim, não adiciona se vazio
    if (!novaTarefa.trim()) return; 
    // Adiciona nova tarefa mantendo todas as anteriores
    setTasks((prev) => [
      ...prev, //// ...prev copia todas as tarefas existentes
      {
        id: Date.now(), // retorna id único por tempo
        text: novaTarefa.trim(), //nome sem espaços desnecessários
        category: categoria.trim() || "Geral", // Usa "Geral" se categoria vazia
        emoji: selectedEmoji, // Emoji escolhido
        done: false, // Toda tarefa começa pendente
      },
    ]);

    // Reseta estado
    setNovaTarefa("");
    setCategoria("");
    setSelectedEmoji("😀");
    setEmojiPickerAberto(false);
    setModalVisivel(false);
  }

  //Interface visual do app -------------------------------------------------------
  //Tudo abaixo é JSX sintaxe parecida com HTML que o React transforma
  //em componentes nativos do Android/iOS
  return (
    <View style={styles.container}>
      <StatusBar style="dark"/> 
      {/*CABEÇALHO Parte roxa com data título e contadores*/}
      <View style={styles.header}>
        <Text style={styles.dataTexto}>{formatarDataAtual()}</Text>
        <Text style={styles.titulo}>Minhas Tarefas</Text>

        {/*Linha com dois contadores lado a lado*/}
        <View style={styles.contadoresRow}>
          {/*Exibe o numero e label a palavra em baixo do numero*/}
          <View style={styles.contador}>
            <Text style={styles.contadorNumero}>{totalIncompletas}</Text>
            <Text style={styles.contadorLabel}>pendentes</Text>
          </View>
          {/* Linha vertical separando os dois contadores */}
          {/*Exibe o numero e label a palavra em baixo do numero*/}
          {/*Cor verde no numero*/}
          <View style={styles.separador}/>
          <View style={styles.contador}>
            <Text style={[styles.contadorNumero, { color: "#4CAF50" }]}>{totalRealizadas}</Text>
            <Text style={styles.contadorLabel}>realizadas</Text>
          </View>
        </View>
      </View>

      {/*LISTA DE TAREFAS ScrollView permite rolar quando tem muitas tarefas */}
      {/*Scroll faz a janela ocupar todo o espaço abaixo do cabeçalho flex: 1 */}
      {/*ScrollContent adiciona espaço entre as tarefas padding: 20 */}
      <ScrollView
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* titulo seção Pendentes */}
        {/* Checkbox */}
        {/* Emoji */}
        {/* Nome e categoria */}
        <Text style={styles.secaoTitulo}>Pendentes</Text>
        {tarefasIncompletas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma tarefa pendente</Text>
        ) : (
          tarefasIncompletas.map((tarefa) => (
            <View key={tarefa.id} style={styles.tarefaCard}>
              <Checkbox
                value={tarefa.done}
                onValueChange={() => alternarTarefa(tarefa.id)}
                color={tarefa.done ? "#515CC6" : undefined}
                style={styles.checkbox}
              />
              <Text style={styles.tarefaEmoji}>{tarefa.emoji}</Text>
              <View style={styles.tarefaInfo}>
                <Text style={styles.tarefaNome}>{tarefa.text}</Text>
                <Text style={styles.tarefaCategoria}>{tarefa.category}</Text>
              </View>
            </View>
          ))
        )}

        {/* Seção: Realizadas */}
        {/* Checkbox */}
        {/* Nome riscado (tarefa concluída)*/}
        <Text style={[styles.secaoTitulo, { marginTop: 24 }]}>Realizadas</Text>
        {tarefasRealizadas.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma tarefa realizada ainda</Text>
        ) : (
          tarefasRealizadas.map((tarefa) => (
            <View key={tarefa.id} style={[styles.tarefaCard, styles.tarefaFeita]}>
              <Checkbox
                value={tarefa.done}
                onValueChange={() => alternarTarefa(tarefa.id)}
                color="#515CC6"
                style={styles.checkbox}
              />
              <Text style={styles.tarefaEmoji}>{tarefa.emoji}</Text>
              <View style={styles.tarefaInfo}>
                <Text style={[styles.tarefaNome, styles.tarefaNomeRiscado]}>
                  {tarefa.text}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Espaço no final para o botão + não cobrir a última */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/*FAB Floating Action Button botão flutuante para adicionar tarefa */}
      <Pressable style={styles.fab} onPress={() => setModalVisivel(true)}>
        <MaterialIcons name="add" size={38} color="#fff" />
      </Pressable>

      {/*MODAL adicionar nova tarefa*/}
      {/* de baixo para cima*/}
      {/* fundo semitransparente*/}
      {/* botão voltar Android*/}
      <Modal
        visible={modalVisivel}
        animationType="slide"   
        transparent={true}      
        onRequestClose={fecharModal} 
      >
        {/*KeyboardAvoidingView empurra o conteúdo para cima quando o teclado abre */}
        {/*behavior: comportamento diferente por plataforma */}
        {/*iOS: "padding" adiciona padding extra embaixo */}
        {/*Android: "height" reduz a altura do componente */}
        {/*flex: 1 obrigatório evita bug de compressão ao fechar com teclado aberto */}
        {/*justifyContent: "flex-end" empurra tudo para baixo (efeito bottom sheet) */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          {/* Overlay escuro cobre o fundo atrás do formulario de adicionar */}
          {/* onPress: tocar no fundo escuro fecha o modal */}
          {/* stopPropagation evita que toques dentro fechem o modal*/}
          <Pressable style={styles.modalOverlay} onPress={fecharModal}>
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {/*Formulário*/}
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.modalTitulo}>Tarefa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da tarefa"
                  placeholderTextColor="#aaa"
                  value={novaTarefa}
                  onChangeText={setNovaTarefa}
                />
              </View>
              {/* Linha com campos Emoji e Categoria*/}
              {/*  flexDirection: "row" organiza na horizontal (padrão do React Native é coluna)*/}
              {/* gap: 8 adiciona 8px de espaço entre os elementos filhos*/}
              <View style={{ flexDirection: "row", gap: 8}}>
                <View style={{ width: 64, alignItems: "center" }}>
                  <Text style={styles.modalTitulo}>Emoji</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitulo}>Categoria</Text>
                </View>
              </View>

              {/* Campos */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* Coluna do emoji largura fixa */}
                <View style={styles.emojiCol}>
                  <Pressable
                    style={styles.btnEmoji}
                    onPress={() => setEmojiPickerAberto((p) => !p)}
                  >
                    <Text style={{ fontSize: 28 }}>{selectedEmoji}</Text>
                  </Pressable>
                </View>

                {/* Coluna da categoria flex: 1 (ocupa o resto) */}
                <View style={styles.categoriaCol}>
                  <TextInput
                    style={styles.input}
                    placeholder="Categoria (ex: Estudo)"
                    placeholderTextColor="#aaa"
                    value={categoria}
                    onChangeText={setCategoria}
                  />
                </View>
              </View>

              {/* Picker de emoji renderizado quando emojiPickerAberto é true*/}
              {/* && forma curta de condição em JSX*/}
              {/* View com height FIXO obrigatório para funcionar*/}
              {/* Sem isso o scroll interno não funciona e o picker empurra o botão para fora da tela*/}
              {/* overflow: "hidden" impede o conteúdo de vazar visualmente*/}
              {/* atualiza emoji*/}
              {/* fecha ao selecionar*/}
              {/* não tem pt-BR disponível na lib*/}
              {/* Quantidade de emojis por linha*/}
              {emojiPickerAberto && (
                <View style={{ height: 500, overflow: "hidden", borderRadius: 10 }}>
                  <EmojiPicker
                    onSelect={(emoji) => {
                      setSelectedEmoji(emoji);      
                      setEmojiPickerAberto(false);  
                    }}
                    mode="light"
                    lang="en"   
                    columnCount={8} 
                  />
                </View>
              )}
              {/*Botão Criar fixo flexShrink: 0 garante que não suma da tela mesmo com o picker aberto*/}
              <Pressable style={styles.btnCriar} onPress={adicionarTarefa}>
                <Text style={styles.btnCriarTexto}>Criar</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

//ESTILOS
//StyleSheet.create() organiza e valida todos os estilos em um único objeto
//cada chave é um nome de estilo usado como style={styles.nomeDoEstilo}
const styles = StyleSheet.create({
  //Tela principal 
  container: {
    flex: 1, // Ocupa toda a área disponível da tela
    backgroundColor: "#f3f1fb", // Cor de fundo geral azul bem claro destaca as tarefas
  },

  //Cabeçalho
  header: {
    backgroundColor: "#515CC6", // Fundo roxo
    paddingTop: 60, // espaço do topo (evita sobreposição com status bar)
    paddingBottom: 24, // espaço embaixo
    paddingHorizontal: 24, // espaço dos lados
    borderBottomLeftRadius: 24, // arredonda o canto inferior esquerdo
    borderBottomRightRadius: 24, // arredonda o canto inferior direito
  },
  dataTexto: {
    color: "rgba(255,255,255,0.75)", // branco com 75% de opacidade
    fontSize: 13,  // tamanho 
    marginBottom: 4,  // separação antes do título
  },
  titulo: {
    color: "#fff",
    fontSize: 28, 
    fontWeight: "700", // Negrito forte
    marginBottom: 16, // separação antes dos contadores
  },
  contadoresRow: {
    flexDirection: "row", //lado a lado
    alignItems: "center", //alinhamento vertical
  },
  contador: {
    alignItems: "center", //alinhamento horizontal
    paddingHorizontal: 20,
  },
  contadorNumero: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  contadorLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
  },
  separador: {
    width: 2, //linha fina
    height: 42, //altura da linha
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  // ScrollView
  scroll: {
    flex: 1, //ocupa todo o espaço abaixo do cabeçalho
  },
  scrollContent: {
    padding: 20, //espaço interno dos lados
  },

  //Seções
  secaoTitulo: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase", //letras maiúsculas
    letterSpacing: 1, //espaço extra entre as letras
    marginBottom: 10,
  },
  vazio: {
    color: "#aaa",
    fontSize: 14,
    fontStyle: "italic", //itálico
    marginBottom: 8,
  },

  //Cartões de tarefa 
  tarefaCard: {
    flexDirection: "row", // Checkbox, emoji e texto lado a lado
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14, //cantos arredondados
    padding: 14,
    marginBottom: 10,
    //sombra no iOS:
    shadowColor: "#000", 
    shadowOpacity: 0.06,  // 6% de opacidade
    shadowRadius: 6, //espalhamento da sombra
    shadowOffset: { width: 0, height: 2 }, // 2px para baixo
    // Sombra no Android (substitui todas as propriedades shadow* acima)
    elevation: 2,
  },
  tarefaFeita: {
    opacity: 0.6, // 60% de opacidade mais apagado
  },
  checkbox: {
    marginRight: 12,  //espaço entre checkbox e emoji
    borderRadius: 6, //arredondado
  },
  tarefaEmoji: {
    fontSize: 24, //tamanho do emoji
    marginRight: 10,
  },
  tarefaInfo: {
    flex: 1, //ocupa o espaço lateral restante
  },
  tarefaNome: {
    fontSize: 15,
    fontWeight: "500", //negrito mais fraco
    color: "#222", //preto mais fraco
  },
  tarefaNomeRiscado: {
    textDecorationLine: "line-through", //nome riscado
    color: "#999", 
  },
  tarefaCategoria: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  //FAB
  fab: {
    position: "absolute", //flutua sobre tudoi
    bottom: 32, //posição
    right: 24, //posiçao
    width: 60, //largura circulo
    height: 60, //altura circulo
    borderRadius: 30, //metade da largura/altura = círculo perfeito
    backgroundColor: "#515CC6", //mesma cor do cabeçalho
    alignItems: "center", //centraliza icone
    justifyContent: "center", //centraliza icone
    shadowColor: "#515CC6", //cor da sombra IOS
    shadowOpacity: 0.4, //IOS
    shadowRadius: 10, //IOS
    shadowOffset: { width: 0, height: 4 }, //IOS
    elevation: 8, //Sombra Android
  },

  //Modal, escuro do fundo
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)", 
    justifyContent: "flex-end", //embaixo da tela
  },
  //cartão do formulário
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24, // Arredonda apenas os cantos superiores
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  //Titulo
  modalTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
  },

  //Formulário do modal
  modalForm: {
    flexShrink: 1, // comprime quando o picker abre, mas nunca some
    gap: 12,
    marginBottom: 16,
  },
  // Campo de texto (usado tanto no nome quanto na categoria)
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },
  emojiCol: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEmoji: {
    width: 56,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
  },
  categoriaCol: {
    flex: 1,
  },

  // ── Botão Criar ──────────────────────────────
  btnCriar: {
    flexShrink: 0, // NUNCA some, mesmo com o picker aberto
    backgroundColor: "#515CC6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnCriarTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});