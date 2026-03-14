import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image, Dimensions } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeColors } from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

interface CustomSplashScreenProps {
  onFinish?: () => void;
}

export default function CustomSplashScreen({
  onFinish,
}: CustomSplashScreenProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Animation values for three expanding rings
  const ring1Scale = useRef(new Animated.Value(0.5)).current;
  const ring1Opacity = useRef(new Animated.Value(0.8)).current;

  const ring2Scale = useRef(new Animated.Value(0.5)).current;
  const ring2Opacity = useRef(new Animated.Value(0.8)).current;

  const ring3Scale = useRef(new Animated.Value(0.5)).current;
  const ring3Opacity = useRef(new Animated.Value(0.8)).current;

  // Fade out the entire splash screen at the end
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const createRingAnimation = (
    scaleVal: Animated.Value,
    opacityVal: Animated.Value,
    delay: number,
  ) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(scaleVal, {
          toValue: 0.5,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityVal, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scaleVal, {
            toValue: 4,
            duration: 1200, // Much faster ring expansion
            useNativeDriver: true,
          }),
          Animated.timing(opacityVal, {
            toValue: 0,
            duration: 1200, // Much faster fade out
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
  };

  useEffect(() => {
    // Start pulsing loops with staggered delays
    const anim1 = createRingAnimation(ring1Scale, ring1Opacity, 0);
    const anim2 = createRingAnimation(ring2Scale, ring2Opacity, 400); // Tighter stagger
    const anim3 = createRingAnimation(ring3Scale, ring3Opacity, 800);

    anim1.start();
    anim2.start();
    anim3.start();

    // After just 1.5 seconds, quickly fade out the splash screen
    const timeout = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 300, // Faster fade
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1500); // 1.5 seconds

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.centerContainer}>
        {/* Animated Rings */}
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ring2Scale }],
              opacity: ring2Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ring3Scale }],
              opacity: ring3Opacity,
            },
          ]}
        />

        {/* Static Rounded Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo-rounded.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  ring: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.primaryLight,
    zIndex: 1,
  },
});
