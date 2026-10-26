import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const EmptyState = ({ message }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/empty.png")} // تأكد من اسم الصورة والمسار
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 40,
  },
  image: {
    width: 250,
    height: 250,
  },
  message: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    fontFamily: "CairoBold",
  },
});

export default EmptyState;
