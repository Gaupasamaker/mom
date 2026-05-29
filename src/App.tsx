import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { BottomNavBar, TabKey } from './components/BottomNavBar';
import { FeedbackBanner } from './components/FeedbackBanner';
import { useMomData } from './features/useMomData';
import { DailySummaryService } from './services/DailySummaryService';
import { MomCheckService } from './services/MomCheckService';
import { PreparationService } from './services/PreparationService';
import { RoutineService } from './services/RoutineService';
import { CalendarScreen } from './screens/CalendarScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ListsScreen } from './screens/ListsScreen';
import { MomCheckModal } from './screens/MomCheckModal';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { colors, fonts } from './theme';
import { replaceTimeGreeting, t } from './i18n';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [momCheckOpen, setMomCheckOpen] = useState(false);
  const momData = useMomData();
  const language = momData.data?.preferences.language ?? 'en';

  const momCheckResult = useMemo(
    () => (momData.momCheckInput ? MomCheckService.run(momData.momCheckInput) : null),
    [momData.momCheckInput],
  );
  const dailySummary = useMemo(
    () => (momData.momCheckInput ? DailySummaryService.create(momData.momCheckInput) : null),
    [momData.momCheckInput],
  );
  const timeAwareDailySummary = useMemo(() => {
    if (!dailySummary) return null;
    const hour = new Date().getHours();
    return {
      ...dailySummary,
      topMessage: replaceTimeGreeting(language, dailySummary.topMessage, hour),
    };
  }, [dailySummary, language]);
  const preparationTasks = useMemo(
    () => (momData.momCheckInput ? PreparationService.generate(momData.momCheckInput).slice(0, 4) : []),
    [momData.momCheckInput],
  );
  const currentRoutine = useMemo(
    () => (momData.momCheckInput ? RoutineService.generate(momData.momCheckInput, new Date().getHours() < 12 ? 'morning' : 'evening') : null),
    [momData.momCheckInput],
  );

  if (momData.loading || !momData.data) {
    return (
      <SafeAreaView style={styles.loadingShell}>
        <StatusBar style="dark" />
        <Text style={styles.loadingLogo}>MOM</Text>
        <Text style={styles.loadingText}>{t(language, 'app.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (!momData.data.preferences.hasCompletedOnboarding) {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen
          language={language}
          onComplete={(selectedPersonality, selectedInterests) => {
            void momData.updatePreferences({
              hasCompletedOnboarding: true,
              personality: selectedPersonality,
            });
          }}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      <View style={styles.appFrame}>
        <View style={styles.content}>
          {activeTab === 'settings' ? (
            <SettingsScreen
              preferences={momData.data.preferences}
              onBack={() => setActiveTab('home')}
              onPreferencesChange={(patch) => void momData.updatePreferences(patch)}
              onExportData={momData.exportData}
              onImportData={(json) => void momData.importDataFromJson(json)}
              onResetData={() => void momData.resetLocalData()}
              onRestoreDemoData={() => void momData.restoreDemoData()}
              weatherForecast={momData.data.weatherForecast}
              weatherLoading={momData.weatherLoading}
              weatherSearchMessage={momData.weatherSearchMessage}
              weatherSearchResults={momData.weatherSearchResults}
              onSearchCities={(query) => void momData.searchCities(query)}
              onSelectWeatherCity={(city) => void momData.selectWeatherCity(city)}
              onRefreshWeather={() => void momData.refreshWeather(true)}
              language={language}
            />
          ) : (
            <>
              {activeTab === 'home' ? (
                <HomeScreen
                  birthdays={momData.data.birthdays}
                  calendarEvents={momData.data.calendarEvents}
                  dailySummary={timeAwareDailySummary}
                  language={language}
                  littleReminders={momData.data.littleReminders}
                  personality={momData.data.preferences.personality}
                  preparationTasks={preparationTasks}
                  currentRoutine={currentRoutine}
                  shoppingLists={momData.data.shoppingLists}
                  weatherForecast={momData.data.weatherForecast}
                  onMomCheckPress={() => setMomCheckOpen(true)}
                  onRefreshWeather={() => void momData.refreshWeather(true)}
                  onToggleShoppingItem={(listId, itemId) => void momData.toggleShoppingItem(listId, itemId)}
                />
              ) : null}
              {activeTab === 'calendar' ? (
                <CalendarScreen
                  events={momData.data.calendarEvents}
                  language={language}
                  personality={momData.data.preferences.personality}
                  onSaveEvent={(event) => void momData.saveCalendarEvent(event)}
                  onDeleteEvent={(id) => void momData.deleteCalendarEvent(id)}
                />
              ) : null}
              {activeTab === 'lists' ? (
                <ListsScreen
                  language={language}
                  reminders={momData.data.reminders}
                  personality={momData.data.preferences.personality}
                  shoppingLists={momData.data.shoppingLists}
                  littleReminders={momData.data.littleReminders}
                  onSaveReminder={(reminder) => void momData.saveReminder(reminder)}
                  onDeleteReminder={(id) => void momData.deleteReminder(id)}
                  onToggleReminder={(id) => void momData.toggleReminder(id)}
                  onSaveShoppingList={(list) => void momData.saveShoppingList(list)}
                  onDeleteShoppingList={(id) => void momData.deleteShoppingList(id)}
                  onSaveShoppingItem={(listId, item) => void momData.saveShoppingItem(listId, item)}
                  onDeleteShoppingItem={(listId, itemId) => void momData.deleteShoppingItem(listId, itemId)}
                  onToggleShoppingItem={(listId, itemId) => void momData.toggleShoppingItem(listId, itemId)}
                  onSaveLittleReminder={(reminder) => void momData.saveLittleReminder(reminder)}
                  onDeleteLittleReminder={(id) => void momData.deleteLittleReminder(id)}
                  onToggleLittleReminder={(id) => void momData.toggleLittleReminder(id)}
                />
              ) : null}
              {activeTab === 'family' ? (
                <FamilyScreen
                  birthdays={momData.data.birthdays}
                  familyMembers={momData.data.familyMembers}
                  language={language}
                  personality={momData.data.preferences.personality}
                  onSaveBirthday={(birthday) => void momData.saveBirthday(birthday)}
                  onDeleteBirthday={(id) => void momData.deleteBirthday(id)}
                  onSaveFamilyMember={(member) => void momData.saveFamilyMember(member)}
                  onDeleteFamilyMember={(id) => void momData.deleteFamilyMember(id)}
                />
              ) : null}
            </>
          )}
          <View style={styles.feedbackWrap}>
            <FeedbackBanner message={momData.saving ? t(language, 'common.saving') : momData.feedback} onDismiss={momData.clearFeedback} />
          </View>
        </View>
        <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} onMomCheckPress={() => setMomCheckOpen(true)} language={language} />
      </View>
      {momCheckResult ? <MomCheckModal visible={momCheckOpen} result={momCheckResult} onClose={() => setMomCheckOpen(false)} language={language} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 430,
    width: '100%',
  },
  content: {
    flex: 1,
  },
  feedbackWrap: {
    left: 16,
    position: 'absolute',
    right: 16,
    top: 48,
  },
  loadingLogo: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 54,
    fontWeight: '900',
  },
  loadingShell: {
    alignItems: 'center',
    backgroundColor: colors.cream,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  shell: {
    backgroundColor: '#EFE1C8',
    flex: 1,
  },
});
