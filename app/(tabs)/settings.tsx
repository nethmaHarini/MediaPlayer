import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings as SettingsIcon,
  Brain,
  Download,
  Volume2,
  Smartphone,
  Info,
  CheckCircle,
  Circle,
  RefreshCw,
  Folder,
  Music,
  X,
} from 'lucide-react-native';
import { useSettings } from '../../contexts/SettingsContext';

export default function SettingsScreen() {
  const {
    autoSeparation,
    setAutoSeparation,
    highQuality,
    setHighQuality,
    selectedModel,
    setSelectedModel,
    autoSave,
    setAutoSave,
    saveLocation,
    setSaveLocation,
    audioFormat,
    setAudioFormat,
    realTimeChords,
    setRealTimeChords,
    availableModels,
    resetSettings,
  } = useSettings();

  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSaveLocationModal, setShowSaveLocationModal] = useState(false);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setShowModelSelector(false);
  };

  const handleSaveLocationSelect = (location: string) => {
    setSaveLocation(location);
    setShowSaveLocationModal(false);
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ]
    );
  };

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

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowModelSelector(true)}
          >
            <View style={styles.settingInfo}>
              <Brain size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>AI Model</Text>
                <Text style={styles.settingDescription}>
                  {availableModels.find((m) => m.id === selectedModel)?.name ||
                    'Select Model'}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Downloads</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Download size={24} color="#3B82F6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>
                  Auto-save Separated Tracks
                </Text>
                <Text style={styles.settingDescription}>
                  Automatically save separated stems to device
                </Text>
              </View>
            </View>
            <Switch
              value={autoSave}
              onValueChange={setAutoSave}
              thumbColor="#3B82F6"
              trackColor={{ false: '#374151', true: '#3B82F6' }}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowSaveLocationModal(true)}
          >
            <View style={styles.settingInfo}>
              <Folder size={24} color="#EC4899" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Save Location</Text>
                <Text style={styles.settingDescription}>
                  {saveLocation === 'downloads'
                    ? 'Downloads folder'
                    : saveLocation === 'documents'
                    ? 'Documents folder'
                    : saveLocation === 'music'
                    ? 'Music folder'
                    : 'Custom location'}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Music size={24} color="#8B5CF6" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Audio Format</Text>
                <Text style={styles.settingDescription}>
                  {audioFormat.toUpperCase()} -{' '}
                  {audioFormat === 'wav' ? 'Lossless quality' : 'Compressed'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.formatButton}
              onPress={() =>
                setAudioFormat(audioFormat === 'wav' ? 'mp3' : 'wav')
              }
            >
              <Text style={styles.formatButtonText}>
                {audioFormat === 'wav' ? 'Switch to MP3' : 'Switch to WAV'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
          <Text style={styles.sectionTitle}>AI Models Status</Text>

          {availableModels
            .filter((model) => model.type === 'separation')
            .map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelCard,
                  selectedModel === model.id && styles.selectedModelCard,
                ]}
                onPress={() => model.isAvailable && setSelectedModel(model.id)}
              >
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>{model.name}</Text>
                  <View style={styles.modelBadges}>
                    <View
                      style={[
                        styles.qualityBadge,
                        {
                          backgroundColor:
                            model.quality === 'high'
                              ? '#10B981'
                              : model.quality === 'medium'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>{model.quality}</Text>
                    </View>
                    <View
                      style={[
                        styles.speedBadge,
                        {
                          backgroundColor:
                            model.speed === 'fast'
                              ? '#10B981'
                              : model.speed === 'medium'
                              ? '#F59E0B'
                              : '#EF4444',
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>{model.speed}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.modelDescription}>{model.description}</Text>
                <View style={styles.modelStatus}>
                  {model.isAvailable ? (
                    <>
                      <CheckCircle size={16} color="#10B981" />
                      <Text
                        style={[styles.modelStatusText, { color: '#10B981' }]}
                      >
                        {selectedModel === model.id ? 'Active' : 'Available'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Circle size={16} color="#9CA3AF" />
                      <Text
                        style={[styles.modelStatusText, { color: '#9CA3AF' }]}
                      >
                        Not Available
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetSettings}
          >
            <RefreshCw size={20} color="#EF4444" />
            <Text style={styles.resetButtonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Info size={20} color="#9CA3AF" />
          <Text style={styles.infoText}>
            Professional AI processing runs locally on your device. High quality
            models provide better separation but require more processing time.
          </Text>
        </View>
      </ScrollView>

      {/* Model Selection Modal */}
      <Modal
        visible={showModelSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModelSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select AI Model</Text>
              <TouchableOpacity
                onPress={() => setShowModelSelector(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Choose the AI model for music separation
            </Text>

            <ScrollView style={styles.modelList}>
              {availableModels
                .filter((model) => model.type === 'separation')
                .map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelSelectCard,
                      selectedModel === model.id &&
                        styles.selectedModelSelectCard,
                    ]}
                    onPress={() => {
                      if (model.isAvailable) {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }
                    }}
                    disabled={!model.isAvailable}
                  >
                    <View style={styles.modelSelectHeader}>
                      <Text
                        style={[
                          styles.modelSelectName,
                          !model.isAvailable && { color: '#6B7280' },
                        ]}
                      >
                        {model.name}
                      </Text>
                      {selectedModel === model.id && (
                        <CheckCircle size={20} color="#8B5CF6" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.modelSelectDescription,
                        !model.isAvailable && { color: '#6B7280' },
                      ]}
                    >
                      {model.description}
                    </Text>
                    <View style={styles.modelSelectFooter}>
                      <View style={styles.modelSelectBadges}>
                        <View
                          style={[
                            styles.qualityBadge,
                            {
                              backgroundColor:
                                model.quality === 'high'
                                  ? '#10B981'
                                  : model.quality === 'medium'
                                  ? '#F59E0B'
                                  : '#EF4444',
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>{model.quality}</Text>
                        </View>
                        <View
                          style={[
                            styles.speedBadge,
                            {
                              backgroundColor:
                                model.speed === 'fast'
                                  ? '#10B981'
                                  : model.speed === 'medium'
                                  ? '#F59E0B'
                                  : '#EF4444',
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>{model.speed}</Text>
                        </View>
                      </View>
                      {!model.isAvailable && (
                        <Text style={styles.unavailableText}>
                          Not Available
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save Location Modal */}
      <Modal
        visible={showSaveLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Default Save Location</Text>
              <TouchableOpacity
                onPress={() => setShowSaveLocationModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Choose where separated tracks should be saved by default
            </Text>

            <View style={styles.locationOptions}>
              <TouchableOpacity
                style={[
                  styles.locationOption,
                  saveLocation === 'downloads' && styles.selectedLocationOption,
                ]}
                onPress={() => {
                  setSaveLocation('downloads');
                  setShowSaveLocationModal(false);
                }}
              >
                <Folder size={24} color="#3B82F6" />
                <View style={styles.locationText}>
                  <Text style={styles.locationTitle}>Downloads</Text>
                  <Text style={styles.locationDescription}>
                    Save to downloads folder
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.locationOption,
                  saveLocation === 'documents' && styles.selectedLocationOption,
                ]}
                onPress={() => {
                  setSaveLocation('documents');
                  setShowSaveLocationModal(false);
                }}
              >
                <Folder size={24} color="#10B981" />
                <View style={styles.locationText}>
                  <Text style={styles.locationTitle}>Documents</Text>
                  <Text style={styles.locationDescription}>
                    Save to documents folder
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.locationOption,
                  saveLocation === 'music' && styles.selectedLocationOption,
                ]}
                onPress={() => {
                  setSaveLocation('music');
                  setShowSaveLocationModal(false);
                }}
              >
                <Folder size={24} color="#F59E0B" />
                <View style={styles.locationText}>
                  <Text style={styles.locationTitle}>Music</Text>
                  <Text style={styles.locationDescription}>
                    Save to music folder
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  formatButton: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  formatButtonText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modelCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  selectedModelCard: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  speedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    flex: 1,
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
    marginLeft: 6,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  modelList: {
    maxHeight: 300,
  },
  modelSelectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedModelSelectCard: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  modelSelectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modelSelectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  modelSelectDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  modelSelectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelSelectBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  unavailableText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  locationOptions: {
    gap: 12,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLocationOption: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
