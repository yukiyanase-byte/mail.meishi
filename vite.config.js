import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ⚠️ base は GitHubリポジトリ名に合わせて変更してください
// 例: リポジトリ名が "bizcontact" なら → base: '/bizcontact/'
// GitHub Pages の URL: https://yourname.github.io/bizcontact/
export default defineConfig({
  plugins: [react()],
  base: '/mail.meishi/',   // ← リポジトリ名に変更
});
