# PingGo：Google 登入與跨手機同步設定

1. 前往 Firebase Console 建立專案，新增「Web 應用程式」。
2. 將 SDK 設定中的六個值貼入 `firebase-config.js`。
3. 在「Authentication → 登入方式」啟用 Google，設定支援電子郵件。
4. 在 Authentication 的「設定 → 已授權的網域」加入 GitHub Pages 網域，例如 `felin0630.github.io`。
5. 建立 Cloud Firestore 資料庫，將 `firestore.rules` 全文貼到「規則」並發布。
6. 把所有檔案部署到 GitHub Pages，再用兩支手機登入同一個 Google 帳號測試。

## 同步方式

- 未登入：收藏及名單只存在目前瀏覽器的 localStorage。
- 首次登入：把本機與雲端名單合併，不覆蓋任何一邊。
- 登入後：名單與收藏學校變更會自動寫入 `users/{uid}`。
- 登出後：雲端資料保留，之後登入同一帳號即可取回。

請勿把 Firestore 規則設成公開讀寫。Firebase Web 設定不是密碼，資料安全依賴 Authentication 與 `firestore.rules`。
