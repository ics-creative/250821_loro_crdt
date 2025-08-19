import { LoroDoc, LoroMap, LoroMovableList } from "loro-crdt";
import { broadcastDoc } from "./broadcastDoc";

export type Todo = { id: string; text: string; completed: boolean };
type Props = { onUpdate: (todos: Todo[]) => void };

export const createLoroStore = (props: Props, roomId = "loro-demo") => {
  const doc = new LoroDoc();

  // 順序は MovableList（id の配列）
  const order = doc.getMovableList("todo:order") as LoroMovableList<string>;
  // 本文と完了フラグは Map（id -> value）
  const textMap = doc.getMap("todo:text") as LoroMap<Record<string, string>>;
  const doneMap = doc.getMap("todo:done") as LoroMap<Record<string, boolean>>;

  const { close: closeBroadcast } = broadcastDoc(doc, roomId);

  // 現在のスナップショットを Todo[] に整形
  const snapshot = (): Todo[] => {
    const ids: string[] = order.toArray() ?? [];
    return ids.map((id) => ({
      id,
      text: textMap.get(id) ?? "",
      completed: doneMap.get(id) ?? false,
    }));
  };

  // 変更を購読して UI に反映（どれか変われば全部再投影）
  const emit = () => props.onUpdate(snapshot());
  const subOrder = order.subscribe(emit);
  const subText = textMap.subscribe(emit);
  const subDone = doneMap.subscribe(emit);

  // 初期値
  emit();

  // --- public API ---

  /** 追加：末尾 or 指定位置に新規 todo を作成 */
  const addTodo = (text: string, atIndex?: number) => {
    const id = crypto.randomUUID();
    if (typeof atIndex === "number") order.insert(atIndex, id);
    else order.push(id);
    textMap.set(id, text);
    doneMap.set(id, false);
    doc.commit();
    return id;
  };

  /** 削除：id を指定 */
  const removeTodo = (id: string) => {
    const ids: string[] = order.toArray() ?? [];
    const idx = ids.indexOf(id);
    if (idx === -1) return;
    order.delete(idx, 1);
    textMap.delete(id);
    doneMap.delete(id);
    doc.commit();
  };

  /** テキスト更新 */
  const setTodoText = (id: string, next: string) => {
    if (textMap.get(id) === undefined) return;
    textMap.set(id, next);
    doc.commit();
  };

  /** 完了フラグ更新（true/false） */
  const setCompleted = (id: string, completed: boolean) => {
    if (doneMap.get(id) === undefined) return;
    doneMap.set(id, completed);
    doc.commit();
  };

  /** 並び替え：id を N 番目へ移動（ドラッグ&ドロップから呼ぶ想定） */
  const moveTodo = (id: string, toIndex: number) => {
    const ids: string[] = order.toArray() ?? [];
    const from = ids.indexOf(id);
    if (from === -1) return;
    // 範囲クリップ
    const to = Math.max(0, Math.min(toIndex, ids.length - 1));
    if (from === to) return;
    order.move(from, to); // ← アトミックな move（delete+insert ではない）
    doc.commit();
  };

  /** クリーンアップ（dev/Strict でも安全） */
  const close = () => {
    // 購読解除
    for (const h of [subOrder, subText, subDone]) {
      h();
    }
    closeBroadcast();
  };

  return {
    addTodo,
    removeTodo,
    setTodoText,
    setCompleted,
    moveTodo,
    close,
  };
};
