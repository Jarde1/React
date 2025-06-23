import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const initialProducts = [
  { name: 'Água s/ gás', estoque: 48 },
  { name: 'Água c/ gás', estoque: 36 },
  { name: 'Coca', estoque: 24 },
  { name: 'Coca Zero', estoque: 24 },
  { name: 'H2O', estoque: 12 },
  { name: 'Mate', estoque: 12 },
  { name: 'Água Tônica', estoque: 6 },
  { name: 'Guaraná', estoque: 24 },
  { name: 'Guaraná Zero', estoque: 6 },
  { name: 'Fanta Laranja', estoque: 6 },
  { name: 'Fanta Uva', estoque: 6 },
  { name: 'Del Valle Manga', estoque: 6 },
  { name: 'Del Valle Uva', estoque: 6 },
  { name: 'Del Valle Maracujá', estoque: 6 },
  { name: 'Del Valle Pêssego', estoque: 6 },
  { name: 'Colorado', estoque: 20 },
  { name: 'Budweiser', estoque: 20 },
  { name: 'Corona', estoque: 20 },
  { name: 'Stella', estoque: 20 },
  { name: 'Therezópolis', estoque: 18 },
  { name: 'Heineken', estoque: 12 },
];

const ProductRow = ({ product, turno, updateField }) => (
  <View style={styles.rowContainer}>
    <Text style={styles.productName}>{product.name}</Text>
    <View style={styles.fieldsContainer}>
      {['inicial', 'vendas', 'reposicao', 'final', 'estoque'].map((field, idx) => {
        const value =
          field === 'reposicao'
            ? product[turno].reposicao
            : field === 'final'
            ? product[turno].inicial - product[turno].vendas
            : field === 'estoque'
            ? product.estoque
            : product[turno][field];
        const editable = field === 'inicial' || field === 'vendas';

        return (
          <View key={idx} style={styles.inputGroup}>
            <Text>{field[0].toUpperCase() + field.slice(1)}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              editable={editable}
              value={value.toString()}
              onChangeText={text =>
                editable &&
                updateField(turno, product.name, field, +text || 0, product.estoque)
              }
            />
          </View>
        );
      })}
    </View>
  </View>
);

export default function EstoqueApp() {
  const [tab, setTab] = useState('manha');
  const [produtos, setProdutos] = useState(
    initialProducts.map(p => ({
      ...p,
      manha: { inicial: 0, reposicao: 0, vendas: 0 },
      noite: { inicial: 0, reposicao: 0, vendas: 0 }
    }))
  );

  const updateField = (turno, nome, campo, valor, estoque) => {
    setProdutos(produtos =>
      produtos.map(p => {
        if (p.name === nome) {
          const atualizado = {
            ...p[turno],
            [campo]: valor,
          };
          atualizado.reposicao = Math.max(0, estoque - atualizado.inicial + atualizado.vendas);
          return { ...p, [turno]: atualizado };
        }
        return p;
      })
    );
  };

  const gerarRelatorioPDF = async () => {
    const turnoAtual = tab;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    const html = `
      <html>
        <head><meta charset="UTF-8"><style>
          body { font-family: Arial, sans-serif; font-size: 10px; margin: 24px; }
          h1, h2 { text-align: center; margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style></head>
        <body>
          <h1>Relatório de Estoque</h1>
          <h2>Data: ${dataAtual} - Turno: ${turnoAtual.toUpperCase()}</h2>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Inicial</th>
                <th>Vendas</th>
                <th>Reposição</th>
                <th>Final</th>
                <th>Estoque</th>
              </tr>
            </thead>
            <tbody>
              ${produtos.map(p => {
                const t = p[turnoAtual];
                const final = t.inicial - t.vendas;
                return `
                  <tr>
                    <td>${p.name}</td>
                    <td>${t.inicial}</td>
                    <td>${t.vendas}</td>
                    <td>${t.reposicao}</td>
                    <td>${final}</td>
                    <td>${p.estoque}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão de Estoque</Text>
      <View style={styles.tabButtons}>
        <TouchableOpacity style={[styles.tabButton, tab === 'manha' && styles.activeTab]} onPress={() => setTab('manha')}>
          <Text>Turno Manhã</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, tab === 'noite' && styles.activeTab]} onPress={() => setTab('noite')}>
          <Text>Turno Noite</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.reportButton}>
        <Button title="Gerar Relatório (.PDF)" onPress={gerarRelatorioPDF} color="#3a87f2" />
      </View>
      <ScrollView>
        {produtos.map(p => (
          <ProductRow key={p.name} product={p} turno={tab} updateField={updateField} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tabButton: {
    padding: 10,
    backgroundColor: '#eee',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#ccc',
  },
  reportButton: {
    marginBottom: 16,
    alignItems: 'center',
  },
  rowContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputGroup: {
    marginRight: 10,
    width: 70,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    height: 30,
    borderRadius: 4,
    textAlign: 'center',
  },
});
