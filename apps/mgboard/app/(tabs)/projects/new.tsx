import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProjectForm } from '../../../src/components/forms/ProjectForm';
import { colors } from '../../../src/theme';
import { getTabBarReservedHeight } from '../../../src/utils/safeArea';
import * as ProjectService from '../../../src/services/projects';
import type { ProjectCreate } from '../../../src/types';

export default function NewProjectScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const handleSubmit = async (data: ProjectCreate) => {
    await ProjectService.createProject(data);
    router.back();
  };

  const contentBottomPadding = getTabBarReservedHeight(tabBarHeight, insets.bottom, width);

  return (
    <View style={[styles.container, { paddingBottom: contentBottomPadding }]}>
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        submitLabel="Create Project"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
