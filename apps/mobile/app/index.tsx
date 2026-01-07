import { Link } from 'expo-router'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'

// Custom theme colors (matching web app)
const colors = {
  canvas: '#0B0E14',
  surface: '#151A23',
  surfaceHover: '#1E2532',
  subtle: '#2A3441',
  primary: '#F1F5F9',
  secondary: '#94A3B8',
  action: '#3B82F6',
  success: '#10B981',
  icon: '#64748B',
  mutedRed: '#EF4444',
  mutedOrange: '#F97316',
}

const tools = [
  {
    title: 'Kettenrechner',
    description: 'Kopfrechnen-Kettenaufgaben',
    href: '/kettenrechner' as const,
    tags: ['MATHE', 'FOKUS'],
  },
  {
    title: 'Farben',
    description: 'Stroop-Effekt-Trainer',
    href: '/farben' as const,
    tags: ['KOGNITIV', 'REAKTION'],
  },
  {
    title: 'Hauptstadte Quiz',
    description: 'Europaische Hauptstadte',
    href: '/capitals' as const,
    tags: ['GEOGRAPHIE', 'GEDACHTNIS'],
  },
]

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Training Erik</Text>
        <Text style={styles.subtitle}>Professionelles Training</Text>
      </View>

      <View style={styles.grid}>
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDesc}>{tool.description}</Text>
              <View style={styles.tagContainer}>
                {tool.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.action,
  },
  subtitle: {
    fontSize: 12,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: colors.canvas,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.icon,
  },
})
