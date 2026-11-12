Timesheet (تایم‌شیت من) v1.0.0 - Offline Android WebView app
Package: ir.fileland.timesheet
Source of the UI: app/src/main/assets/index.html (single file, no internet needed)

Build:
 1) Create a new GitHub repository and upload ALL files of this project (keep the hidden .github folder).
 2) Actions -> Build APK -> Run workflow
 3) When finished, download the artifact "timesheet-apk" (zip) -> install app-debug.apk on the phone.

Edit the app: change app/src/main/assets/index.html and push again.

Files you edit: app/src/main/assets/index.html (markup), style.css (look), app.js (logic).
fonts.css is generated (embedded font) - do not edit.
Version: change versionName in app/build.gradle only (the app reads it from there).
Signing: app/debug.keystore is a fixed key so each new build installs over the old one and keeps your data. Keep the GitHub repo PRIVATE.
