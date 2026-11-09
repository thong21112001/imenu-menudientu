'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Drawer, Card, Badge, Button } from '@imenu/ui';
import { apiClient } from '@imenu/utils';
import {
  AiMcpQueryResponse,
  AiKpiCard,
  AiActionLink,
  AiToolExecutionRecord,
} from '@imenu/types';
import {
  TrendingUp,
  AlertTriangle,
  Activity,
  ShieldAlert,
  Send,
  Loader2,
  Terminal,
  ExternalLink,
  RotateCcw,
  Clock,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface PlatformAiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InsightChip {
  id: 'REVENUE_OVERVIEW' | 'CHURN_RISK' | 'UNDERPERFORMING_DIAGNOSE' | 'COMMISSION_AUDIT';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}

const INSIGHT_CHIPS: InsightChip[] = [
  {
    id: 'REVENUE_OVERVIEW',
    title: 'Tổng quan doanh thu & tăng trưởng toàn sàn',
    subtitle: 'Tổng hợp GMV, gói SaaS và đối tác Top doanh thu',
    icon: TrendingUp,
    prompt: 'Tổng quan doanh thu sàn, tăng trưởng GMV và gói Subscription tháng này thế nào?',
  },
  {
    id: 'CHURN_RISK',
    title: 'Cảnh báo nhà hàng sụt giảm đơn (Churn Risk)',
    subtitle: 'Nhà hàng sụt đơn >40% hoặc sắp hết hạn dịch vụ',
    icon: AlertTriangle,
    prompt: 'Phát hiện các đối tác nhà hàng có nguy cơ rời bỏ nền tảng hoặc giảm đơn đột ngột',
  },
  {
    id: 'UNDERPERFORMING_DIAGNOSE',
    title: 'Chẩn đoán nhà hàng hiệu suất thấp & đánh giá xấu',
    subtitle: 'Tỷ lệ hủy món KDS & phản hồi CSAT 1-2 sao',
    icon: Activity,
    prompt: 'Chẩn đoán các nhà hàng có hiệu suất vận hành kém hoặc tỷ lệ hủy đơn cao',
  },
  {
    id: 'COMMISSION_AUDIT',
    title: 'Đối soát bất thường hoa hồng Sales Affiliate',
    subtitle: 'Rà soát quán ảo không phát sinh đơn & tiền hoa hồng rủi ro',
    icon: ShieldAlert,
    prompt: 'Kiểm toán phát hiện các bút toán hoa hồng bất thường của Sales Rep',
  },
];

export const PlatformAiCopilotDrawer: React.FC<PlatformAiCopilotDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  const [prompt, setPrompt] = useState('');
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiMcpQueryResponse | null>(null);

  const handleExecuteQuery = async (queryText: string, chipId?: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setActiveChipId(chipId || null);

    try {
      const response = await apiClient.platform.queryAiMcp({
        prompt: trimmed,
        promptChipId: chipId,
      });

      const payload = (response as any)?.data || response;
      if (payload && (payload.success || payload.summaryMarkdown)) {
        setResult(payload as AiMcpQueryResponse);
      } else {
        throw new Error('Không nhận được dữ liệu phản hồi hợp lệ từ máy chủ.');
      }
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi điều phối truy vấn AI MCP.');
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip: InsightChip) => {
    setPrompt(chip.prompt);
    handleExecuteQuery(chip.prompt, chip.id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    handleExecuteQuery(prompt);
  };

  const handleReset = () => {
    setPrompt('');
    setActiveChipId(null);
    setResult(null);
    setError(null);
  };

  const handleNavigate = (url: string) => {
    router.push(url);
    onClose();
  };

  const getKpiStatusBadge = (status?: 'positive' | 'negative' | 'neutral' | 'warning') => {
    switch (status) {
      case 'positive':
        return <Badge variant="success">Tích cực</Badge>;
      case 'negative':
        return <Badge variant="danger">Cần chú ý</Badge>;
      case 'warning':
        return <Badge variant="amber">Cảnh báo</Badge>;
      default:
        return <Badge variant="neutral">Ổn định</Badge>;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      title="Phân Tích Điều Hành Nền Tảng (SuperAdmin AI MCP)"
    >
      <div className="flex flex-col h-full space-y-5 text-sm" data-testid="platform-ai-copilot-drawer">
        {/* Subtitle & Engine Metadata */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
          <div className="flex items-center gap-2 text-xs text-[#718077]">
            <Cpu className="w-3.5 h-3.5 text-[#245846]" />
            <span className="font-medium text-[#2c3b34]">Model Context Protocol Core</span>
          </div>
          <Badge variant="brand" dot>
            SuperAdmin Only
          </Badge>
        </div>

        {/* Query Input Box */}
        <form onSubmit={handleFormSubmit} className="space-y-2">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập câu hỏi phân tích dữ liệu toàn sàn (VD: Tổng quan doanh thu tháng này)..."
              maxLength={1000}
              rows={2}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-xs bg-[#e7e2d6]/70 border border-[#ded8cb] rounded-lg text-[#111815] placeholder-[#718077] focus:outline-none focus:border-[#245846] focus:bg-[#f0ece3] transition-colors resize-none disabled:opacity-50"
              data-testid="copilot-prompt-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-[#718077]">
              <span>{prompt.length}/1000 ký tự</span>
              <div className="flex items-center gap-2">
                {result && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] text-[#718077] hover:text-[#111815] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Làm mới
                  </button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-1.5 h-7 px-3 text-xs"
                  data-testid="copilot-submit-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xử lý</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Phân tích</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* 1-Click Insight Chips */}
        {!result && !loading && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2c3b34]">
              <Layers className="w-3.5 h-3.5 text-[#245846]" />
              <span>Khuyến nghị Phân tích Nhanh (1-Click Insight Chips)</span>
            </div>
            <div className="grid grid-cols-1 gap-2" data-testid="insight-chips-container">
              {INSIGHT_CHIPS.map((chip) => {
                const IconComponent = chip.icon;
                const isActive = activeChipId === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className={`flex items-start gap-3 p-3 text-left rounded-lg border transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#245846]/10 border-[#245846] text-[#111815]'
                        : 'bg-[#e5dfd3]/60 hover:bg-[#ded8cb] border-[#ded8cb] text-[#111815]'
                    }`}
                    data-testid={`insight-chip-${chip.id.toLowerCase()}`}
                  >
                    <div className="p-1.5 rounded-md bg-[#ded8cb] text-[#245846] shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#111815] leading-snug">
                        {chip.title}
                      </div>
                      <div className="text-[11px] text-[#718077] mt-0.5 truncate">
                        {chip.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-[#e5dfd3]/40 rounded-xl border border-[#ded8cb]">
            <Loader2 className="w-6 h-6 text-[#245846] animate-spin" />
            <div className="text-xs font-medium text-[#2c3b34]">
              Đang điều phối MCP Tools & tổng hợp dữ liệu...
            </div>
            <div className="text-[11px] text-[#718077]">
              Truy vấn cơ sở dữ liệu thời gian thực theo chuẩn Zero-Bloat
            </div>
          </div>
        )}

        {/* Error Card */}
        {error && !loading && (
          <div className="p-3.5 rounded-lg bg-[#c85a32]/10 border border-[#c85a32]/30 text-[#a64522] space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Không thể thực thi yêu cầu</span>
            </div>
            <div className="text-xs text-[#a64522]/90">{error}</div>
            <button
              type="button"
              onClick={() => handleExecuteQuery(prompt, activeChipId || undefined)}
              className="text-xs font-medium underline hover:text-[#7a2c10] cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Result: Structured Executive Brief */}
        {result && !loading && (
          <div className="space-y-4" data-testid="copilot-result-container">
            {/* Header Status & MCP Latency */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#e5dfd3]/70 border border-[#ded8cb] text-[11px]">
              <div className="flex items-center gap-1.5 text-[#2c3b34] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34a87a]" />
                <span>
                  {result.mode === 'DETERMINISTIC_FALLBACK'
                    ? 'Deterministic Rule-based Synthesizer'
                    : 'LLM Function Calling Engine'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#718077]">
                <Clock className="w-3 h-3" />
                <span>{result.responseTimeMs}ms</span>
              </div>
            </div>

            {/* MCP Tools Executed Badges */}
            {result.toolCallsExecuted && result.toolCallsExecuted.length > 0 && (
              <div className="space-y-1.5" data-testid="copilot-tools-executed">
                <div className="text-[11px] font-semibold text-[#718077] uppercase tracking-wider">
                  MCP Tools Đã Điều Phối ({result.toolCallsExecuted.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.toolCallsExecuted.map((tc, idx) => (
                    <Badge key={idx} variant="neutral" dot className="text-[10px] font-mono">
                      {tc.tool} · {tc.durationMs}ms
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* KPI Cards Grid */}
            {result.kpiCards && result.kpiCards.length > 0 && (
              <div className="space-y-1.5" data-testid="copilot-kpi-cards">
                <div className="text-[11px] font-semibold text-[#718077] uppercase tracking-wider">
                  Chỉ Số Trọng Yếu (KPI Cards)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.kpiCards.map((kpi, idx) => (
                    <Card
                      key={idx}
                      className="p-3 bg-[#e7e2d6]/80 border-[#ded8cb] rounded-lg space-y-1"
                      data-testid="copilot-kpi-card"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#718077] font-medium truncate">
                          {kpi.title}
                        </span>
                        {getKpiStatusBadge(kpi.status)}
                      </div>
                      <div className="text-base font-bold text-[#111815] tracking-tight">
                        {typeof kpi.value === 'number'
                          ? kpi.value.toLocaleString('vi-VN')
                          : kpi.value}
                      </div>
                      {kpi.change && (
                        <div className="text-[11px] text-[#245846] font-medium">
                          {kpi.change}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Markdown Content */}
            {result.summaryMarkdown && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-[#718077] uppercase tracking-wider">
                  Bản Tóm Tắt Điều Hành (Executive Summary)
                </div>
                <div
                  className="p-3.5 rounded-lg bg-[#e5dfd3]/80 border border-[#ded8cb] text-xs text-[#111815] leading-relaxed whitespace-pre-line space-y-2 font-normal"
                  data-testid="copilot-summary-markdown"
                >
                  {result.summaryMarkdown}
                </div>
              </div>
            )}

            {/* Action Links */}
            {result.actionLinks && result.actionLinks.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#ded8cb]" data-testid="copilot-action-links">
                <div className="text-[11px] font-semibold text-[#718077] uppercase tracking-wider">
                  Hành Động Đề Xuất (Navigation Actions)
                </div>
                <div className="flex flex-col gap-2">
                  {result.actionLinks.map((action, idx) => (
                    <Button
                      key={idx}
                      variant={action.type === 'primary' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleNavigate(action.url)}
                      className="w-full flex items-center justify-between text-xs py-2 px-3 h-auto"
                      data-testid="copilot-action-button"
                    >
                      <span className="font-medium truncate">{action.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-2 text-[#718077]" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};
