---
description: How to publish the app to Google Play Store
---

# Publishing PHYSQ to Google Play Store

This guide walks you through publishing your Expo React Native app to the Google Play Store.

## Prerequisites

### 1. Google Play Console Account
- Create a Google Play Developer account at https://play.google.com/console
- Pay the one-time $25 registration fee
- Complete your account setup

### 2. Install EAS CLI
```bash
npm install -g eas-cli
```

### 3. Login to Expo Account
```bash
eas login
```

## Step-by-Step Publishing Process

### Step 1: Configure App Details in app.json

Update your `app.json` with proper metadata:
- App name (should be unique and professional, e.g., "PHYSQ Fitness Tracker")
- Bundle identifier (e.g., "com.yourcompany.physq")
- Version number
- Permissions required
- App icon and splash screen

### Step 2: Create EAS Build Configuration

Initialize EAS Build:
```bash
eas build:configure
```

This creates an `eas.json` file. Configure it for production Android builds.

### Step 3: Build Production APK/AAB

For Google Play Store, you need an Android App Bundle (AAB):
```bash
eas build --platform android --profile production
```

This will:
- Build your app in the cloud
- Generate a signed AAB file
- Store credentials securely

**First-time build:** EAS will ask if you want to generate a new Android keystore. Choose YES and let EAS manage it.

### Step 4: Download the AAB File

Once the build completes, download the `.aab` file from the Expo dashboard or use:
```bash
eas build:list
```

### Step 5: Create App Listing in Play Console

1. Go to Google Play Console
2. Click "Create app"
3. Fill in:
   - App name: "PHYSQ" or your chosen name
   - Default language
   - App type: App
   - Category: Health & Fitness
   - Free or Paid

### Step 6: Complete Store Listing

Fill out all required sections:
- **App details:** Short description, full description
- **Graphics:** Screenshots (phone & tablet), feature graphic, app icon
- **Categorization:** App category, content rating
- **Contact details:** Email, privacy policy URL, website
- **Privacy Policy:** Required - host one online

### Step 7: Set Up App Content

Complete:
- Content ratings questionnaire
- Target audience and content
- News apps declaration
- COVID-19 contact tracing
- Data safety section (describe what data you collect)

### Step 8: Upload Your AAB

1. Go to "Production" → "Create new release"
2. Upload the `.aab` file you downloaded
3. Add release notes
4. Review and roll out to production or testing track

### Step 9: Testing (Recommended)

Before production, use Internal/Closed testing:
```bash
eas build --platform android --profile preview
```

Upload to Internal Testing track first to catch any issues.

### Step 10: Submit for Review

1. Review all sections for completeness
2. Click "Submit for review"
3. Wait for Google's review (typically 1-7 days)

## Important Notes

### App Signing
- Google requires app bundles to use Play App Signing
- EAS handles keystore generation and management
- Keep your credentials safe (EAS stores them securely)

### Versioning
Update version in `app.json` for each release:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

Increment `versionCode` for each build, use semantic versioning for `version`.

### Assets Required
- **App icon:** 512x512px PNG (with transparency)
- **Feature graphic:** 1024x500px JPG/PNG
- **Screenshots:** At least 2, up to 8 (16:9 or 9:16 ratio)
- **Phone screenshots:** 1080x1920px recommended
- **Tablet screenshots:** 1200x1920px recommended

### Privacy Policy
Google requires a privacy policy URL. You can:
- Host on your website
- Use free generators like https://www.privacypolicygenerator.info/
- Host on GitHub Pages

### Update Flow
For future updates:
1. Update `version` and `versionCode` in `app.json`
2. Run `eas build --platform android --profile production`
3. Download new AAB
4. Upload to Play Console → Create new release
5. Submit for review

## Troubleshooting

### Build Failures
- Check `eas build:list` for error logs
- Ensure all dependencies are compatible
- Check app.json configuration

### Upload Issues
- Ensure AAB is signed correctly
- Check version code is higher than previous
- Verify package name matches

### Testing Locally
Build APK for local testing:
```bash
eas build --platform android --profile preview --local
```

## Quick Commands Reference

```bash
# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Build for production (AAB)
eas build --platform android --profile production

# Build preview (APK for testing)
eas build --platform android --profile preview

# Check build status
eas build:list

# Submit to Play Store (after initial setup)
eas submit --platform android
```

## Timeline Estimate

- **Initial setup:** 2-3 hours
- **First build:** 15-30 minutes (in cloud)
- **Store listing setup:** 1-2 hours
- **Google review:** 1-7 days
- **Total first publish:** ~1 week

## Next Steps After This Workflow

1. Prepare app assets (icons, screenshots, descriptions)
2. Write privacy policy
3. Set up Google Play Developer account (if not done)
4. Follow steps above sequentially
5. Monitor reviews and crashes in Play Console

Good luck with your app launch! 🚀
