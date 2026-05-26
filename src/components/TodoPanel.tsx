"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Plus, Trash2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function TodoPanel() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("openclaw-todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch {
        setTodos([]);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("openclaw-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
    setInput("");
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const filteredTodos = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center">
            <CheckCircle2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Todo</h1>
            <p className="text-sm text-[--text-muted]">
              {activeCount} active · {completedCount} done
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="flex-1 bg-[--bg-input] border border-[--border-subtle] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[--accent-cyan]"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-4 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "active", "completed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? "bg-[--accent-cyan]/10 text-[--accent-cyan]"
                : "text-[--text-muted] hover:text-[--text-primary]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm text-[--accent-rose] hover:bg-[--accent-rose]/10 transition-all"
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
              className="group bg-[--bg-panel] border border-[--border-subtle] rounded-xl p-4 hover:border-[--border-glow] transition-all"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 text-[--text-dim] hover:text-[--accent-emerald] transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 size={22} className="text-[--accent-emerald]" />
                  ) : (
                    <Circle size={22} />
                  )}
                </button>

                <span className={`flex-1 text-sm ${todo.completed ? "text-[--text-dim] line-through" : "text-[--text-primary]"}`}>
                  {todo.text}
                </span>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-[--text-dim]">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-[--text-dim] hover:text-[--accent-rose] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12 text-[--text-muted]">
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