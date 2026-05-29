import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { EmptyState } from '../components/EmptyState';
import { EntityFormModal } from '../components/EntityFormModal';
import { PaperCard } from '../components/PaperCard';
import { PaperTexture } from '../components/PaperTexture';
import { colors, fonts, spacing } from '../theme';
import type { Birthday, FamilyMember, MomPersonality } from '../types';
import { confirmDestructive } from '../utils/confirm';

type Props = {
  birthdays: Birthday[];
  familyMembers: FamilyMember[];
  personality: MomPersonality;
  onSaveBirthday: (birthday: Omit<Birthday, 'id'> & { id?: string }) => void;
  onDeleteBirthday: (id: string) => void;
  onSaveFamilyMember: (member: Omit<FamilyMember, 'id'> & { id?: string }) => void;
  onDeleteFamilyMember: (id: string) => void;
};

type FormState = { type: 'family'; member?: FamilyMember } | { type: 'birthday'; birthday?: Birthday } | null;

export function FamilyScreen({
  birthdays,
  familyMembers,
  personality,
  onSaveBirthday,
  onDeleteBirthday,
  onSaveFamilyMember,
  onDeleteFamilyMember,
}: Props) {
  const [form, setForm] = useState<FormState>(null);

  return (
    <View style={styles.screen}>
      <PaperTexture />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>Family Board</Text>
            <Text style={styles.subtitle}>The people MOM keeps close.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setForm({ type: 'family' })} style={styles.addButton}>
            <Feather name="plus" size={22} color={colors.white} />
          </Pressable>
        </View>

        {familyMembers.length === 0 ? (
          <EmptyState kind="family" tone={personality} />
        ) : null}

        {familyMembers.map((member, index) => (
          <PaperCard
            key={member.id}
            pinned={index === 0}
            tapeColor={index === 1 ? colors.teal : colors.beige}
            backgroundColor={index === 0 ? '#FFF1CD' : colors.paper}
            style={styles.card}
          >
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Feather name={index === 0 ? 'gift' : index === 1 ? 'coffee' : 'heart'} size={30} color={colors.coral} />
              </View>
              <Pressable style={styles.copy} onPress={() => setForm({ type: 'family', member })}>
                <Text style={styles.name}>{member.name}</Text>
                <Text style={styles.relationship}>{member.relationship}</Text>
                {member.careNote ? <Text style={styles.note}>{member.careNote}</Text> : null}
                {member.notes ? <Text style={styles.note}>{member.notes}</Text> : null}
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDestructive('Delete family member?', `Remove "${member.name}" from the board?`, () =>
                    onDeleteFamilyMember(member.id),
                  )
                }
              >
                <Feather name="trash-2" size={19} color={colors.coral} />
              </Pressable>
            </View>
            {member.favoriteThings ? (
              <View style={styles.tags}>
                {member.favoriteThings.map((thing) => (
                  <Text key={thing} style={styles.tag}>
                    {thing}
                  </Text>
                ))}
              </View>
            ) : null}
          </PaperCard>
        ))}

        <View style={styles.birthdayHeader}>
          <Text style={styles.sectionTitle}>Birthdays</Text>
          <Pressable accessibilityRole="button" onPress={() => setForm({ type: 'birthday' })}>
            <Feather name="plus-circle" size={24} color={colors.coral} />
          </Pressable>
        </View>
        {birthdays.length === 0 ? <EmptyState kind="birthdays" tone={personality} /> : null}
        {birthdays.map((birthday) => (
          <PaperCard key={birthday.id} backgroundColor="#FFF1CD" style={styles.card}>
            <View style={styles.row}>
              <Pressable style={styles.copy} onPress={() => setForm({ type: 'birthday', birthday })}>
                <Text style={styles.name}>{birthday.name}</Text>
                <Text style={styles.relationship}>{birthday.relationship}</Text>
                <Text style={styles.note}>{birthday.date}</Text>
                {birthday.note ? <Text style={styles.note}>{birthday.note}</Text> : null}
                {birthday.giftIdea ? <Text style={styles.note}>Gift idea: {birthday.giftIdea}</Text> : null}
                {birthday.favoriteCakeOrTreat ? <Text style={styles.note}>Treat: {birthday.favoriteCakeOrTreat}</Text> : null}
              </Pressable>
              <Pressable
                onPress={() =>
                  confirmDestructive('Delete birthday?', `Remove "${birthday.name}" from birthday reminders?`, () =>
                    onDeleteBirthday(birthday.id),
                  )
                }
              >
                <Feather name="trash-2" size={19} color={colors.coral} />
              </Pressable>
            </View>
          </PaperCard>
        ))}
      </ScrollView>

      <EntityFormModal
        visible={form !== null}
        title={form?.type === 'birthday' ? (form.birthday ? 'Edit Birthday' : 'Add Birthday') : form?.member ? 'Edit Person' : 'Add Person'}
        fields={
          form?.type === 'birthday'
            ? [
                { key: 'name', label: 'Name', required: true, placeholder: 'Noah' },
                { key: 'date', label: 'Date', required: true, type: 'date', placeholder: 'Choose date' },
                { key: 'relationship', label: 'Relationship', placeholder: 'nephew' },
                { key: 'giftIdea', label: 'Gift idea', placeholder: 'Art kit' },
                { key: 'favoriteCakeOrTreat', label: 'Favorite treat', placeholder: 'Chocolate cake' },
                { key: 'note', label: 'Note', multiline: true, placeholder: 'Favorite cake, gift idea, etc.' },
              ]
            : [
                { key: 'name', label: 'Name', required: true, placeholder: 'Emma' },
                { key: 'relationship', label: 'Relationship', required: true, placeholder: 'Friend' },
                { key: 'birthday', label: 'Birthday', type: 'date', placeholder: 'Choose date' },
                { key: 'favoriteThings', label: 'Favorite things', placeholder: 'Coffee, flowers' },
                { key: 'careNote', label: 'Care note', multiline: true, placeholder: 'Lunch today at 12:30.' },
                { key: 'notes', label: 'Notes', multiline: true, placeholder: 'Anything MOM should remember later.' },
              ]
        }
        initialValues={
          form?.type === 'birthday'
            ? {
                name: form.birthday?.name ?? '',
                date: form.birthday?.date ?? '',
                relationship: form.birthday?.relationship ?? '',
                giftIdea: form.birthday?.giftIdea ?? '',
                favoriteCakeOrTreat: form.birthday?.favoriteCakeOrTreat ?? '',
                note: form.birthday?.note ?? '',
              }
            : {
                name: form?.member?.name ?? '',
                relationship: form?.member?.relationship ?? '',
                birthday: form?.member?.birthday ?? '',
                favoriteThings: form?.member?.favoriteThings?.join(', ') ?? '',
                careNote: form?.member?.careNote ?? '',
                notes: form?.member?.notes ?? '',
              }
        }
        onClose={() => setForm(null)}
        onSubmit={(values) => {
          if (form?.type === 'birthday') {
            onSaveBirthday({
              id: form.birthday?.id,
              name: values.name.trim(),
              date: values.date.trim(),
              relationship: values.relationship.trim() || 'family',
              note: values.note?.trim() || undefined,
              giftIdea: values.giftIdea?.trim() || undefined,
              favoriteCakeOrTreat: values.favoriteCakeOrTreat?.trim() || undefined,
            });
          } else {
            onSaveFamilyMember({
              id: form?.member?.id,
              name: values.name.trim(),
              relationship: values.relationship.trim(),
              birthday: values.birthday?.trim() || undefined,
              favoriteThings: values.favoriteThings
                ?.split(',')
                .map((thing) => thing.trim())
                .filter(Boolean),
              careNote: values.careNote?.trim() || undefined,
              notes: values.notes?.trim() || undefined,
            });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.coral,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
    width: 36,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F8DE9F',
    borderColor: colors.paper,
    borderRadius: 32,
    borderWidth: 3,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  birthdayHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: 58,
  },
  copy: {
    flex: 1,
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
  name: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '900',
  },
  note: {
    color: colors.coralDark,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  relationship: {
    color: colors.mutedInk,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  screen: {
    backgroundColor: colors.cream,
    flex: 1,
  },
  sectionTitle: {
    color: colors.coralDark,
    fontFamily: fonts.label,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: colors.blueDeep,
    fontFamily: fonts.script,
    fontSize: 27,
  },
  tag: {
    backgroundColor: '#E7D7B8',
    borderRadius: 12,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  title: {
    color: colors.coral,
    fontFamily: fonts.display,
    fontSize: 42,
    fontWeight: '900',
  },
});
