"use client";

import Link from 'next/link';
import { strings } from '@/lib/strings';

type Activity = {
  id: string;
  type: 'question' | 'answer';
  title?: string;
  body?: string;
  created_at: string;
  question_id?: string;
  questions?: { title: string } | { id: string; title: string }[];
};

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

export default function ActivityCard({ activity, index }: ActivityCardProps) {
  const getActivityIcon = () => {
    return activity.type === 'question' ? '❓' : '💬';
  };

  const getActivityLabel = () => {
    return activity.type === 'question' ? strings.activity.questionPosted : strings.activity.answerPosted;
  };

  const getActivityTitle = () => {
    if (activity.type === 'question') return activity.title;
    
    // Handle questions field which can be object or array
    const questions = activity.questions;
    if (!questions) return undefined;
    if (Array.isArray(questions)) return questions[0]?.title;
    return questions.title;
  };

  const getActivityLink = () => {
    return activity.type === 'question' ? `/q/${activity.id}` : `/q/${activity.question_id}`;
  };

  return (
    <div 
      className="flex items-start gap-3 p-3 bg-light rounded-lg hover:bg-accent/10 transition-colors"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-sm">
        {getActivityIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-accent">
            {getActivityLabel()}
          </span>
          <span className="text-xs text-neutral">
            {new Date(activity.created_at).toLocaleDateString('uz-UZ')}
          </span>
        </div>
        <div className="text-sm text-primary font-medium mb-1">
          {getActivityTitle()}
        </div>
        {activity.type === 'answer' && activity.body && (
          <div className="text-xs text-neutral line-clamp-2">
            {activity.body.substring(0, 100)}...
          </div>
        )}
        <div className="mt-2">
          <Link 
            href={getActivityLink()}
            className="text-xs text-accent hover:text-secondary transition-colors"
          >
            {strings.activity.view} →
          </Link>
        </div>
      </div>
    </div>
  );
}
