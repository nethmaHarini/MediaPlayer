import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings as SettingsIcon, 
  Brain, 
  Download, 
  Volume2,
  Smartphone,
  Info
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [autoSeparation, setAutoSeparation] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [downloadSeparated, setDownloadSeparated] = useState(false);
  const [realTimeChords, setRealTimeChords] = useState(true);

  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <SettingsIcon size={32} color="#8B5CF6" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Processing</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Brain size={24} color="#8B5CF6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto Separation</Text>
                <Text style={styles.settingDescription}>
                  Automatically separate tracks when loading songs
                </Text>
              </View>
            </View>
            <Switch
              value={autoSeparation}
              onValueChange={setAutoSeparation}
              thumbColor="#8B5CF6"
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Volume2 size={24} color="#10B981" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>High Quality Processing</Text>
                <Text style={styles.settingDescription}>
                  Use higher quality AI models (slower processing)
                </Text>
              </View>
            </View>
            <Switch
              value={highQuality}
              onValueChange={setHighQuality}
              thumbColor="#10B981"
              trackColor={{ false: '#374151', true: '#10B981' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Downloads</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Download size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto-save Separated Tracks</Text>
                <Text style={styles.settingDescription}>
                  Automatically save separated stems to device
                </Text>
              </View>
            </View>
            <Switch
              value={downloadSeparated}
              onValueChange={setDownloadSeparated}
              thumbColor="#3B82F6"
              trackColor={{ false: '#374151', true: '#3B82F6' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chord Detection</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Smartphone size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Real-time Analysis</Text>
                <Text style={styles.settingDescription}>
                  Detect chords in real-time during playback
                </Text>
              </View>
            </View>
            <Switch
              value={realTimeChords}
              onValueChange={setRealTimeChords}
              thumbColor="#F59E0B"
              trackColor={{ false: '#374151', true: '#F59E0B' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Models</Text>
          
          <TouchableOpacity style={styles.modelCard}>
            <Text style={styles.modelName}>Demucs v4 (Hybrid)</Text>
            <Text style={styles.modelDescription}>
              State-of-the-art source separation model
            </Text>
            <View style={styles.modelStatus}>
              <View style={styles.activeIndicator} />
              <Text style={styles.modelStatusText}>Active</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modelCard}>
            <Text style={styles.modelName}>Chord Recognition AI</Text>
            <Text style={styles.modelDescription}>
              Advanced chord detection and progression analysis
            </Text>
            <View style={styles.modelStatus}>
              <View style={styles.activeIndicator} />
              <Text style={styles.modelStatusText}>Active</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Info size={20} color="#9CA3AF" />
          <Text style={styles.infoText}>
            AI processing requires an internet connection and may take several minutes depending on song length.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  modelCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modelDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  modelStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  modelStatusText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
    lineHeight: 20,
    flex: 1,
  },
});