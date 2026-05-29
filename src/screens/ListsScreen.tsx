import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import { EmptyState } from '../components/EmptyState';
import { EntityFormModal } from '../components/EntityFormModal';
import { PaperCard } from '../components/PaperCard';
import { PaperTexture } from '../components/PaperTexture';
import { colors, fonts, spacing } from '../theme';
import type {
  LittleReminder,
  MomPersonality,
  Reminder,
  ReminderCategory,
  ReminderInterest,
  ReminderPriority,
  ReminderRepeat,
  ShoppingItem,
  ShoppingList,
} from '../types';
import { confirmDestructive } from '../utils/confirm';

type Props = {
  reminders: Reminder[];
  personality: MomPersonality;
  shoppingLists: ShoppingList[];
  littleReminders: LittleReminder[];
  onSaveReminder: (reminder: Omit<Reminder, 'id'> & { id?: string }) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onSaveShoppingList: (list: Omit<ShoppingList, 'id'> & { id?: string }) => void;
  onDeleteShoppingList: (id: string) => void;
  onSaveShoppingItem: (listId: string, item: Omit<ShoppingItem, 'id'> & { id?: string }) => void;
  onDeleteShoppingItem: (listId: string, itemId: string) => void;
  onToggleShoppingItem: (listId: string, itemId: string) => void;
  onSaveLittleReminder: (reminder: Omit<LittleReminder, 'id'> & { id?: string }) => void;
  onDeleteLittleReminder: (id: string) => void;
  onToggleLittleReminder: (id: string) => void;
};

type FormState =
  | { type: 'shopping-list'; list?: ShoppingList }
  | { type: 'shopping-item'; listId: string; item?: ShoppingItem }
  | { type: 'little-reminder'; reminder?: LittleReminder }
  | { type: 'reminder'; reminder?: Reminder }
  | null;

const reminderCategories: Array<ReminderInterest | ReminderCategory> = [
  'weather',
  'birthdays',
  'calendar',
  'shopping',
  'family',
  'routines',
  'home',
  'work',
  'health',
  'personal',
  'school',
  'other',
];
const reminderPriorities: ReminderPriority[] = ['low', 'normal', 'high'];
const reminderRepeats: ReminderRepeat[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

export function ListsScreen({
  reminders,
  personality,
  shoppingLists,
  littleReminders,
  onSaveReminder,
  onDeleteReminder,
  onToggleReminder,
  onSaveShoppingList,
  onDeleteShoppingList,
  onSaveShoppingItem,
  onDeleteShoppingItem,
  onToggleShoppingItem,
  onSaveLittleReminder,
  onDeleteLittleReminder,
  onToggleLittleReminder,
}: Props) {
  const [form, setForm] = useState<FormState>(null);
  const activeList = shoppingLists[0];

  return (
    <View style={styles.screen}>
      <PaperTexture />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lists</Text>
        <Text style={styles.subtitle}>Little notes before they leave your head.</Text>

        <PaperCard tapeColor={colors.beige} backgroundColor="#FFF0BF" style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{activeList?.title ?? 'Shopping List'}</Text>
            <View style={styles.headerActions}>
              <Pressable accessibilityRole="button" onPress={() => setForm({ type: 'shopping-list', list: activeList })}>
                <Feather name="edit-2" size={20} color={colors.sageDark} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => activeList && setForm({ type: 'shopping-item', listId: activeList.id })}>
                <Feather name="plus" size={22} color={colors.coral} />
              </Pressable>
            </View>
          </View>
          {!activeList ? (
            <EmptyState kind="shopping" tone={personality} />
          ) : null}
          {activeList?.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Pressable onPress={() => onToggleShoppingItem(activeList.id, item.id)} style={[styles.checkbox, item.checked && styles.checked]}>
                {item.checked ? <Feather name="check" size={15} color={colors.white} /> : null}
              </Pressable>
              <Pressable style={styles.itemCopy} onPress={() => setForm({ type: 'shopping-item', listId: activeList.id, item })}>
                <Text style={[styles.itemText, item.checked && styles.checkedText]}>{item.label}</Text>
                {item.essential || item.isEssential ? <Text style={styles.meta}>Essential</Text> : null}
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDestructive('Delete item?', `Remove "${item.label}" from the shopping list?`, () =>
                    onDeleteShoppingItem(activeList.id, item.id),
                  )
                }
              >
                <Feather name="trash-2" size={18} color={colors.coral} />
              </Pressable>
            </View>
          ))}
          <MaterialCommunityIcons name="basket-outline" size={34} color={colors.sageDark} style={styles.decorIcon} />
        </PaperCard>

        <PaperCard tapeColor={colors.teal} backgroundColor="#E8F1E6" style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Little Reminders</Text>
            <Pressable accessibilityRole="button" onPress={() => setForm({ type: 'little-reminder' })}>
              <Feather name="plus" size={22} color={colors.coral} />
            </Pressable>
          </View>
          {littleReminders.length === 0 ? (
            <EmptyState kind="little-reminders" tone={personality} />
          ) : null}
          {littleReminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderRow}>
              <Pressable onPress={() => onToggleLittleReminder(reminder.id)} style={[styles.dot, reminder.completed && styles.doneDot]} />
              <Pressable style={styles.reminderCopy} onPress={() => setForm({ type: 'little-reminder', reminder })}>
                <Text style={[styles.itemText, reminder.completed && styles.checkedText]}>{reminder.title}</Text>
                {reminder.message ? <Text style={styles.note}>{reminder.message}</Text> : null}
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDestructive('Delete little reminder?', `Remove "${reminder.title}"?`, () => onDeleteLittleReminder(reminder.id))
                }
              >
                <Feather name="trash-2" size={18} color={colors.coral} />
              </Pressable>
            </View>
          ))}
        </PaperCard>

        <PaperCard tapeColor={colors.blue} backgroundColor={colors.paper} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Reminders</Text>
            <Pressable accessibilityRole="button" onPress={() => setForm({ type: 'reminder' })}>
              <Feather name="plus" size={22} color={colors.coral} />
            </Pressable>
          </View>
          {reminders.length === 0 ? <EmptyState kind="reminders" tone={personality} /> : null}
          {reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderRow}>
              <Pressable onPress={() => onToggleReminder(reminder.id)} style={[styles.checkbox, reminder.completed && styles.checked]}>
                {reminder.completed ? <Feather name="check" size={15} color={colors.white} /> : null}
              </Pressable>
              <Pressable style={styles.reminderCopy} onPress={() => setForm({ type: 'reminder', reminder })}>
                <Text style={[styles.itemText, reminder.completed && styles.checkedText]}>{reminder.title}</Text>
                <Text style={styles.note}>{reminder.dueAt ? `Due ${reminder.dueAt}` : reminder.message}</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDestructive('Delete reminder?', `Remove "${reminder.title}"?`, () => onDeleteReminder(reminder.id))}
              >
                <Feather name="trash-2" size={18} color={colors.coral} />
              </Pressable>
            </View>
          ))}
        </PaperCard>
      </ScrollView>

      <EntityFormModal
        visible={form !== null}
        title={formTitle(form)}
        fields={fieldsFor(form)}
        initialValues={initialValuesFor(form)}
        onClose={() => setForm(null)}
        onSubmit={(values) => {
          if (!form) return;
          if (form.type === 'shopping-list') {
            onSaveShoppingList({ id: form.list?.id, title: values.title.trim(), items: form.list?.items ?? [] });
          }
          if (form.type === 'shopping-item') {
            onSaveShoppingItem(form.listId, {
              id: form.item?.id,
              label: values.label.trim(),
              checked: form.item?.checked ?? false,
              essential: values.essential.trim().toLowerCase() === 'yes',
              isEssential: values.essential.trim().toLowerCase() === 'yes',
            });
          }
          if (form.type === 'little-reminder') {
            onSaveLittleReminder({
              id: form.reminder?.id,
              title: values.title.trim(),
              message: values.message?.trim(),
              dueAt: values.dueAt?.trim() || undefined,
              completed: form.reminder?.completed ?? false,
            });
          }
          if (form.type === 'reminder') {
            onSaveReminder({
              id: form.reminder?.id,
              title: values.title.trim(),
              message: values.message?.trim() || values.title.trim(),
              dueAt: values.dueAt?.trim() || undefined,
              category: reminderCategories.includes(values.category as Reminder['category'])
                ? (values.category as Reminder['category'])
                : 'routines',
              priority: reminderPriorities.includes(values.priority as ReminderPriority) ? (values.priority as ReminderPriority) : 'normal',
              repeat: reminderRepeats.includes(values.repeat as ReminderRepeat) ? (values.repeat as ReminderRepeat) : 'none',
              completed: form.reminder?.completed ?? false,
            });
          }
        }}
      />
    </View>
  );
}

function formTitle(form: FormState) {
  if (form?.type === 'shopping-list') return form.list ? 'Edit List' : 'Add List';
  if (form?.type === 'shopping-item') return form.item ? 'Edit Item' : 'Add Item';
  if (form?.type === 'little-reminder') return form.reminder ? 'Edit Note' : 'Add Note';
  if (form?.type === 'reminder') return form.reminder ? 'Edit Reminder' : 'Add Reminder';
  return 'Edit';
}

function fieldsFor(form: FormState) {
  if (form?.type === 'shopping-list') {
    return [{ key: 'title', label: 'Title', required: true, placeholder: 'Weekly groceries' }];
  }
  if (form?.type === 'shopping-item') {
    return [
      { key: 'label', label: 'Item', required: true, placeholder: 'Milk' },
      { key: 'essential', label: 'Essential?', type: 'boolean' as const },
    ];
  }
  if (form?.type === 'little-reminder') {
    return [
      { key: 'title', label: 'Title', required: true, placeholder: 'Water the plants' },
      { key: 'message', label: 'Note', multiline: true, placeholder: 'Short MOM-style note' },
      { key: 'dueAt', label: 'Due at', type: 'datetime-local' as const, placeholder: 'Choose date and time' },
    ];
  }
  return [
    { key: 'title', label: 'Title', required: true, placeholder: 'Pay school fee' },
    { key: 'message', label: 'Message', multiline: true, placeholder: 'A short reminder message' },
    { key: 'dueAt', label: 'Due at', type: 'datetime-local' as const, placeholder: 'Choose date and time' },
    { key: 'category', label: 'Category', type: 'select' as const, options: reminderCategories },
    { key: 'priority', label: 'Priority', type: 'select' as const, options: reminderPriorities },
    { key: 'repeat', label: 'Repeat', type: 'select' as const, options: reminderRepeats },
  ];
}

function initialValuesFor(form: FormState): Record<string, string> {
  if (form?.type === 'shopping-list') {
    return { title: form.list?.title ?? 'Shopping List' };
  }
  if (form?.type === 'shopping-item') {
    return {
      label: form.item?.label ?? '',
      essential: form.item?.essential || form.item?.isEssential ? 'yes' : 'no',
    };
  }
  if (form?.type === 'little-reminder') {
    return {
      title: form.reminder?.title ?? '',
      message: form.reminder?.message ?? '',
      dueAt: form.reminder?.dueAt ?? '',
    };
  }
  if (form?.type === 'reminder') {
    return {
      title: form.reminder?.title ?? '',
      message: form.reminder?.message ?? '',
      dueAt: form.reminder?.dueAt ?? '',
      category: form.reminder?.category ?? 'routines',
      priority: form.reminder?.priority ?? 'normal',
      repeat: form.reminder?.repeat ?? 'none',
    };
  }
  return {};
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.script,
    fontSize: 32,
    lineHeight: 38,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.mutedInk,
    borderRadius: 4,
    borderWidth: 1.5,
    height: 23,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 23,
  },
  checked: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  checkedText: {
    color: colors.mutedInk,
    textDecorationLine: 'line-through',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: 58,
  },
  decorIcon: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  doneDot: {
    backgroundColor: colors.sage,
  },
  dot: {
    backgroundColor: colors.coral,
    borderRadius: 6,
    height: 12,
    marginTop: 7,
    width: 12,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemCopy: {
    flex: 1,
  },
  itemRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(116, 82, 47, 0.12)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 46,
  },
  itemText: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  note: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  reminderCopy: {
    flex: 1,
  },
  reminderRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  subtitle: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 26,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: '900',
  },
});
