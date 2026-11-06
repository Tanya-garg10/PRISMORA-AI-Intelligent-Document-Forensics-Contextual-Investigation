import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  type Node,
  type NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  ArrowLeft, Network, FileText, AlertTriangle, 
  User, Building, Landmark, ShieldAlert, Eye, Filter, RefreshCw
} from 'lucide-react';
import { getInvestigation, getInvestigationGraph, getInvestigations } from '../services/api';
import type { GraphData, GraphEdge } from '../types';

type GraphCanvasNodeData = {
  label?: string;
  type?: string;
  metadata?: {
    document_type?: string;
    entity_type?: string;
    severity?: string;
    [key: string]: unknown;
  };
};
type GraphCanvasNode = Node<GraphCanvasNodeData>;

// Custom Node Components
const DocumentNode = ({ data }: NodeProps<GraphCanvasNode>) => (
  <div className="bg-white rounded-xl border-2 border-indigo-400 shadow-md p-3 min-w-[180px] max-w-[220px]">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-indigo-500" />
    <div className="flex items-center gap-2 mb-1.5">
      <div className="p-1 rounded bg-indigo-50 text-indigo-700">
        <FileText className="w-4 h-4" />
      </div>
      <div className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
        {data.metadata?.document_type || 'Document'}
      </div>
    </div>
    <div className="font-bold text-xs text-slate-900 truncate" title={data.label as string}>
      {data.label as string}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-indigo-500" />
  </div>
);

const EntityNode = ({ data }: NodeProps<GraphCanvasNode>) => {
  const getIcon = () => {
    switch (data.metadata?.entity_type) {
      case 'person': return <User className="w-3.5 h-3.5 text-emerald-600" />;
      case 'organization': return <Building className="w-3.5 h-3.5 text-emerald-600" />;
      case 'bank': return <Landmark className="w-3.5 h-3.5 text-emerald-600" />;
      default: return <User className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-emerald-50/90 rounded-xl border-2 border-emerald-400 shadow-sm p-2.5 min-w-[160px] max-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-emerald-500" />
      <div className="flex items-center gap-1.5 mb-1">
        {getIcon()}
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
          {data.metadata?.entity_type || 'Entity'}
        </span>
      </div>
      <div className="font-bold text-xs text-slate-800 truncate" title={data.label as string}>
        {data.label as string}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-emerald-500" />
    </div>
  );
};

const FindingNode = ({ data }: NodeProps<GraphCanvasNode>) => (
  <div className="bg-rose-50 rounded-xl border-2 border-rose-400 shadow-md p-3 min-w-[190px] max-w-[230px]">
    <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-rose-500" />
    <div className="flex items-center justify-between mb-1">
      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-200 text-rose-800">
        {data.metadata?.severity || 'FLAG'}
      </span>
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
    </div>
    <div className="font-bold text-xs text-slate-900 line-clamp-2" title={data.label as string}>
      {data.label as string}
    </div>
    <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-rose-500" />
  </div>
);

const nodeTypes = {
  document: DocumentNode,
  entity: EntityNode,
  finding: FindingNode,
};

export default function RelationshipGraphPage() {
  const { id } = useParams<{ id: string }>();

  // If no ID is provided, query list of investigations to pick the latest
  const { data: investigationsList } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => getInvestigations(),
    enabled: !id,
  });

  const activeId = id || (investigationsList && investigationsList.length > 0 ? investigationsList[0].id : null);

  const { data: graphData, isLoading, refetch } = useQuery({
    queryKey: ['investigation-graph', activeId],
    queryFn: () => getInvestigationGraph(activeId!),
    enabled: !!activeId,
  });

  const { data: investigation } = useQuery({
    queryKey: ['investigation', activeId],
    queryFn: () => getInvestigation(activeId!),
    enabled: !!activeId,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Filters
  const [filterDocs, setFilterDocs] = useState(true);
  const [filterEntities, setFilterEntities] = useState(true);
  const [filterFindings, setFilterFindings] = useState(true);

  // Layout and assemble nodes & edges
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    // Filter nodes according to toggle states
    const activeNodes = graphData.nodes.filter(n => {
      const type = n.type === 'documentNode'
        ? 'document'
        : n.type === 'entityNode'
          ? 'entity'
          : n.type === 'findingNode'
            ? 'finding'
            : n.type;
      if (type === 'document' && !filterDocs) return false;
      if (type === 'entity' && !filterEntities) return false;
      if (type === 'finding' && !filterFindings) return false;
      return true;
    });

    const activeNodeIds = new Set(activeNodes.map(n => n.id));

    // Arrange nodes in hierarchical or layered columns
    // Column 0: Documents (x: 50)
    // Column 1: Entities (x: 400)
    // Column 2: Findings (x: 750)
    let docY = 50;
    let entityY = 50;
    let findingY = 50;

    const formattedNodes = activeNodes.map((n) => {
      const backendType = n.type;
      const nodeType = backendType === 'documentNode'
        ? 'document'
        : backendType === 'entityNode'
          ? 'entity'
          : backendType === 'findingNode'
            ? 'finding'
            : backendType;
      const nodeData = n.data || {};
      let x = 100;
      let y = 100;

      if (nodeType === 'document') {
        x = 60;
        y = docY;
        docY += 120;
      } else if (nodeType === 'entity') {
        x = 380;
        y = entityY;
        entityY += 100;
      } else if (nodeType === 'finding') {
        x = 700;
        y = findingY;
        findingY += 130;
      }

      return {
        id: n.id,
        type: nodeType,
        position: { x, y },
        data: {
          label: nodeData.filename || nodeData.title || nodeData.label || nodeData.value || n.label || n.id,
          type: nodeType,
          metadata: {
            ...nodeData,
            entity_type: nodeData.field_type || nodeData.entity_type,
          },
        },
      };
    });

    // Format edges
    const formattedEdges = graphData.edges
      .filter(e => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .map(e => {
        const relationshipType = e.relationship_type || e.label || '';
        const isDiscrepancy = /DISCREPANCY|MISMATCH|EVIDENCE|CONTRADICTS/i.test(relationshipType);
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || relationshipType.replace(/_/g, ' ').toLowerCase(),
          animated: isDiscrepancy,
          style: {
            stroke: isDiscrepancy ? '#f43f5e' : '#94a3b8',
            strokeWidth: isDiscrepancy ? 2.5 : 1.5,
            strokeDasharray: isDiscrepancy ? '5,5' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isDiscrepancy ? '#f43f5e' : '#94a3b8',
          },
          labelStyle: {
            fontSize: 10,
            fill: isDiscrepancy ? '#e11d48' : '#64748b',
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.85,
          },
        };
      });

    setNodes(formattedNodes as any);
    setEdges(formattedEdges as any);
  }, [graphData, filterDocs, filterEntities, filterFindings, setNodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          {activeId && (
            <Link to={`/investigations/${activeId}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Investigation Workspace
            </Link>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">CrossDoc Intelligence Graph</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 uppercase">
              Relational Network
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizes multi-document connections, extracted entity linkages, and cross-source discrepancies.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
          <div className="flex items-center text-slate-400 px-2">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filters:
          </div>
          <button
            onClick={() => setFilterDocs(!filterDocs)}
            className={`px-2.5 py-1 rounded-xl transition ${filterDocs ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'}`}
          >
            Docs
          </button>
          <button
            onClick={() => setFilterEntities(!filterEntities)}
            className={`px-2.5 py-1 rounded-xl transition ${filterEntities ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}
          >
            Entities
          </button>
          <button
            onClick={() => setFilterFindings(!filterFindings)}
            className={`px-2.5 py-1 rounded-xl transition ${filterFindings ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-400'}`}
          >
            Discrepancies
          </button>
          <button
            onClick={() => refetch()}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="Refresh Graph"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector Drawer */}
      <div className="relative rounded-2xl border border-slate-200 shadow-xs bg-slate-900 overflow-hidden h-[650px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent mb-2"></div>
            <p className="text-xs">Computing topological multi-document relations...</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-900"
          >
            <Background color="#334155" gap={20} size={1.5} />
            <Controls className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden" />
            <MiniMap 
              nodeColor={(n) => {
                if (n.type === 'document') return '#818cf8';
                if (n.type === 'entity') return '#34d399';
                if (n.type === 'finding') return '#f87171';
                return '#94a3b8';
              }}
              className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden"
            />
          </ReactFlow>
        )}

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl p-5 animate-in fade-in slide-in-from-right-4 duration-150">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Node Inspector
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                selectedNode.data.type === 'document' ? 'bg-indigo-100 text-indigo-800' :
                selectedNode.data.type === 'entity' ? 'bg-emerald-100 text-emerald-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {selectedNode.data.type}
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-2">{selectedNode.data.label}</h4>
            </div>

            {selectedNode.data.metadata && (
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 max-h-48 overflow-y-auto">
                {Object.entries(selectedNode.data.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold text-slate-700 text-right truncate max-w-[140px]" title={String(v)}>
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeId && (
              <Link
                to={`/investigations/${activeId}/evidence`}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-center bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                Inspect in Evidence Vault
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
