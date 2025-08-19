import { useEffect, useState } from "react";
import { createLoroStore, type Todo } from "../createLoro";
import TodoItem from "./TodoItem";
import "./App.css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function App() {
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [store, setStore] = useState<
    ReturnType<typeof createLoroStore> | undefined
  >(undefined);
  const [newTodoText, setNewTodoText] = useState("");

  const { addTodo, removeTodo, setTodoText, setCompleted, moveTodo } =
    store || {};

  useEffect(() => {
    const newStore = createLoroStore({ onUpdate: setTodoList });
    setStore(newStore);
    return () => {
      newStore?.close?.();
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTodo = () => {
    if (newTodoText.trim() && addTodo) {
      addTodo(newTodoText.trim());
      setNewTodoText("");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && moveTodo) {
      const oldIndex = todoList.findIndex((todo) => todo.id === active.id);
      const newIndex = todoList.findIndex((todo) => todo.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveTodo(active.id as string, newIndex);
      }
    }
  };

  if (!store) return null;

  return (
    <div className="todo-app">
      <h1>Todo List with Loro</h1>

      {/* 新しいTODO追加 */}
      <div className="add-todo">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          className="add-todo-input"
        />
        <button onClick={handleAddTodo} className="add-todo-button">
          Add
        </button>
      </div>

      {/* TODOリスト */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={todoList.map((todo) => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="todo-list">
            {todoList.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onTextChange={(id, text) => setTodoText?.(id, text)}
                onToggleComplete={(id, completed) =>
                  setCompleted?.(id, completed)
                }
                onDelete={(id) => removeTodo?.(id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {todoList.length === 0 && (
        <p className="empty-state">No todos yet. Add one above!</p>
      )}
    </div>
  );
}
