import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { EmptyState } from '../components/EmptyState';
import { EntityFormModal } from '../components/EntityFormModal';
import { PaperCard } from '../components/PaperCard';
import { PaperTexture } from '../components/PaperTexture';
import { localeFor, option, categoryLabel, t } from '../i18n';
import { colors, fonts, spacing } from '../theme';
import type { AppLanguage, CalendarEvent, CalendarEventCategory, MomPersonality } from '../types';
import { confirmDestructive } from '../utils/confirm';

const formatTime = (date: string, language: AppLanguage) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return '--:--';
  }

  return new Intl.DateTimeFormat(localeFor(language), { hour: 'numeric', minute: '2-digit' }).format(parsed);
};

const normalizeDateTime = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.length === 16 ? `${trimmed}:00` : trimmed;
};

const isValidDateTime = (value: string) => !Number.isNaN(new Date(normalizeDateTime(value)).getTime());

type Props = {
  events: CalendarEvent[];
  language: AppLanguage;
  personality: MomPersonality;
  onSaveEvent: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => void;
  onDeleteEvent: (id: string) => void;
};

const categories: CalendarEventCategory[] = ['personal', 'work', 'health', 'medical', 'family', 'school', 'other'];

export function CalendarScreen({ events, language, personality, onSaveEvent, onDeleteEvent }: Props) {
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <View style={styles.screen}>
      <PaperTexture />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
              {t(language, 'calendar.title')}
            </Text>
            <Text style={styles.subtitle}>{t(language, 'calendar.subtitle')}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t(language, 'calendar.addEvent')} onPress={openCreate} style={styles.addButton}>
            <Feather name="plus" size={22} color={colors.white} />
          </Pressable>
        </View>

        {events.length === 0 ? (
          <EmptyState kind="calendar" tone={personality} language={language} />
        ) : null}

        {events.map((event) => (
          <PaperCard key={event.id} backgroundColor={event.category === 'medical' ? '#FCE3D8' : colors.paper} style={styles.event}>
            <View style={styles.eventRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.time}>{formatTime(event.startsAt, language)}</Text>
                <Text style={styles.date}>{event.startsAt.slice(5, 10)}</Text>
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.category}>{categoryLabel(language, event.category)}</Text>
                {event.preparationNote ? <Text style={styles.note}>{event.preparationNote}</Text> : null}
              </View>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${event.title}`}
                  onPress={() => {
                    setEditing(event);
                    setFormOpen(true);
                  }}
                >
                  <Feather name="edit-2" size={19} color={colors.sageDark} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${event.title}`}
                  onPress={() =>
                    confirmDestructive(t(language, 'calendar.deleteTitle'), t(language, 'calendar.deleteBody', { title: event.title }), () => onDeleteEvent(event.id))
                  }
                >
                  <Feather name="trash-2" size={19} color={colors.coral} />
                </Pressable>
              </View>
            </View>
          </PaperCard>
        ))}
      </ScrollView>
      <EntityFormModal
        visible={formOpen}
        title={editing ? t(language, 'calendar.editEvent') : t(language, 'calendar.addEventTitle')}
        language={language}
        fields={[
          { key: 'title', label: t(language, 'calendar.titleField'), required: true, placeholder: t(language, 'calendar.titlePlaceholder') },
          {
            key: 'startsAt',
            label: t(language, 'calendar.startsAt'),
            required: true,
            type: 'datetime-local',
            placeholder: t(language, 'calendar.chooseDateTime'),
            validate: (value) => (isValidDateTime(value) ? null : t(language, 'calendar.invalidDateTime')),
          },
          { key: 'category', label: t(language, 'calendar.category'), type: 'select', options: categories.map((value) => option(language, value)) },
          { key: 'isImportant', label: t(language, 'calendar.important'), type: 'boolean' },
          { key: 'preparationNote', label: t(language, 'calendar.prepNote'), multiline: true, placeholder: t(language, 'calendar.prepPlaceholder') },
        ]}
        initialValues={
          editing
            ? {
                title: editing.title,
                startsAt: editing.startsAt,
                category: editing.category,
                isImportant: editing.isImportant ? 'yes' : 'no',
                preparationNote: editing.preparationNote ?? '',
              }
            : { category: 'personal', isImportant: 'no', startsAt: new Date().toISOString().slice(0, 16) }
        }
        onClose={() => setFormOpen(false)}
        onSubmit={(values) =>
          onSaveEvent({
            id: editing?.id,
            title: values.title.trim(),
            startsAt: normalizeDateTime(values.startsAt),
            category: categories.includes(values.category as CalendarEventCategory)
              ? (values.category as CalendarEventCategory)
              : 'personal',
            isImportant: values.isImportant?.trim().toLowerCase() === 'yes',
            preparationNote: values.preparationNote?.trim() || undefined,
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  category: {
    color: colors.mutedInk,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: 58,
  },
  actions: {
    alignItems: 'center',
    gap: spacing.md,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderRadius: 18,
    flexShrink: 0,
    height: 36,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
    width: 36,
  },
  date: {
    color: colors.mutedInk,
    fontFamily: fonts.label,
    fontSize: 12,
  },
  event: {
    marginBottom: spacing.md,
  },
  eventCopy: {
    flex: 1,
  },
  eventRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  note: {
    color: colors.coralDark,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  subtitle: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 27,
  },
  time: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 14,
    fontWeight: '800',
  },
  timeBlock: {
    alignItems: 'center',
    backgroundColor: '#EBD4A5',
    borderRadius: 10,
    minWidth: 66,
    padding: spacing.sm,
  },
  title: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
  },
});
