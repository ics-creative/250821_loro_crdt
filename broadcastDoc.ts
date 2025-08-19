import type { VersionVector, LoroDoc } from "loro-crdt";

type Msg =
  | { type: "hello"; tabId: string; version: VersionVector }
  | { type: "ops"; from: string; to?: string; bytes: Uint8Array };
export const broadcastDoc = (doc: LoroDoc, roomId = "loro-demo") => {
  const channel = new BroadcastChannel(roomId);
  const tabId = crypto.randomUUID();

  const onMessage = (ev: MessageEvent<Msg>) => {
    const msg = ev.data;
    if (!msg) return;

    if (msg.type === "hello" && msg.tabId !== tabId) {
      // 相手のversionに対する自分の未送分を返す
      const bytes = doc.export({ mode: "update", from: msg.version });
      if (bytes.byteLength) {
        channel.postMessage({ type: "ops", from: tabId, to: msg.tabId, bytes });
      }
    }

    if (msg.type === "ops") {
      if (msg.to && msg.to !== tabId) return;
      doc.import(msg.bytes); // 重複・順不同OK
    }
  };

  channel.addEventListener("message", onMessage);

  // 初期同期要求（自分のversionを通知）
  channel.postMessage({
    type: "hello",
    tabId,
    version: doc.oplogVersion(),
  } as Msg);

  // ローカルコミットごとの差分を配信
  const unsubscribe = doc.subscribeLocalUpdates((bytes: Uint8Array) => {
    channel.postMessage({ type: "ops", from: tabId, bytes });
  });

  // 停止フック（今は使わなくてOK）
  const close = () => {
    channel.removeEventListener("message", onMessage);
    channel.close();
    unsubscribe();
    console.log("doc closed");
  };

  console.log("doc opened");
  return { close };
};
