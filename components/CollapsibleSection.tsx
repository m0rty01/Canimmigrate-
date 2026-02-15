import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { colors } = useTheme();
  const rotateAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} style={styles.header} activeOpacity={0.7}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color={colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  content: {
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
});
