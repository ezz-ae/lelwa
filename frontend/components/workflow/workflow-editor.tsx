"use client";

import React from "react";

import { useState, useCallback } from "react";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
} from "@xyflow/react";

import type { WorkflowNode, WorkflowNodeType, WorkflowExecution } from "@/lib/workflow-types";
import { WorkflowCanvas } from "./workflow-canvas";
import { WorkflowToolbar } from "./workflow-toolbar";
import { OutputPanel } from "./output-panel";
import { LoadWorkflowDialog } from "./load-workflow-dialog";
import { NodeEditPanel } from "./node-edit-panel";
import { RunHistoryDialog } from "./run-history-dialog";
import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from "@/lib/workflow-templates";

const DEFAULT_TEMPLATE = WORKFLOW_TEMPLATES[0];

function cloneNodes(nodes: WorkflowNode[]) {
  return nodes.map((node) => ({
    ...node,
    data: { ...node.data },
  }));
}

function cloneEdges(edges: Edge[]) {
  return edges.map((edge) => ({ ...edge }));
}

interface WorkflowEditorInnerProps {
  initialTemplate?: WorkflowTemplate;
}

function WorkflowEditorInner({ initialTemplate }: WorkflowEditorInnerProps) {
  const template = initialTemplate ?? DEFAULT_TEMPLATE;
  const [nodes, setNodes, onNodesChange] = useNodesState(cloneNodes(template.nodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(cloneEdges(template.edges));
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(template.id ?? null);
  const [workflowName, setWorkflowName] = useState(template.name);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, type: "default", animated: true }, eds));
      setHasChanges(true);
    },
    [setEdges]
  );

  const defaultNodeData: Record<WorkflowNodeType, object> = {
    aiText: {
      label: "AI Text",
      provider: "openai",
      model: "gpt-4o",
      prompt: "",
      systemPrompt: "",
      temperature: 0.7,
    },
    aiImage: {
      label: "AI Image",
      provider: "google",
      prompt: "",
      size: "1024x1024",
    },
    condition: {
      label: "Condition",
      condition: "",
      operator: "contains",
      value: "",
    },
    memory: {
      label: "Memory",
      memoryKey: "",
      operation: "read",
      dataType: "text",
      defaultValue: "",
    },
    github: {
      label: "GitHub",
      githubUrl: "",
      branch: "main",
      fetchReadme: true,
      fetchStructure: true,
      fetchKeyFiles: false,
    },
    output: {
      label: "Output",
      outputType: "readme-md",
      agentType: undefined,
      customFilename: "",
      customTemplate: "",
    },
    textInput: {
      label: "Text Input",
      text: "",
    },
    merge: {
      label: "Merge",
      separator: "\n\n",
    },
  };

  const handleAddNode = useCallback(
    (nodeType: WorkflowNodeType) => {
      // Calculate position based on existing nodes - place horizontally with 400px spacing
      const xOffset = 100 + nodes.length * 400;
      const newNode: WorkflowNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position: { x: xOffset, y: 200 },
        data: defaultNodeData[nodeType] as WorkflowNode["data"],
      };
      setNodes((nds) => [...nds, newNode]);
      setHasChanges(true);
    },
    [nodes.length, setNodes]
  );

  const handleNodesUpdate = useCallback(
    (newNodes: WorkflowNode[]) => {
      setNodes(newNodes);
      setHasChanges(true);
    },
    [setNodes]
  );

  const handleEdgesUpdate = useCallback(
    (newEdges: Edge[]) => {
      setEdges(newEdges);
      setHasChanges(true);
    },
    [setEdges]
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Partial<WorkflowNode["data"]>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } as WorkflowNode["data"] }
            : node
        )
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId
          ? { ...prev, data: { ...prev.data, ...data } as WorkflowNode["data"] }
          : prev
      );
      setHasChanges(true);
    },
    [setNodes]
  );

  const handleExecute = async () => {
    if (nodes.length === 0) return;

    setIsExecuting(true);
    setShowOutput(true);
    setExecution(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges, workflowId }),
      });

      const result = await response.json();

      if (response.ok) {
        setExecution({
          id: crypto.randomUUID(),
          workflowId: workflowId || "",
          status: "completed",
          results: result.results,
          finalOutput: result.finalOutput,
          startedAt: new Date(),
          completedAt: new Date(),
        });
      } else {
        setExecution({
          id: crypto.randomUUID(),
          workflowId: workflowId || "",
          status: "failed",
          results: [
            {
              nodeId: "error",
              nodeType: "output",
              output: null,
              error: result.error,
              timestamp: new Date(),
            },
          ],
          finalOutput: `Error: ${result.error}`,
          startedAt: new Date(),
          completedAt: new Date(),
        });
      }
    } catch (error) {
      setExecution({
        id: crypto.randomUUID(),
        workflowId: workflowId || "",
        status: "failed",
        results: [],
        finalOutput: `Execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        startedAt: new Date(),
        completedAt: new Date(),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const url = workflowId ? `/api/workflows/${workflowId}` : "/api/workflows";
      const method = workflowId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          template_id: templateId,
          nodes,
          edges,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.workflow?.id) {
          setWorkflowId(result.workflow.id);
        }
        setTemplateId(result.workflow?.template_id ?? result.workflow?.templateId ?? templateId ?? null);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Failed to save workflow:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}`);
      const result = await response.json();

      if (response.ok && result.workflow) {
        setWorkflowId(result.workflow.id);
        setTemplateId(result.workflow.template_id ?? result.workflow.templateId ?? null);
        setWorkflowName(result.workflow.name);
        setNodes(cloneNodes(result.workflow.nodes || []));
        setEdges(cloneEdges(result.workflow.edges || []));
        setHasChanges(false);
        setShowLoadDialog(false);
      }
    } catch (error) {
      console.error("Failed to load workflow:", error);
    }
  };

  const handleNew = () => {
    setWorkflowId(null);
    setTemplateId(null);
    setWorkflowName("Untitled Workflow");
    setNodes([]);
    setEdges([]);
    setHasChanges(false);
    setExecution(null);
    setSelectedNode(null);
  };

  const handleClear = () => {
    setNodes([]);
    setEdges([]);
    setHasChanges(true);
    setSelectedNode(null);
  };

  const handleSelectTemplate = (
    selectedTemplateId: string,
    templateNodes: WorkflowNode[],
    templateEdges: Edge[],
    name: string
  ) => {
    setWorkflowId(null);
    setTemplateId(selectedTemplateId);
    setWorkflowName(name);
    setNodes(cloneNodes(templateNodes));
    setEdges(cloneEdges(templateEdges));
    setHasChanges(true);
    setSelectedNode(null);
  };

  const handleSelectHistoryRun = (output: string) => {
    setExecution({
      id: crypto.randomUUID(),
      workflowId: workflowId || "",
      status: "completed",
      results: [],
      finalOutput: output,
      startedAt: new Date(),
      completedAt: new Date(),
    });
    setShowOutput(true);
  };

  const handleNodesChangeWrapper: typeof onNodesChange = (changes) => {
    onNodesChange(changes);

    for (const change of changes) {
      if (change.type === "select" && change.selected) {
        const node = nodes.find((n) => n.id === change.id);
        if (node) {
          setSelectedNode(node as WorkflowNode);
        }
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-workflow-bg transition-colors duration-200">
      <WorkflowToolbar
        workflowName={workflowName}
        onWorkflowNameChange={(name) => {
          setWorkflowName(name);
          setHasChanges(true);
        }}
        onExecute={handleExecute}
        onSave={handleSave}
        onLoad={() => setShowLoadDialog(true)}
        onNew={handleNew}
        onClear={handleClear}
        onOpenHistory={() => setShowHistoryDialog(true)}
        onSelectTemplate={handleSelectTemplate}
        onAddNode={handleAddNode}
        onToggleOutput={() => setShowOutput(!showOutput)}
        isExecuting={isExecuting}
        isSaving={isSaving}
        hasChanges={hasChanges}
        showOutput={showOutput}
      />

      <div className="flex-1 flex overflow-hidden">
        <WorkflowCanvas
          nodes={nodes as WorkflowNode[]}
          edges={edges}
          onNodesChange={handleNodesChangeWrapper}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesUpdate={handleNodesUpdate}
          onEdgesUpdate={handleEdgesUpdate}
        />

        {selectedNode && !showOutput && (
          <NodeEditPanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {showOutput && (
          <OutputPanel
            execution={execution}
            isExecuting={isExecuting}
            onClose={() => setShowOutput(false)}
          />
        )}
      </div>

      <LoadWorkflowDialog
        isOpen={showLoadDialog}
        onClose={() => setShowLoadDialog(false)}
        onLoad={handleLoad}
      />

      <RunHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        workflowId={workflowId}
        onSelectRun={handleSelectHistoryRun}
      />
    </div>
  );
}

interface WorkflowEditorProps {
  template?: WorkflowTemplate;
}

export function WorkflowEditor({ template }: WorkflowEditorProps = {}) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner key={template?.id ?? DEFAULT_TEMPLATE.id} initialTemplate={template} />
    </ReactFlowProvider>
  );
}
