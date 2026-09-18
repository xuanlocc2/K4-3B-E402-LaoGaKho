import { motion } from 'framer-motion';
import UnderstandingBadge from './UnderstandingBadge';
import type { ChatMessage } from '../types';
import type { Level } from '../types';

interface TutorResponseProps {
  message: ChatMessage;
  onEditLevel?: () => void;
}

/** Parses `**Mức hiểu: ${level}` from the message content. */
function parseBadgeFromContent(
  content: string
): { level: Level; confidence: number } {
  const levelMatch = content.match(
    /\*\*Mức hiểu:\s*([^\s*]+)\*\*/i
  );
  const confMatch = content.match(/(\d+)%\s*chắc/);
  const rawLevel = levelMatch?.[1]?.toLowerCase();
  const confidence = confMatch?.[1] ? parseInt(confMatch[1], 10) / 100 : 0.45;
  // Only accept values that are valid Level members; fall back to 'beginner'
  const level: Level =
    rawLevel === 'beginner' || rawLevel === 'intermediate' || rawLevel === 'advanced'
      ? rawLevel
      : 'beginner';
  return { level, confidence };
}

export default function TutorResponse({
  message,
  onEditLevel,
}: TutorResponseProps) {
  const isUser = message.role === 'user';
  // Read badge data from the message itself (baked in by App on creation)
  const { level: parsedLevel, confidence: parsedConf } =
    parseBadgeFromContent(message.content);
  const badgeLevel: Level = message.badgeLevel ?? parsedLevel;
  const badgeConfidence: number = message.badgeConfidence ?? parsedConf;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[88%] p-3 rounded-xl ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-card border border-border shadow-sm rounded-tl-sm'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm leading-none mt-0.5 ${
            isUser ? 'bg-primary-foreground/20' : 'bg-primary/10'
          }`}>
            {isUser ? '👤' : 'AI'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Message content — preserve line breaks */}
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>

            {/* Understanding badge — shown only once at bottom of tutor messages */}
            {!isUser && (
              <div className="mt-3 pt-2 border-t border-border/50">
                <UnderstandingBadge
                  level={badgeLevel}
                  confidence={badgeConfidence}
                  onEdit={onEditLevel}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
