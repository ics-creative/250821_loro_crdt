# Loro Demo - リアルタイムTodoアプリ

Loro CRDTを使用したリアルタイムコラボレーション対応のTodoアプリケーションです。
複数のブラウザタブ間で同期し、ドラッグ&ドロップによる並び替えが可能です。

## 起動方法

### 1. 依存関係をインストール
```bash
npm install
```

### 2. 開発サーバーを起動
```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### 3. 複数タブでのテスト
同じURLを複数のタブで開くと、リアルタイムでデータが同期されることを確認できます。

### その他のコマンド
- `npm run build` - 本番用ビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run lint` - ESLintでコードチェック

## 主要ファイル

### [src/App.tsx](./src/App.tsx)
メインアプリケーションコンポーネント。TodoリストのUI、新規追加フォーム、ドラッグ&ドロップ機能を実装しています。

### [src/TodoItem.tsx](./src/TodoItem.tsx)
個別のTodo項目コンポーネント。チェックボックス、編集可能なテキスト、ドラッグハンドル、削除ボタンを含みます。

### [createLoro.ts](./createLoro.ts)
Loro CRDTを使用したデータストア。Todo項目の作成、更新、削除、並び替え機能を提供し、リアルタイム同期を実現します。

### [broadcastDoc.ts](./broadcastDoc.ts)
BroadcastChannelを使用してブラウザタブ間でLoro文書を同期する機能。初期同期とリアルタイム更新配信を行います。

## 技術スタック

- **React 19** - UIフレームワーク
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Loro CRDT** - 分散データ構造ライブラリ
- **@dnd-kit** - ドラッグ&ドロップ機能
- **BroadcastChannel API** - タブ間通信

## 機能

- ✅ Todo項目の追加・削除・編集
- ✅ 完了状態の切り替え
- ✅ ドラッグ&ドロップによる並び替え
- ✅ 複数タブ間でのリアルタイム同期
- ✅ コンフリクトフリーな分散編集
