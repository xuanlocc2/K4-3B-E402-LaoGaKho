import { motion } from 'framer-motion';
import UnderstandingBadge from './UnderstandingBadge';
import type { ChatMessage } from '../types';
import type { Level } from '../types';

interface TutorResponseProps {
  message: ChatMessage;
  badgeLevel?: Level;
  badgeConfidence?: number;
  onEditLevel?: () => void;
}

export default function TutorResponse({
  message,
  badgeLevel = 'beginner',
  badgeConfidence = 0.45,
  onEditLevel,
}: TutorResponseProps) {
  const isUser = message.role === 'user';

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
            {isUser ? '👤' : '🤖'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Message content — preserve line breaks */}
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>

            {/* Understanding badge — shown only for tutor messages */}
            {!isUser && (
              <div className="mt-3">
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
