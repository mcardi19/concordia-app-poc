import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/design-system';
import { MaterialSymbol, msLock, msPhotoCamera } from '@/components/icons';
import { radiusStyle, useTheme } from '@/design-system/theme';
import { useMeTheme } from '@/screens/me/meTheme';
import type { StudentProfile } from '@/types/profile';
import { MeBottomSheet } from './MeBottomSheet';

/** One editable value. `locked` fields come from the student record. */
type ProfileField = {
  id: string;
  label: string;
  value: string;
  locked?: boolean;
  hint?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

type Props = {
  visible: boolean;
  profile: StudentProfile;
  onClose: () => void;
  /** Receives the edited values; the drawer closes itself afterwards. */
  onSave?: (values: Record<string, string>) => void;
};

/**
 * 05r · Edit profile, as a drawer rather than a pushed screen.
 *
 * Editing three or four contact details is a detour from the Me page, not a
 * destination — a sheet keeps the page underneath and makes dismissing the
 * cheaper gesture, which is the right default when most opens end in "never
 * mind".
 */
export function EditProfileDrawer({ visible, profile, onClose, onSave }: Props) {
  const theme = useTheme();
  const me = useMeTheme();

  const fields: ProfileField[] = useMemo(
    () => [
      {
        id: 'legalName',
        label: 'Legal name',
        value: profile.displayName,
        locked: true,
        hint: 'From your student record — contact the Registrar to change.',
      },
      { id: 'preferredName', label: 'Preferred name', value: profile.displayName.split(/\s+/)[0] ?? '' },
      { id: 'pronouns', label: 'Pronouns', value: 'she/her' },
      {
        id: 'email',
        label: 'Preferred email',
        value: 'maya.okonkwo@mail.concordia.ca',
        keyboardType: 'email-address',
      },
      { id: 'mobile', label: 'Mobile', value: '+1 (514) 555-0142', keyboardType: 'phone-pad' },
      { id: 'emergency', label: 'Emergency contact', value: 'A. Okonkwo · +1 (416) 555-0199' },
    ],
    [profile.displayName],
  );

  const [values, setValues] = useState<Record<string, string>>({});

  const valueFor = (field: ProfileField) => values[field.id] ?? field.value;

  const save = () => {
    onSave?.(Object.fromEntries(fields.map((f) => [f.id, valueFor(f)])));
    onClose();
  };

  const initials = profile.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <MeBottomSheet
      visible={visible}
      title="Edit profile"
      onClose={onClose}
      trailing={
        <Pressable onPress={save} accessibilityRole="button" accessibilityLabel="Save profile" hitSlop={8}>
          <Text variant="body" style={[styles.save, { color: theme.color.primary }]}>
            Save
          </Text>
        </Pressable>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* Avatar */}
        <View style={styles.avatarBlock}>
          <View>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.color.primary, borderColor: me.cardBorder },
              ]}
            >
              <Text variant="heading2" style={styles.avatarText}>
                {initials}
              </Text>
            </View>
            <View
              style={[
                styles.cameraBadge,
                { backgroundColor: theme.color.primary, borderColor: me.cardBackground },
              ]}
            >
              <MaterialSymbol icon={msPhotoCamera} size={14} color="#FFFFFF" />
            </View>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="Change photo" hitSlop={8}>
            <Text variant="bodySmall" style={[styles.changePhoto, { color: theme.color.primary }]}>
              Change photo
            </Text>
          </Pressable>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          {fields.map((field) => (
            <View key={field.id}>
              <Text variant="caption" style={[styles.fieldLabel, { color: me.metaText }]}>
                {field.label}
              </Text>

              <View
                style={[
                  styles.field,
                  radiusStyle(8),
                  { backgroundColor: me.pageBackground, borderColor: me.fieldBorder },
                ]}
              >
                {field.locked ? (
                  /* Read-only: a disabled input still reads as a text box you
                     could type into, which this is not. */
                  <Text
                    variant="body"
                    numberOfLines={1}
                    style={[styles.fieldValue, { color: me.metaText }]}
                  >
                    {field.value}
                  </Text>
                ) : (
                  <TextInput
                    value={valueFor(field)}
                    onChangeText={(next) => setValues((prev) => ({ ...prev, [field.id]: next }))}
                    keyboardType={field.keyboardType ?? 'default'}
                    autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'sentences'}
                    accessibilityLabel={field.label}
                    placeholderTextColor={me.metaText}
                    style={[styles.fieldValue, styles.input, { color: me.headingText }]}
                  />
                )}

                {field.locked ? (
                  <MaterialSymbol icon={msLock} size={14} color={me.metaText} />
                ) : null}
              </View>

              {field.hint ? (
                <Text variant="caption" style={[styles.fieldHint, { color: me.metaText }]}>
                  {field.hint}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </MeBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
  save: {
    fontSize: 14,
    fontWeight: '700',
  },
  avatarBlock: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderCurve: 'continuous',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderCurve: 'continuous',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 12,
  },
  fields: {
    gap: 16,
    paddingTop: 22,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    /** Vertical padding lives on the input so its text box fills the row. */
    minHeight: 46,
  },
  fieldValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
  },
  input: {
    paddingVertical: 13,
  },
  fieldHint: {
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 5,
    marginLeft: 2,
  },
});
