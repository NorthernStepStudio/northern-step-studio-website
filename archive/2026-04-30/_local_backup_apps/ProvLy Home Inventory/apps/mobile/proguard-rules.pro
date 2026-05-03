# SQLite
-keep class io.expo.sqlite.** { *; }

# Supabase
-keep class com.supabase.** { *; }
-keep interface com.supabase.** { *; }

# RevenueCat
-keep class com.revenuecat.purchases.** { *; }

# General Expo/RN
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.common.** { *; }

# Prevent stripping of native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep our specific project classes
-keep class com.homevault.claimpackhome.** { *; }
