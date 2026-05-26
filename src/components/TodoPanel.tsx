"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TodoPanel() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    const saved = localStorage.getItem("openclaw-todos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTodos(parsed);
      } catch {
        setTodos([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("openclaw-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };

    const updatedTodos = [newTodo, ...todos];
    setTodos(updatedTodos);
    setInputValue("");
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim().length > 0) {
      addTodo();
    }
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const filteredTodos = todos.filter(t => t.id !== id);
    setTodos(filteredTodos);
  };

  const clearCompleted = () => {
    const activeTodos = todos.filter(t => !t.completed);
    setTodos(activeTodos);
  };

  const getFilteredTodos = () => {
    if (filter === "active") {
      return todos.filter(t => !t.completed);
    }
    if (filter === "completed") {
      return todos.filter(t => t.completed);
    }
    return todos;
  };

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;
  const filteredTodos = getFilteredTodos();

  const isInputEmpty = inputValue.trim().length === 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Todo</h1>
            <p className="text-sm text-gray-400">
              {activeCount} active · {completedCount} done
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onInputKeyDown}
            placeholder="What needs to be done?"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-gray-500"
          />
          <button
            onClick={addTodo}
            disabled={isInputEmpty}
            className={`px-5 py-3 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 ${
              isInputEmpty ? "bg-gray-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === "all" ? "bg-cyan-400/10 text-cyan-400" : "text-gray-400 hover:text-white"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === "active" ? "bg-cyan-400/10 text-cyan-400" : "text-gray-400 hover:text-white"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === "completed" ? "bg-cyan-400/10 text-cyan-400" : "text-gray-400 hover:text-white"
          }`}
        >
          Completed
        </button>
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm text-rose-400 hover:bg-rose-400/10 transition-all"
          >
            Clear done
          </button>
        )}
      </div>

      {/* Todo List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTodos.map((todo, index) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              className="group bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-cyan-400/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <span className={`flex-1 text-sm ${todo.completed ? "text-gray-500 line-through" : "text-white"}`}>
                  {todo.text}
                </span>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gray-500">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {filter === "all" ? "No todos yet" : filter === "active" ? "All done!" : "No completed todos"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}