## **記述答案を収集し、誤りを分析し、それをデータセットに変換する。**
　　**担当:東出、井出**
- ・答案の画像をどうデータセットにするのかを構想する
- ・大規模答案収集プラットフォーム製作
- ・誤りの手動での分析
- ・全体の流れの最後に位置する、評価の基準もアナログで検討する。

12/16 メモ
- magmaweb(暫定名)をvercalからデプロイ。

12/18 メモ
- magmathとしてログイン画面を追加。インスタ風UIを調整。

12/27 supabaseと連携、画像がクラウドに保存できるように。
12/28 ファイル構造整理
magmaweb/
ーapp/
｜ーfeed/page.tsx
｜ーlogin/page.tsx
｜ーstyles/
｜｜ーlayout.tsx
｜｜ーpage.tsx
ーcomponents/
｜ーLayoutShell.tsx
｜ーProblemActionBar.tsx
｜ーProblemCard.tsx
｜ーProblemFeed.tsx
｜ーSubmitButton.tsx（たぶんいらない空ファイル）
ーdata/
｜ーproblems.ts
ーlib/
｜ーauth.ts
｜ーpost.ts
｜ーsupabase.ts
｜ーupload.ts
ーpublic
｜ーproblems/
｜｜ーsample1.jpg
｜｜ーsample2.jpg
｜｜ーsample3.jpg
｜｜ーsample4.jpg
｜｜ーsample5.jpg
ーdeploy.md
ーnext.config.js
ーpackage.json
ーtsconfig.json

