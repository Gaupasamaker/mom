import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, fonts, spacing } from '../theme';
import { PaperTexture } from './PaperTexture';
import { localeFor, t } from '../i18n';
import type { AppLanguage } from '../types';

export type FormField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  type?: 'text' | 'date' | 'datetime-local' | 'select' | 'boolean';
  options?: Array<{ label: string; value: string }> | string[];
  validate?: (value: string, values: Record<string, string>) => string | null;
};

type PickerState = {
  field: FormField;
  draft: Date;
};

type Props = {
  visible: boolean;
  title: string;
  fields: FormField[];
  initialValues?: Record<string, string>;
  submitLabel?: string;
  language: AppLanguage;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
};

export function EntityFormModal({
  visible,
  title,
  fields,
  initialValues,
  submitLabel,
  language,
  onClose,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);

  useEffect(() => {
    if (visible) {
      setValues(initialValues ?? {});
      setError(null);
      setPicker(null);
    }
  }, [initialValues, visible]);

  const submit = async () => {
    const missing = fields.find((field) => field.required && !values[field.key]?.trim());
    if (missing) {
      setError(t(language, 'common.required', { field: missing.label }));
      return;
    }

    const invalid = fields
      .map((field) => field.validate?.(values[field.key] ?? '', values))
      .find((message): message is string => Boolean(message));
    if (invalid) {
      setError(invalid);
      return;
    }

    try {
      await onSubmit(values);
      onClose();
    } catch {
      setError(t(language, 'common.saveError'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.screen}>
        <PaperTexture />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t(language, 'common.closeForm')} onPress={onClose} style={styles.close}>
              <Feather name="x" size={21} color={colors.coralDark} />
            </Pressable>
          </View>

          {fields.map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              {field.type === 'date' || field.type === 'datetime-local' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPicker({ field, draft: parsePickerDate(values[field.key], field.type) })}
                  style={styles.dateButton}
                >
                  <Feather name="calendar" size={18} color={colors.coralDark} />
                  <Text style={[styles.dateButtonText, !values[field.key] && styles.placeholderText]}>
                    {values[field.key]
                      ? field.type === 'date'
                        ? formatDateLabel(values[field.key], language)
                        : formatDateTimeLabel(values[field.key], language)
                      : field.placeholder ?? t(language, 'common.chooseDate')}
                  </Text>
                </Pressable>
              ) : field.type === 'select' || field.type === 'boolean' ? (
                <View style={styles.optionWrap}>
                  {optionsFor(field, language).map((option) => {
                    const active = (values[field.key] ?? '') === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        onPress={() => setValues((current) => ({ ...current, [field.key]: option.value }))}
                        style={[styles.option, active && styles.optionActive]}
                      >
                        <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  multiline={field.multiline}
                  onChangeText={(text) => setValues((current) => ({ ...current, [field.key]: text }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedInk}
                  style={[styles.input, field.multiline && styles.multiline]}
                  value={values[field.key] ?? ''}
                />
              )}
            </View>
          ))}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable accessibilityRole="button" onPress={submit} style={styles.submit}>
            <Text style={styles.submitText}>{submitLabel ?? t(language, 'common.save')}</Text>
          </Pressable>
        </ScrollView>

        <DateTimePickerSheet
          picker={picker}
          onClose={() => setPicker(null)}
          onChangeDraft={(draft) => setPicker((current) => (current ? { ...current, draft } : current))}
          onSave={() => {
            if (!picker) return;
            const nextValue = picker.field.type === 'date' ? formatDateValue(picker.draft) : formatDateTimeValue(picker.draft);
            setValues((current) => ({ ...current, [picker.field.key]: nextValue }));
            setPicker(null);
          }}
          language={language}
        />
      </View>
    </Modal>
  );
}

function DateTimePickerSheet({
  picker,
  onClose,
  onChangeDraft,
  onSave,
  language,
}: {
  picker: PickerState | null;
  onClose: () => void;
  onChangeDraft: (date: Date) => void;
  onSave: () => void;
  language: AppLanguage;
}) {
  const calendarCells = useMemo(() => (picker ? buildCalendarCells(picker.draft) : []), [picker]);
  if (!picker) return null;

  const monthLabel = new Intl.DateTimeFormat(localeFor(language), { month: 'long', year: 'numeric' }).format(picker.draft);
  const showTime = picker.field.type === 'datetime-local';

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.pickerBackdrop}>
        <View style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{picker.field.label}</Text>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.close}>
              <Feather name="x" size={21} color={colors.coralDark} />
            </Pressable>
          </View>

          <View style={styles.monthRow}>
            <Pressable accessibilityRole="button" onPress={() => onChangeDraft(addMonths(picker.draft, -1))} style={styles.monthButton}>
              <Feather name="chevron-left" size={20} color={colors.coralDark} />
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable accessibilityRole="button" onPress={() => onChangeDraft(addMonths(picker.draft, 1))} style={styles.monthButton}>
              <Feather name="chevron-right" size={20} color={colors.coralDark} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {(language === 'es' ? ['D', 'L', 'M', 'X', 'J', 'V', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S']).map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.dayGrid}>
            {calendarCells.map((cell, index) =>
              cell ? (
                <Pressable
                  key={cell.toISOString()}
                  accessibilityRole="button"
                  onPress={() => onChangeDraft(withDate(picker.draft, cell))}
                  style={[styles.dayCell, sameDate(cell, picker.draft) && styles.dayCellActive]}
                >
                  <Text style={[styles.dayText, sameDate(cell, picker.draft) && styles.dayTextActive]}>{cell.getDate()}</Text>
                </Pressable>
              ) : (
                <View key={`empty-${index}`} style={styles.dayCell} />
              ),
            )}
          </View>

          {showTime ? (
            <View style={styles.timePicker}>
              <Text style={styles.label}>{t(language, 'common.time')}</Text>
              <View style={styles.timeRow}>
                <StepperButton label="- hour" onPress={() => onChangeDraft(addHours(picker.draft, -1))} />
                <Text style={styles.timeValue}>{formatTimeValue(picker.draft)}</Text>
                <StepperButton label="+ hour" onPress={() => onChangeDraft(addHours(picker.draft, 1))} />
              </View>
              <View style={styles.timeRow}>
                <StepperButton label="-15 min" onPress={() => onChangeDraft(addMinutes(picker.draft, -15))} />
                <Text style={styles.timeHint}>{t(language, 'common.adjustMinutes')}</Text>
                <StepperButton label="+15 min" onPress={() => onChangeDraft(addMinutes(picker.draft, 15))} />
              </View>
            </View>
          ) : null}

          <Pressable accessibilityRole="button" onPress={onSave} style={styles.submit}>
            <Text style={styles.submitText}>{t(language, 'common.useThisDate')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.stepperButton}>
      <Text style={styles.stepperText}>{label}</Text>
    </Pressable>
  );
}

function optionsFor(field: FormField, language: AppLanguage): Array<{ label: string; value: string }> {
  if (field.type === 'boolean') {
    return [
      { label: t(language, 'common.yes'), value: 'yes' },
      { label: t(language, 'common.no'), value: 'no' },
    ];
  }

  return (field.options ?? []).map((option) => (typeof option === 'string' ? { label: option, value: option } : option));
}

const pad = (value: number) => String(value).padStart(2, '0');

function parsePickerDate(value: string | undefined, type: FormField['type']) {
  if (value) {
    const normalized = type === 'datetime-local' && value.length === 16 ? `${value}:00` : value;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateTimeValue(date: Date) {
  return `${formatDateValue(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

function formatDateLabel(value: string, language: AppLanguage) {
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(localeFor(language), { day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
}

function formatDateTimeLabel(value: string, language: AppLanguage) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(localeFor(language), {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function formatTimeValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildCalendarCells(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1, date.getHours(), date.getMinutes());
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = Array.from({ length: first.getDay() }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day, date.getHours(), date.getMinutes()));
  }
  return cells;
}

function sameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function withDate(base: Date, nextDate: Date) {
  const next = new Date(base);
  next.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  return next;
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function addHours(date: Date, amount: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + amount);
  return next;
}

function addMinutes(date: Date, amount: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + amount);
  return next;
}

const styles = StyleSheet.create({
  close: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 58,
  },
  dateButton: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dateButtonText: {
    color: colors.ink,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '800',
  },
  error: {
    color: colors.coralDark,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  multiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  option: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  optionActive: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  optionText: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: colors.white,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 10,
    height: 39,
    justifyContent: 'center',
    width: '14.28%',
  },
  dayCellActive: {
    backgroundColor: colors.coral,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  dayText: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '800',
  },
  dayTextActive: {
    color: colors.white,
  },
  monthButton: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  monthLabel: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '900',
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pickerBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(47, 35, 24, 0.28)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  pickerCard: {
    backgroundColor: colors.cream,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 390,
    padding: spacing.lg,
    width: '100%',
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pickerTitle: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '900',
  },
  placeholderText: {
    color: colors.mutedInk,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderRadius: 16,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  submitText: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '900',
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 92,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  stepperText: {
    color: colors.coralDark,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '900',
  },
  timeHint: {
    color: colors.mutedInk,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '800',
  },
  timePicker: {
    marginBottom: spacing.md,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  timeValue: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '900',
  },
  title: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 34,
    fontWeight: '900',
  },
  weekDay: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    width: '14.28%',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
});
