import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRightLeft, MessageSquare } from 'lucide-react';

/**
 * SegmentWarning — shown when the user belongs to the "broken" segment.
 * Displays a warning card with reason, suggestion, and action buttons.
 *
 * @see HV3 §4 Component 2 (SegmentWarning)
 *
 * Reasons:
 * - grade_missing → user has no grade in the system
 * - no_evidence  → no transcript evidence for the query
 * - no_history   → no interaction history available
 */
export type WarningReason = 'grade_missing' | 'no_evidence' | 'no_history';

interface SegmentWarningProps {
  reason: WarningReason;
  onTransferGV: () => void;
  onDefaultAnswer: () => void;
}

const REASON_LABELS: Record<WarningReason, string> = {
  grade_missing: 'Bạn chưa có điểm trong hệ thống VLearn',
  no_evidence: 'Mình không có căn cứ trong transcript cho đoạn này',
  no_history: 'Mình không có lịch sử tương tác với bạn',
};

export default function SegmentWarning({
  reason,
  onTransferGV,
  onDefaultAnswer,
}: SegmentWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-warning/10 border-2 border-warning/40 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">
            Mình nhận thấy:
          </h4>

          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            <li>• {REASON_LABELS[reason]}</li>
            <li>• Mình không thể suy ra mức hiểu của bạn một cách chính xác</li>
          </ul>

          <p className="mt-3 text-sm text-foreground">
            💡 Nếu mình trả lời với giả định sai, bạn có thể nhận được
            câu trả lời quá dễ hoặc quá khó.
          </p>

          <p className="mt-2 text-sm font-medium text-foreground">
            💡 Đề xuất: Bạn nên hỏi giảng viên trực tiếp. Giảng viên sẽ
            biết bạn đang ở mức nào.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onTransferGV}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Chuyển giảng viên
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDefaultAnswer}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground bg-secondary rounded-xl hover:bg-secondary/80 transition-colors border border-border"
            >
              <MessageSquare className="w-4 h-4" />
              Trả lời mặc định
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
