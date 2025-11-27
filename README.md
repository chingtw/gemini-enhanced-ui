# 🛡️ Gemini Sidebar NSFW Blur

![Demo](https://drive.google.com/uc?export=view&id=16eDFY3igOma9daPzQH4jfAPmCzZ16moD "Demo")



這是一個專為 **Google Gemini** 網頁版設計的瀏覽器擴充功能（Chrome / Edge）。

它能自動將側邊欄的 **My Stuff (我的內容)** 區域加上高質感的模糊濾鏡與 NSFW 警示遮罩，保護你的隱私，避免敏感對話標題直接暴露在螢幕上。

## ✨ 主要功能

* **🔒 隱私保護**：預設模糊 `my-stuff-recents-preview` 區域，防止他人窺視。
* **👁️ 互動解鎖**：滑鼠懸停 (Hover) 於遮罩上時，會平滑地淡出模糊效果並顯示內容；移開後自動恢復遮蔽。
* **🎨 精緻視覺設計 (V5)**：
    * **通用配色**：採用半透明深灰底色搭配白色 Eye-Slash 圖示，無論 Gemini 使用深色或淺色主題，遮罩都清晰可見且不突兀。
    * **柔化邊界**：結合圓角 (Border Radius) 與內陰影 (Inset Shadow)，讓遮罩邊緣呈現柔和的羽化效果，完美融入介面。
    * **極致輕量**：純 CSS 實現視覺效果，不佔用記憶體與運算資源。

## 📂 檔案結構

專案資料夾應包含以下檔案：

* `manifest.json` - 擴充功能的設定檔（定義權限與目標網站）。
* `style.css` - 核心樣式表（包含模糊、遮罩、動畫邏輯）。
* `icon.png` - 擴充功能圖示 (建議 128x128)。
* `README.md` - 專案說明文件。

## 🚀 安裝教學

由於此擴充功能為個人開發工具，請使用瀏覽器的「開發人員模式」進行安裝：

1.  **準備檔案**：
    * 將 `manifest.json`, `style.css` 放入一個資料夾（例如命名為 `gemini-nsfw-blur`）。
    * 確保資料夾內有產生的 `icon.png` 圖示檔。
2.  **開啟擴充功能管理頁面**：
    * **Chrome**: 在網址列輸入 `chrome://extensions` 並按下 Enter。
    * **Edge**: 在網址列輸入 `edge://extensions` 並按下 Enter。
3.  **啟用開發模式**：
    * 開啟頁面右上角的 **「開發人員模式」 (Developer mode)** 開關。
4.  **載入擴充功能**：
    * 點擊左上角的 **「載入未封裝項目」 (Load unpacked)** 按鈕。
    * 選擇你的 `gemini-nsfw-blur` 資料夾。
5.  **完成！**
    * 回到 [gemini.google.com](https://gemini.google.com) 並重新整理頁面 (F5)，即可看到效果。

## 🛠️ 自定義調整

如果你想調整視覺風格，可以開啟 `style.css` 修改參數：

* **調整模糊程度**：修改 `backdrop-filter: blur(10px);` 中的數值。
* **調整遮罩顏色/透明度**：修改 `background-color: rgba(20, 20, 20, 0.6);`。
* **調整邊緣柔化範圍**：修改 `box-shadow: inset 0 0 20px 2px ...` 中的像素值。

## 📜 License
此專案僅供個人學習與使用。
