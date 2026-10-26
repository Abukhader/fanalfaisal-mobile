// components/locationComponents/LocationPickerModal.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { WebView } from "react-native-webview";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { updateClientLocation } from "../../app/Api/LocationService";

const showAlert = (message, type = "info", title = "تنبيه") => {
  showMessage({
    message: title,
    description: String(message || ""),
    type: type,
    icon: type,
    duration: 4000,
  });
};

const LocationPickerModal = ({
  visible,
  onClose,
  initialLat,
  initialLng,
  initialAddress = "",
  initialDistrict = "",
  autoLocateOnOpen,
  onLocationSaved,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const webViewRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const reverseGeocodeTimeoutRef = useRef(null);
  const isMapReadyRef = useRef(false);
  const pendingCoordsRef = useRef(null);

  // Default coordinate: Riyadh
  const [latitude, setLatitude] = useState(initialLat || 24.7136);
  const [longitude, setLongitude] = useState(initialLng || 46.6753);
  const [district, setDistrict] = useState(initialDistrict);
  const [address, setAddress] = useState(initialAddress);
  const [isLocating, setIsLocating] = useState(false);
  const [locatingStatusText, setLocatingStatusText] = useState("");
  const [saving, setSaving] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Derived: check if an actual saved location exists
  const hasSavedLocation = Boolean(
    initialLat &&
      initialLng &&
      !(Number(initialLat) === 24.7136 && Number(initialLng) === 46.6753)
  );

  // Search Bar States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Helper to move marker and update coordinates
  const updateMapCoordinates = (newLat, newLng, animate = true) => {
    setLatitude(newLat);
    setLongitude(newLng);
    pendingCoordsRef.current = { lat: newLat, lng: newLng };

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.setMarkerLocation) {
          window.setMarkerLocation(${newLat}, ${newLng}, ${animate});
        }
        true;
      `);
    }
  };

  // Reverse geocoding: convert (lat, lng) to human-readable address & district in Arabic
  const reverseGeocode = async (lat, lng, forceUpdate = false) => {
    if (!lat || !lng || (lat === 0 && lng === 0)) return;
    setIsResolvingAddress(true);

    let resolvedDistrict = "";
    let resolvedAddress = "";
    let isSuccess = false;

    // 1. Primary: Native OS Geocoder (Apple Maps on iOS / Google Geocoder on Android)
    // Instant, offline-capable, highly accurate, and cannot be blocked by HTTP rate-limits
    try {
      const places = await Location.reverseGeocodeAsync({
        latitude: Number(lat),
        longitude: Number(lng),
      });

      if (places && places.length > 0) {
        const place = places[0];
        resolvedDistrict =
          place.district ||
          place.subregion ||
          place.city ||
          place.region ||
          "";

        const streetParts = [place.street, place.name]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i);

        let streetDesc = streetParts.join(" ").trim();
        if (place.streetNumber && streetDesc && !streetDesc.includes(place.streetNumber)) {
          streetDesc += ` ${place.streetNumber}`;
        }

        if (streetDesc) {
          resolvedAddress = streetDesc + (resolvedDistrict && !streetDesc.includes(resolvedDistrict) ? `، ${resolvedDistrict}` : "");
        } else if (resolvedDistrict) {
          resolvedAddress = resolvedDistrict;
        }

        if (resolvedDistrict || resolvedAddress) {
          isSuccess = true;
        }
      }
    } catch (nativeErr) {
      console.warn("Native reverseGeocodeAsync note:", nativeErr);
    }

    // 2. Fallback: OpenStreetMap Nominatim
    if (!isSuccess) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=ar`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "FanAlFaisalApp/2.0 (info@fanalfisal.com.sa)",
          },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            resolvedDistrict =
              addr.suburb ||
              addr.neighbourhood ||
              addr.quarter ||
              addr.residential ||
              addr.city_district ||
              addr.district ||
              addr.village ||
              addr.city ||
              "";
            const discoveredRoad = addr.road || addr.street || addr.pedestrian || addr.footway || "";

            if (discoveredRoad) {
              resolvedAddress = discoveredRoad + (resolvedDistrict ? `، ${resolvedDistrict}` : "");
            } else if (data.display_name) {
              const parts = (data.display_name || "").split(",");
              resolvedAddress = parts.slice(0, 3).join(", ").trim();
            } else if (resolvedDistrict) {
              resolvedAddress = resolvedDistrict;
            }

            if (resolvedDistrict || resolvedAddress) {
              isSuccess = true;
            }
          }
        }
      } catch (e) {
        console.warn("Reverse geocode fallback error:", e);
      }
    }

    // Apply discovered address to state (always updates when moving pin/forceUpdate is true)
    if (resolvedDistrict) {
      setDistrict((prev) => (forceUpdate || !prev ? resolvedDistrict : prev));
    }
    if (resolvedAddress) {
      setAddress((prev) => (forceUpdate || !prev ? resolvedAddress : prev));
    }

    setIsResolvingAddress(false);
  };

  // Native GPS location detection using expo-location
  const getCurrentLocation = useCallback(async (isAutoTrigger = false) => {
    try {
      setIsLocating(true);
      setLocatingStatusText(t("location.auto_detecting", "جاري تحديد موقعك الجغرافي تلقائياً..."));

      // 1. Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLocating(false);
        setLocatingStatusText("");
        if (!isAutoTrigger) {
          showAlert(
            t(
              "location.permission_denied",
              "يرجى السماح للتطبيق بالوصول إلى موقعك لتحديد عنوانك تلقائياً."
            ),
            "warning",
            t("common.alert", "تنبيه")
          );
        }
        return;
      }

      // 2. Check if device location services (GPS) are turned on
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setIsLocating(false);
        setLocatingStatusText("");
        if (!isAutoTrigger) {
          showAlert(
            t(
              "location.services_disabled",
              "يرجى تفعيل خدمة الموقع (GPS) في إعدادات هاتفك لتحديد مكانك بدقة."
            ),
            "warning",
            t("common.alert", "تنبيه")
          );
        }
        return;
      }

      // 3. Fast response: get last known position first
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({});
        if (lastKnown && lastKnown.coords) {
          const { latitude: fastLat, longitude: fastLng } = lastKnown.coords;
          if (fastLat && fastLng) {
            updateMapCoordinates(fastLat, fastLng, false);
            reverseGeocode(fastLat, fastLng, true);
          }
        }
      } catch (_e) {
        // Proceed to high accuracy
      }

      // 4. High-accuracy current position
      const currentPos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 6000,
      });

      if (currentPos && currentPos.coords) {
        const { latitude: curLat, longitude: curLng } = currentPos.coords;
        updateMapCoordinates(curLat, curLng, true);
        await reverseGeocode(curLat, curLng, true);

        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_e) {}

        setLocatingStatusText(t("location.coords_ready", "تم تحديد موقعك بدقة بنجاح"));
        setTimeout(() => setLocatingStatusText(""), 2800);
      }
    } catch (err) {
      console.warn("Location detection error:", err);
      if (!isAutoTrigger) {
        showAlert(
          t(
            "location.detect_error",
            "تعذر تحديد موقعك الحالي تلقائياً. يمكنك تحريك الدبوس أو البحث بالاسم."
          ),
          "warning",
          t("common.alert", "تنبيه")
        );
      }
    } finally {
      setIsLocating(false);
    }
  }, [t]);

  // Perform search query in Saudi Arabia
  const handleSearchQueryChange = (text) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!text || text.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          text
        )}&countrycodes=sa&limit=5&accept-language=ar`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "FanAlFaisalApp/1.0 (info@fanalfisal.com.sa)",
          },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSearchResults(data);
          setShowSuggestions(true);
        } else {
          setSearchResults([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.warn("Search geocode error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  // Select a suggestion from search results
  const handleSelectSearchResult = async (item) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    setSearchQuery(item.display_name?.split(",")[0] || "");
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);

    updateMapCoordinates(newLat, newLng, true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_e) {}

    // Auto resolve detailed address
    reverseGeocode(newLat, newLng, true);
  };

  // Reset or load initial values on open + Automatic GPS detection
  useEffect(() => {
    if (visible) {
      isMapReadyRef.current = false;

      const lat = initialLat || 24.7136;
      const lng = initialLng || 46.6753;
      // Reset local modal fields to fresh initial values when opened
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLatitude(lat);
      setLongitude(lng);
      pendingCoordsRef.current = { lat, lng };
      setDistrict(initialDistrict || "");
      setAddress(initialAddress || "");
      setSearchQuery("");
      setSearchResults([]);
      setShowSuggestions(false);
      setLocatingStatusText("");

      // Automatically determine location via GPS if no saved location or explicitly requested
      const shouldAutoLocate =
        autoLocateOnOpen !== undefined ? autoLocateOnOpen : !hasSavedLocation;

      if (shouldAutoLocate) {
        getCurrentLocation(true);
      } else if (!initialDistrict && !initialAddress && lat && lng) {
        reverseGeocode(lat, lng);
      }
    }
  }, [visible, initialLat, initialLng, initialAddress, initialDistrict, autoLocateOnOpen, hasSavedLocation, getCurrentLocation]);

  // Leaflet HTML template
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .custom-pin {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pin-pulse {
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(0, 46, 90, 0.25);
            animation: pulse 2s infinite ease-out;
            top: -6px;
            left: -6px;
          }
          .pin-circle {
            position: relative;
            width: 32px;
            height: 32px;
            background: #002E5A;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          }
          .pin-circle::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          @keyframes pulse {
            0% { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .leaflet-control-attribution {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${latitude}, ${longitude}], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          var pinIcon = L.divIcon({
            className: 'custom-pin',
            html: '<div class="pin-pulse"></div><div class="pin-circle"></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          });

          var marker = L.marker([${latitude}, ${longitude}], {
            icon: pinIcon,
            draggable: true
          }).addTo(map);

          function postCoords(lat, lng, action) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: action || 'LOCATION_CHANGED',
              latitude: lat,
              longitude: lng
            }));
          }

          marker.on('dragend', function (e) {
            var position = marker.getLatLng();
            postCoords(position.lat, position.lng, 'PIN_DRAGGED');
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            postCoords(e.latlng.lat, e.latlng.lng, 'MAP_CLICKED');
          });

          window.setMarkerLocation = function(lat, lng, animate) {
            var newLatLng = new L.LatLng(lat, lng);
            marker.setLatLng(newLatLng);
            if (animate) {
              map.flyTo(newLatLng, 16, { duration: 1.2 });
            } else {
              map.panTo(newLatLng);
            }
          };

          map.whenReady(function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_READY',
              latitude: ${latitude},
              longitude: ${longitude}
            }));
          });
        </script>
      </body>
    </html>
  `;

  // Message handler from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "MAP_READY") {
        isMapReadyRef.current = true;
        if (pendingCoordsRef.current) {
          const { lat, lng } = pendingCoordsRef.current;
          webViewRef.current?.injectJavaScript(`
            if (window.setMarkerLocation) {
              window.setMarkerLocation(${lat}, ${lng}, false);
            }
            true;
          `);
        }
        return;
      }

      if (data && data.latitude && data.longitude) {
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        pendingCoordsRef.current = { lat: data.latitude, lng: data.longitude };

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

        // Debounced reverse geocoding
        if (reverseGeocodeTimeoutRef.current) clearTimeout(reverseGeocodeTimeoutRef.current);
        reverseGeocodeTimeoutRef.current = setTimeout(() => {
          reverseGeocode(data.latitude, data.longitude, true);
        }, 350);
      }
    } catch (e) {
      console.warn("Message parsing error:", e);
    }
  };

  // Save location to backend
  const handleSaveLocation = async () => {
    if (!latitude || !longitude || (latitude === 0 && longitude === 0)) {
      showAlert(
        t("location.invalid_coords", "يرجى تحديد موقع صالح على الخريطة أولاً."),
        "warning",
        t("common.alert", "تنبيه")
      );
      return;
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      showAlert(
        t("location.coords_out_of_range", "إحداثيات الموقع غير صالحة."),
        "danger",
        t("common.error", "خطأ")
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        district: (district || "").trim(),
        address: (address || "").trim(),
      };

      const res = await updateClientLocation(i18n.language, payload);

      if (res && res.success === 1) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (_e) {}

        showAlert(
          res.message || t("location.save_success", "تم حفظ وتثبيت موقع التوصيل بنجاح."),
          "success",
          t("common.success", "تم الحفظ")
        );

        if (onLocationSaved) {
          onLocationSaved({
            latitude,
            longitude,
            district: district.trim(),
            address: address.trim(),
            mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
          });
        }
        onClose();
      } else {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_e) {}
        showAlert(
          res?.message || t("location.save_failed", "فشل حفظ الموقع في الخادم."),
          "danger",
          t("common.error", "خطأ")
        );
      }
    } catch (err) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (_e) {}
      console.error("Save location error:", err);
      showAlert(
        err?.response?.data?.message || t("location.connection_error", "حدث خطأ بالاتصال أثناء حفظ الموقع."),
        "danger",
        t("common.error", "خطأ")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>
              {t("location.modal_title", "تحديد موقع التوصيل")}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t("location.modal_subtitle", "حرك الخريطة أو ابحث لتثبيت موقع الاستلام بدقة")}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Map Container Area */}
        <View style={styles.mapWrapper}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: leafletHTML }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />

          {/* Search Box on Top of Map */}
          <View style={styles.searchOverlayBox}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#64748B" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("location.search_placeholder", "ابحث باسم الحي، الشارع، أو المدينة...")}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={handleSearchQueryChange}
                returnKeyType="search"
              />
              {isSearching ? (
                <ActivityIndicator size="small" color="#002E5A" style={{ marginHorizontal: 8 }} />
              ) : searchQuery ? (
                <TouchableOpacity onPress={() => handleSearchQueryChange("")} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* GPS Status Pill / Saved Location Switcher */}
            {isLocating || locatingStatusText ? (
              <View style={styles.statusPill}>
                {isLocating && (
                  <ActivityIndicator size="small" color="#002E5A" style={{ marginHorizontal: 6 }} />
                )}
                <Text style={styles.statusPillText}>
                  {locatingStatusText || t("location.auto_detecting", "جاري تحديد موقعك الجغرافي تلقائياً...")}
                </Text>
              </View>
            ) : hasSavedLocation ? (
              <TouchableOpacity
                style={styles.savedLocationPromptChip}
                onPress={() => getCurrentLocation(false)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="crosshairs-gps" size={15} color="#002E5A" style={{ marginHorizontal: 4 }} />
                <Text style={styles.savedLocationPromptText}>
                  {t("location.saved_location", "موقعك المسجل")} • {t("location.tap_to_locate_gps", "انقر للتحديث لموقعك الحالي (GPS)")}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && searchResults.length > 0 && (
              <View style={styles.suggestionsCard}>
                <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
                  {searchResults.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSearchResult(item)}
                    >
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={18}
                        color="#002E5A"
                        style={{ marginHorizontal: 6 }}
                      />
                      <Text style={[styles.suggestionText, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>
                        {item.display_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Floating GPS Button */}
          <TouchableOpacity
            style={[styles.locateBtn, isLocating && styles.locateBtnActive]}
            onPress={() => getCurrentLocation(false)}
            disabled={isLocating}
            activeOpacity={0.8}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#002E5A" />
            ) : (
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#002E5A" />
            )}
          </TouchableOpacity>
        </View>

        {/* Bottom Details & Confirmation Card */}
        <View style={styles.bottomCard}>
          {/* Coordinates Bar */}
          <View style={styles.coordsRow}>
            <View style={styles.coordBadge}>
              <MaterialCommunityIcons name="latitude" size={14} color="#002E5A" />
              <Text style={styles.coordText}>
                {latitude ? Number(latitude).toFixed(5) : "---"}
              </Text>
            </View>
            <View style={styles.coordBadge}>
              <MaterialCommunityIcons name="longitude" size={14} color="#002E5A" />
              <Text style={styles.coordText}>
                {longitude ? Number(longitude).toFixed(5) : "---"}
              </Text>
            </View>
            {isResolvingAddress && (
              <View style={styles.resolvingIndicator}>
                <ActivityIndicator size="small" color="#002E5A" />
                <Text style={styles.resolvingText}>{t("location.resolving", "جاري التحقق...")}</Text>
              </View>
            )}
          </View>

          {/* District & Address Inputs */}
          <View style={styles.inputsRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                {t("location.district_label", "الحي")} *
              </Text>
              <TextInput
                style={[styles.textInput, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("location.district_placeholder", "مثال: النرجس")}
                placeholderTextColor="#94A3B8"
                value={district}
                onChangeText={setDistrict}
              />
            </View>

            <View style={styles.inputGroupHalf}>
              <Text style={[styles.inputLabel, { textAlign: isRTL ? "right" : "left" }]}>
                {t("location.address_label", "الشارع والوصف")}
              </Text>
              <TextInput
                style={[styles.textInput, { textAlign: isRTL ? "right" : "left" }]}
                placeholder={t("location.address_placeholder", "شارع الملك سلمان، فيلا 12")}
                placeholderTextColor="#94A3B8"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, saving && styles.confirmBtnDisabled]}
            onPress={handleSaveLocation}
            disabled={saving}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="map-marker-check" size={20} color="#FFFFFF" style={{ marginHorizontal: 6 }} />
                <Text style={styles.confirmBtnText}>
                  {t("location.save_location_btn", "تثبيت واعتماد هذا الموقع")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LocationPickerModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBar: {
    height: Platform.OS === "ios" ? 88 : 64,
    paddingTop: Platform.OS === "ios" ? 40 : 10,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    fontFamily: "Cairo",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "Cairo",
    marginTop: 2,
  },
  mapWrapper: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  searchOverlayBox: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F172A",
    fontFamily: "Cairo",
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  suggestionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: "#334155",
    fontFamily: "Cairo",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusPillText: {
    fontSize: 11,
    color: "#002E5A",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  savedLocationPromptChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  savedLocationPromptText: {
    fontSize: 11,
    color: "#002E5A",
    fontFamily: "Cairo",
    fontWeight: "600",
  },
  locateBtn: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    zIndex: 15,
  },
  locateBtnActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  coordsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  coordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  coordText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: "#334155",
    fontWeight: "bold",
  },
  resolvingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 6,
  },
  resolvingText: {
    fontSize: 10,
    color: "#002E5A",
    fontFamily: "Cairo",
    fontWeight: "bold",
  },
  inputsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748B",
    fontFamily: "Cairo",
    marginBottom: 4,
  },
  textInput: {
    height: 42,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#0F172A",
    fontFamily: "Cairo",
  },
  confirmBtn: {
    backgroundColor: "#002E5A",
    borderRadius: 16,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#002E5A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Cairo",
  },
});
