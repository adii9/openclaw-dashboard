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
  const [items, setItems] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [view, setView] = useState<"all" | "active" | "done">("all");

  useEffect(() => {
    const stored = localStorage.getItem("openclaw-todos");
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse todos", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("openclaw-todos", JSON.stringify(items));
  }, [items]);

  const createItem = () => {
    const content = text.trim();
    if (!content) return;

    const item: Todo = {
      id: Date.now().toString(),
      text: content,
      completed: false,
      createdAt: Date.now(),
    };

    setItems([item, ...items]);
    setText("");
  };

  const toggleItem = (id: string) => {
    const newItems = items.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    setItems(newItems);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(t => t.id !== id));
  };

  const purgeDone = () => {
    setItems(items.filter(t => !t.completed));
  };

  const showItems = view === "all" ? items : view === "active" ? items.filter(t => !t.completed) : items.filter(t => t.completed);
  const activeNum = items.filter(t => !t.completed).length;
  const doneNum = items.filter(t => t.completed).length;

  return (
    <div style={{ maxWidth: "600px", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "8px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <CheckCircle2 size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#f0f0f5" }}>Todo</h1>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>{activeNum} active · {doneNum} done</p>
          </div>
        </div>

        {/* Add Form */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createItem(); }}
            placeholder="What needs to be done?"
            style={{
              flex: 1,
              background: "#0d0d12",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "14px",
              color: "#f0f0f5",
              outline: "none"
            }}
          />
          <button
            onClick={createItem}
            style={{
              padding: "12px 20px",
              background: "#10b981",
              borderRadius: "12px",
              color: "white",
              fontWeight: "500",
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <button onClick={() => setView("all")} style={{
          padding: "6px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
          background: view === "all" ? "rgba(0,240,255,0.1)" : "transparent",
          color: view === "all" ? "#00f0ff" : "#6b7280",
          border: "none", cursor: "pointer"
        }}>All</button>
        <button onClick={() => setView("active")} style={{
          padding: "6px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
          background: view === "active" ? "rgba(0,240,255,0.1)" : "transparent",
          color: view === "active" ? "#00f0ff" : "#6b7280",
          border: "none", cursor: "pointer"
        }}>Active</button>
        <button onClick={() => setView("done")} style={{
          padding: "6px 12px", borderRadius: "8px", fontSize: "14px", fontWeight: "500",
          background: view === "done" ? "rgba(0,240,255,0.1)" : "transparent",
          color: view === "done" ? "#00f0ff" : "#6b7280",
          border: "none", cursor: "pointer"
        }}>Done</button>
        {doneNum > 0 && (
          <button onClick={purgeDone} style={{
            marginLeft: "auto", padding: "6px 12px", borderRadius: "8px", fontSize: "14px",
            color: "#f43f5e", background: "transparent", border: "none", cursor: "pointer"
          }}>Clear done</button>
        )}
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <AnimatePresence>
          {showItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.03 }}
              style={{
                background: "#12121a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <button onClick={() => toggleItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {item.completed
                  ? <CheckCircle2 size={22} color="#10b981" />
                  : <Circle size={22} color="#4b5563" />}
              </button>
              <span style={{
                flex: 1, fontSize: "14px",
                color: item.completed ? "#4b5563" : "#f0f0f5",
                textDecoration: item.completed ? "line-through" : "none"
              }}>{item.text}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.5 }}>
                <span style={{ fontSize: "10px", color: "#4b5563" }}>{new Date(item.createdAt).toLocaleDateString()}</span>
                <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                  <Trash2 size={14} color="#4b5563" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#4b5563" }}>
            <CheckCircle2 size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
            <p style={{ fontSize: "14px" }}>
              {view === "all" ? "No todos yet" : view === "active" ? "All done!" : "No completed todos"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}