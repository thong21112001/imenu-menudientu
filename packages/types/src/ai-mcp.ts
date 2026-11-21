/**
 * ai-mcp.ts
 *
 * Kiểu dữ liệu chia sẻ cho phân hệ SuperAdmin AI Copilot & MCP Tools (Phase 18).
 * Chuẩn hóa giao tiếp giữa imenu-api và imenu-admin.
 */

export type McpToolScope = 'PLATFORM' | 'RESTAURANT' | 'BRANCH';

export interface McpToolPropertySchema {
  type: string;
  description?: string;
  enum?: (string | number | boolean)[];
  default?: any;
  minimum?: number;
  maximum?: number;
}

export interface McpToolInputSchema {
  type: 'object';
  properties?: Record<string, McpToolPropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface McpToolMetadata {
  name: string;
  description: string;
  scope: McpToolScope;
  isReadOnly: boolean;
  inputSchema?: McpToolInputSchema;
}

export interface AiKpiCard {
  title: string;
  value: string | number;
  change?: string;
  status?: 'positive' | 'negative' | 'neutral' | 'warning';
}

export interface AiActionLink {
  label: string;
  url: string;
  type?: 'primary' | 'secondary';
}

export interface AiToolExecutionRecord {
  tool: string;
  arguments: Record<string, any>;
  durationMs: number;
  success: boolean;
}

export interface AiMcpQueryRequest {
  prompt: string;
  promptChipId?:
    | 'REVENUE_OVERVIEW'
    | 'CHURN_RISK'
    | 'COMMISSION_AUDIT'
    | 'UNDERPERFORMING_DIAGNOSE'
    | string;
}

export interface AiMcpQueryResponse {
  success: boolean;
  mode: 'DETERMINISTIC_FALLBACK' | 'LLM_GENERATED';
  provider: string;
  query: string;
  promptChipId?: string;
  summaryMarkdown: string;
  kpiCards: AiKpiCard[];
  toolCallsExecuted: AiToolExecutionRecord[];
  actionLinks: AiActionLink[];
  responseTimeMs: number;
}

