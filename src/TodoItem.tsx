import { type Todo } from "../createLoro";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TodoItemProps {
  todo: Todo;
  onTextChange: (id: string, text: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({
  todo,
  onTextChange,
  onToggleComplete,
  onDelete,
}: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [focused, setFocused] = useState(false);
  const [editingText, setEditingText] = useState(todo.text);

  const textToDisplay = focused ? editingText : todo.text;

  const startEdit = () => {
    setEditingText(todo.text);
    setFocused(true);
  };

  const onEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
    onTextChange(todo.id, e.target.value);
  };

  const endEdit = () => {
    setFocused(false);
    onTextChange(todo.id, editingText);
  };

  return (
    <div ref={setNodeRef} style={style} className="todo-item">
      {/* 完了チェックボックス */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggleComplete(todo.id, e.target.checked)}
        className="todo-checkbox"
      />

      {/* テキスト入力（編集可能） */}
      <input
        type="text"
        value={textToDisplay}
        onChange={onEdit}
        className={`todo-text ${todo.completed ? "completed" : ""}`}
        onFocus={startEdit}
        onBlur={endEdit}
      />

      {/* ドラッグハンドル */}
      <div
        {...attributes}
        {...listeners}
        className="drag-handle"
        title="Drag to reorder"
      >
        ⋮⋮
      </div>

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(todo.id)}
        className="delete-button"
        title="Delete"
      >
        ×
      </button>
    </div>
  );
}
