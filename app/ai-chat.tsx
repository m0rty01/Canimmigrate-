import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react-native';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import { useTheme } from '@/providers/ThemeProvider';
import { useUser } from '@/providers/UserProvider';

interface MessagePart {
  type: string;
  text?: string;
  toolName?: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

interface ChatMessage {
  id: string;
  role: string;
  parts: MessagePart[];
}

const SYSTEM_PROMPT = `You are CanImmigrate+ AI Assistant, an expert on Canadian immigration. You help users understand:
- Express Entry (Federal Skilled Worker, Canadian Experience Class, Federal Skilled Trades)
- Provincial Nominee Programs (PNPs) for all provinces
- Rural Community Immigration Pilot (RCIP)
- Study permits, work permits, visitor visas
- CRS score optimization strategies
- Document preparation and application steps
- Processing times and fees
- Language test requirements (IELTS, CELPIP, TEF, TCF)

Be helpful, accurate, and concise. Always mention that your advice is informational and not legal counsel. If unsure, recommend consulting an RCIC (Regulated Canadian Immigration Consultant) or lawyer.

When the user has profile data, use it to give personalized advice.`;

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { profile, crsBreakdown } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const profileContext = profile.profileCompleted
    ? `\n\nUser profile: Age ${profile.age}, Education: ${profile.education}, CRS Score: ${crsBreakdown.total}, Work Experience (Canada): ${profile.canadianWorkExperience} years, Foreign Work Experience: ${profile.foreignWorkExperience} years, Marital Status: ${profile.maritalStatus}, Has Job Offer: ${profile.hasJobOffer}, Has PNP: ${profile.hasPNP}.`
    : '';

  const { messages, sendMessage, error } = useRorkAgent({
    tools: {},
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    console.log('[AI Chat] Sending message:', trimmed);
    const isFirstMessage = messages.length === 0;
    const messageToSend = isFirstMessage
      ? `${SYSTEM_PROMPT}${profileContext}\n\nUser question: ${trimmed}`
      : trimmed;
    sendMessage(messageToSend);
    setInput('');
  }, [input, sendMessage, messages.length, profileContext]);

  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].parts.some((p: MessagePart) => p.type === 'text' && p.text === '');

  const suggestedQuestions = [
    'How can I improve my CRS score?',
    'What are the PNP options for me?',
    'Express Entry steps explained',
    'IELTS vs CELPIP: which is better?',
  ];

  const renderMessage = useCallback((msg: ChatMessage, index: number) => {
    const isUser = msg.role === 'user';
    const isAssistant = msg.role === 'assistant';

    return (
      <View
        key={msg.id || index}
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        {isAssistant && (
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Bot size={16} color={colors.textLight} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: colors.primary }]
              : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
          ]}
        >
          {msg.parts.map((part: MessagePart, i: number) => {
            if (part.type === 'text' && part.text) {
              return (
                <Text
                  key={`${msg.id}-${i}`}
                  style={[
                    styles.messageText,
                    isUser ? { color: colors.textLight } : { color: colors.text },
                  ]}
                >
                  {part.text}
                </Text>
              );
            }
            if (part.type === 'tool') {
              return (
                <View key={`${msg.id}-${i}`} style={[styles.toolIndicator, { backgroundColor: colors.infoLight }]}>
                  <Text style={[styles.toolText, { color: colors.info }]}>
                    {part.state === 'output-available' ? 'Processed' : 'Processing...'}
                  </Text>
                </View>
              );
            }
            return null;
          })}
        </View>
        {isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <User size={16} color={colors.textLight} />
          </View>
        )}
      </View>
    );
  }, [colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="chat-back-btn">
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
            <Sparkles size={16} color={colors.textLight} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Immigration guidance</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          testID="chat-messages"
        >
          {messages.length === 0 && (
            <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
                <Bot size={36} color={colors.textLight} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Ask me anything about{'\n'}Canadian immigration
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                I can help with Express Entry, PNPs, study/work permits, CRS optimization, and more.
              </Text>
              <View style={styles.suggestions}>
                {suggestedQuestions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => {
                      sendMessage(q);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.suggestionText, { color: colors.primary }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {messages.map((msg, idx) => renderMessage(msg as ChatMessage, idx))}

          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                Something went wrong. Please try again.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surfaceAlt, color: colors.text, borderColor: colors.border }]}
            placeholder="Ask about immigration..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={2000}
            testID="chat-input"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: input.trim() ? colors.primary : colors.surfaceAlt },
            ]}
            onPress={handleSend}
            disabled={!input.trim()}
            activeOpacity={0.7}
            testID="chat-send-btn"
          >
            <Send size={20} color={input.trim() ? colors.textLight : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    lineHeight: 28,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 28,
  },
  suggestions: {
    gap: 10,
    width: '100%',
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  toolIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  errorContainer: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center' as const,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
});
