# Muse Closet AI 🎀

> **Your Personal AI-Powered Digital Stylist & Wardrobe Manager**

Muse Closet AI is a sophisticated digital wardrobe application that helps you organize your clothes, discover new outfit combinations, and get personalized styling advice using advanced AI. Whether you're planning a trip, looking for a daily outfit, or shopping for the latest trends, Muse has you covered.

## ✨ Features

### 👗 Digital Wardrobe
- **Digitize Your Closet**: Upload photos of your clothes to create a virtual inventory.
- **Categorization**: Automatically organizes items into Tops, Bottoms, Shoes, and Accessories.
- **Management**: Easily add or remove items to keep your digital closet up to date.

### 🤖 AI Styling Assistant
- **Trip Packer**: Planning a vacation? Tell Muse your destination and duration, and it will generate a complete packing list based on your own wardrobe and the destination's vibe/weather.
- **Muse Oracle**: A chat-based AI stylist ready to answer your fashion questions, give advice on trends, or help you decide what to wear.
- **Smart Outfit Generation**: Get AI-curated outfit suggestions suited for your specific style and occasions.

### 🛍️ Curated Shopping
- **Shop the Look**: Discover trending aesthetics (e.g., "Old Money", "Streetwear", "Indie Sleaze") with curated collections.
- **Myntra Integration**: Direct links to shop for missing pieces or trending items on Myntra based on your gender and style preferences.

### 🎨 Modern & Aesthetic UI
- **Premium Design**: A beautiful, responsive interface featuring glassmorphism, smooth animations, and a rich color palette.
- **Cross-Platform**: Designed to work seamlessly on both Web and Mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS, PostCSS, Lucide React (Icons)
- **Backend / Services**: Firebase (Auth, Firestore), Google Gemini API (AI features)
- **Mobile**: Capacitor (for Android/iOS builds)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/muse-closet-ai.git
   cd muse-closet-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create a `.env` file or update the configuration in `src/App.jsx` with your API keys:
     - **Firebase Config**: Update the `firebaseConfig` object.
     - **Gemini API Key**: Set your Google Gemini API key.

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 📱 Mobile Build (Android)

To build and run the app on an Android device/emulator:

1. **Sync Capacitor**
   ```bash
   npx cap sync
   ```

2. **Build an Android release APK (recommended, deterministic)**

   This repo expects:
   - Gradle Wrapper `8.2.1`
   - Android Gradle Plugin `8.2.1`
   - Java 17+

   On Windows, run:
   ```bash
   npm run android:release
   ```

   If you ever see errors like `AgpVersionAttr=8.13.2` / `No variants exist` for Capacitor modules, it usually means Android Studio is building with a different Gradle/AGP than this repo expects.

3. **Open Android Studio**
   ```bash
   npx cap open android
   ```

4. **Android Studio settings (important)**
   - Settings → Build, Execution, Deployment → Gradle
     - **Use Gradle from**: **Gradle wrapper**
     - **Gradle JDK**: **JDK 17** (you can point it to `android/.jdk/jdk-17` after running the script once)

5. **Run from Android Studio**: Use the "Run" button to deploy to your connected device or emulator.

## 🤝 Contributing

Contributions are welcome! Please run the linter before submitting a pull request:

```bash
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
