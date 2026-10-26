import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View, useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

const WelcomeScreen = () => {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme];
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: "#003366" }]}>
      <Image
        source={require("../assets/images/Fan-alfaisal-removebg-preview-.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 200, // عرض الصورة (يمكنك تعديل الحجم حسب الحاجة)
    height: 200, // ارتفاع الصورة
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    fontFamily: "CairoBold", // Applied CairoBold for the welcome text.
  },
});

export default WelcomeScreen;
