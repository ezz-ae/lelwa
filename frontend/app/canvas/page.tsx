"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Loader2, Cpu, ArrowUp, PanelRight, PanelRightClose } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

const BLOCK_CFG: Record<string, { border: string; bg: string; tone: string }> = {
  reply:       { border: "border-emerald-500/20", bg: "bg-emerald-500/5",  tone: "text-emerald-300" },
  call_script: { border: "border-amber-500/20",   bg: "bg-amber-500/5",    tone: "text-amber-300"   },
  offer:       { border: "border-sky-500/20",      bg: "bg-sky-500/5",      tone: "text-sky-300"     },
  contract:    { border: "border-teal-500/20",     bg: "bg-teal-500/5",     tone: "text-teal-300"    },
  followups:   { border: "border-lime-500/20",     bg: "bg-lime-500/5",     tone: "text-lime-300"    },
  summary:     { border: "border-white/10",        bg: "bg-white/5",        tone: "text-white/50"    },
}

const MODEL_BADGE: Record<string, { label: string; dot: string }> = {
  "llama3.2":    { label: "Llama 3.2",   dot: "bg-emerald-400" },
  "deepseek-r1": { label: "DeepSeek R1", dot: "bg-purple-400"  },
  "gemini":      { label: "Gemini",      dot: "bg-blue-400"    },
}

// ── CANVAS NODES ──────────────────────────────────────────────────────────────
function UserNode({ data }: NodeProps) {
  return (
    <div className="w-64 rounded-xl border border-white/12 bg-white/5 backdrop-blur-xl px-4 py-3">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">You</p>
      <p className="text-sm text-white/80 leading-relaxed">{data.message as string}</p>
      <Handle type="source" position={Position.Bottom} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: 7, height: 7 }} />
    </div>
  )
}

function AssistantNode({ data }: NodeProps) {
  const blocks = (data.blocks as any[]) || []
  const badge = MODEL_BADGE[data.model as string] ?? MODEL_BADGE["llama3.2"]
  return (
    <div className="w-80 rounded-xl border border-white/8 bg-black/55 backdrop-blur-xl shadow-2xl p-4 space-y-2.5">
      <Handle type="target" position={Position.Top} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: 7, height: 7 }} />
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
        <span className="text-[10px] text-white/30">{badge.label}</span>
      </div>
      <p className="text-sm text-white/78 leading-relaxed">{data.reply as string}</p>
      {blocks.slice(0, 2).map((block: any, i: number) => {
        const cfg = BLOCK_CFG[block.type] ?? BLOCK_CFG.summary
        return (
          <div key={i} className={`rounded-lg border p-3 ${cfg.border} ${cfg.bg}`}>
            <p className={`text-[9px] uppercase tracking-widest mb-1 ${cfg.tone}`}>{block.type}</p>
            <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">{block.content}</p>
          </div>
        )
      })}
      <Handle type="source" position={Position.Bottom} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: 7, height: 7 }} />
    </div>
  )
}

function LoadingNode({ data }: NodeProps) {
  const badge = MODEL_BADGE[data.model as string] ?? MODEL_BADGE["llama3.2"]
  return (
    <div className="w-80 rounded-xl border border-white/8 bg-black/40 backdrop-blur-xl p-4">
      <Handle type="target" position={Position.Top} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: 7, height: 7 }} />
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
        <span className="text-[10px] text-white/30">{badge.label}</span>
      </div>
      <div className="flex items-center gap-2 text-white/25">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="text-xs">Thinking…</span>
      </div>
    </div>
  )
}

const NODE_TYPES = { userMessage: UserNode, assistant: AssistantNode, loading: LoadingNode }

const MODELS = [
  { id: "llama3.2",    label: "Llama 3.2",   dot: "bg-emerald-400" },
  { id: "deepseek-r1", label: "DeepSeek R1", dot: "bg-purple-400"  },
  { id: "gemini",      label: "Gemini",      dot: "bg-blue-400"    },
]

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  model?: string
  loading?: boolean
}

let _ctr = 0
const uid = () => `n${++_ctr}-${Date.now()}`

export default function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [input, setInput] = useState("")
  const [model, setModel] = useState("llama3.2")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const sessionId = useRef(`canvas-${Date.now()}`)
  const turnRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [canvasVisible, setCanvasVisible] = useState(true)
  const canvasOpen = nodes.length > 0 && canvasVisible

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "rgba(255,255,255,0.07)" } }, eds)),
    [setEdges]
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 200) + "px"
  }, [input])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setLoading(true)

    const turn = turnRef.current++
    const x = turn * 460 + 60
    const uid1 = uid()
    const uid2 = uid()
    const loadingMsgId = uid()

    setMessages((m) => [...m, { id: uid(), role: "user", text }])
    setMessages((m) => [...m, { id: loadingMsgId, role: "assistant", text: "", loading: true, model }])

    setNodes((nds) => [...nds, { id: uid1, type: "userMessage", position: { x, y: 80 }, data: { message: text } }])
    setNodes((nds) => [...nds, { id: uid2, type: "loading", position: { x: x - 20, y: 270 }, data: { model } }])
    setEdges((eds) => addEdge({ id: `e-${uid1}-${uid2}`, source: uid1, target: uid2, animated: true, style: { stroke: "rgba(255,255,255,0.07)" } }, eds))

    try {
      const res = await fetch(`${API_BASE}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId.current, user_id: "default", model }),
      })
      const data = await res.json()
      const reply = data.reply || "Done."
      const blocks = data.prepared_blocks || []

      setMessages((m) => m.map((msg) => msg.id === loadingMsgId ? { ...msg, text: reply, loading: false } : msg))
      setNodes((nds) => nds.map((n) => n.id === uid2 ? { ...n, type: "assistant", data: { reply, blocks, model } } : n))
    } catch {
      const reply = "Backend not reachable."
      setMessages((m) => m.map((msg) => msg.id === loadingMsgId ? { ...msg, text: reply, loading: false } : msg))
      setNodes((nds) => nds.map((n) => n.id === uid2 ? { ...n, type: "assistant", data: { reply, blocks: [], model } } : n))
    } finally {
      setLoading(false)
    }
  }, [input, loading, model, setNodes, setEdges])

  const activeModel = MODELS.find((m) => m.id === model)!

  return (
    <div className="h-screen w-full flex bg-[#080808] overflow-hidden">

      {/* ── CHAT PANEL ───────────────────────────────────────────────────────── */}
      <div
        className="flex flex-col bg-[#0a0a0a] transition-all duration-500 ease-in-out"
        style={{ width: canvasOpen ? "420px" : "100%", borderRight: canvasOpen ? "1px solid rgba(255,255,255,0.05)" : "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-white/25" />
            <span className="text-sm text-white/40 font-medium tracking-wide">Lelwa</span>
          </div>
          {nodes.length > 0 && (
            <button
              onClick={() => setCanvasVisible((v) => !v)}
              title={canvasVisible ? "Close canvas" : "Open canvas"}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/6 transition-all"
            >
              {canvasVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-3 scrollbar-none" style={{ paddingLeft: canvasOpen ? "24px" : "calc(50% - 340px)", paddingRight: canvasOpen ? "24px" : "calc(50% - 340px)" }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2 pb-24">
              <p className="text-white/20 text-base">What can I help with?</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-white/10 text-white/85 rounded-br-sm"
                  : "text-white/65 rounded-bl-sm"
              }`}>
                {msg.loading ? (
                  <div className="flex items-center gap-2 text-white/25 py-0.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Thinking…</span>
                  </div>
                ) : msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="pb-6 pt-3"
          style={{ paddingLeft: canvasOpen ? "20px" : "calc(50% - 340px)", paddingRight: canvasOpen ? "20px" : "calc(50% - 340px)" }}
        >
          <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] overflow-hidden">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={3}
              className="w-full bg-transparent text-sm text-white/85 placeholder:text-white/20 outline-none resize-none px-5 pt-4 pb-2 leading-relaxed"
              placeholder="Message Lelwa…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              disabled={loading}
              autoFocus
              style={{ minHeight: "72px" }}
            />

            {/* Bottom bar: model + send */}
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              {/* Model pills */}
              <div className="flex items-center gap-1.5">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                      model === m.id
                        ? "bg-white/8 text-white/70"
                        : "text-white/25 hover:text-white/45 hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${m.dot} ${model === m.id ? "opacity-100" : "opacity-40"}`} />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Send button */}
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/18 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              >
                {loading
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <ArrowUp className="w-3.5 h-3.5 text-white" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CANVAS PANEL (only when open) ────────────────────────────────────── */}
      {canvasOpen && (
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.4, minZoom: 0.3 }}
            minZoom={0.15}
            maxZoom={2.5}
            className="w-full h-full"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.03)" />
            <Controls
              showInteractive={false}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}
            />
            <MiniMap
              nodeColor="rgba(255,255,255,0.08)"
              maskColor="rgba(0,0,0,0.75)"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}
            />
          </ReactFlow>
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="text-[10px] text-white/12 uppercase tracking-widest">Canvas</span>
          </div>
        </div>
      )}
    </div>
  )
}
