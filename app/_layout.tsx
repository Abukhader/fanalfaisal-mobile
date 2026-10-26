import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, I18nManager, View } from 'react-native';
import i18n from '../i18n';
import FlashMessage from 'react-native-flash-message';
import OfflineNotice from '../components/OfflineNotice';

// 0. ✨ إيقاف سجلات الطباعة في كونسول الإنتاج لزيادة الأمان وتحسين الأداء
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// 1. ✨ إيقاف الـ RTL هنا في النطاق العام (Global Scope) ليعمل قبل بناء مكونات React
if (I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { i18n: i18nInstance } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  
  // تحميل الخطوط
  const [fontsLoaded] = useFonts({
    Cairo: require('../assets/fonts/Cairo-VariableFont_slnt,wght.ttf'),
    CairoBold: require('../assets/fonts/Cairo-Bold.ttf'),
  });

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // 2. ✨ معالجة حلقة التحديث اللانهائية وتجنب الانهيار في Expo Go
        if (I18nManager.isRTL) {
          const hasReloaded = await AsyncStorage.getItem('hasReloadedForRTL');
          
          if (!hasReloaded) {
            // نضع علامة أننا قمنا بمحاولة إعادة التشغيل لمنع الحلقة اللانهائية
            await AsyncStorage.setItem('hasReloadedForRTL', 'true');
            
            if (!__DEV__) {
              // إذا كنا في التطبيق الحقيقي (Production)، أعد التشغيل
              await Updates.reloadAsync();
              return; // إيقاف التنفيذ لانتظار إعادة التشغيل
            } else {
              // إذا كنا في بيئة التطوير (Expo Go)، لا تستخدم دالة التحديث لأنها تسبب خطأ
              console.warn("أنت في Expo Go. يرجى إعادة تحميل التطبيق يدوياً (عبر الضغط على 'r' في سطر الأوامر).");
            }
          }
        } else {
          // بمجرد أن تصبح الحالة LTR بنجاح، نقوم بتنظيف المتغير للمرات القادمة
          await AsyncStorage.removeItem('hasReloadedForRTL');
        }

        // 3. جلب اللغة المخزنة وتفعيلها في i18next
        const savedLang = await AsyncStorage.getItem('user-language');
        if (savedLang) {
          await i18n.changeLanguage(savedLang);
        } else {
          await i18n.changeLanguage('ar');
        }

        setIsReady(true);
      } catch (error) {
        console.error("Error during app preparation:", error);
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!fontsLoaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#003366' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="LoginPromptPage" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="MaidDetails" />
        <Stack.Screen name="OrderDetails/[orderId]" />
        <Stack.Screen name="cleaning" />
        <Stack.Screen name="monthlyContracts" />
        <Stack.Screen name="hourlyServices" />
        <Stack.Screen name="recruitment" />
        <Stack.Screen name="PaymentScreen" />
        <Stack.Screen name="payment-webview" />
        <Stack.Screen name="HandoverScreen" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
      <FlashMessage position="top" />
      <OfflineNotice />
    </ThemeProvider>
  );
}