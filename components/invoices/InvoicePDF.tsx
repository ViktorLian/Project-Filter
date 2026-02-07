import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export function InvoicePDF({ invoice, company }: any) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>{company.name}</Text>

        <View style={styles.section}>
          <Text>Faktura #{invoice.invoice_number}</Text>
          <Text>Dato: {invoice.issued_date}</Text>
          <Text>Forfall: {invoice.due_date}</Text>
        </View>

        <View style={styles.section}>
          <Text>Kunde:</Text>
          <Text>{invoice.customer.name}</Text>
          <Text>{invoice.customer.email}</Text>
        </View>

        <View style={styles.section}>
          <Text>Beskrivelse:</Text>
          <Text>{invoice.description}</Text>
        </View>

        <Text style={styles.total}>Totalt: {invoice.amount} kr</Text>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  header: { fontSize: 18, marginBottom: 20 },
  section: { marginBottom: 12 },
  total: { marginTop: 20, fontSize: 14 },
});
