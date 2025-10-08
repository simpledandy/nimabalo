"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { strings, formatString } from '@/lib/strings';
import LoadingSkeleton from './LoadingSkeleton';
import Link from 'next/link';

type Question = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  user_id: string;
  same_count?: number;
};

type Answer = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  question_id: string;
  questions?: { title: string } | { title: string }[];
};

interface UserContentListProps {
  userId: string;
  type: 'questions' | 'answers';
  limit?: number;
  showTitle?: boolean;
  isOwnProfile?: boolean;
  profileName?: string;
}

export default function UserContentList({ 
  userId, 
  type, 
  limit = 3, 
  showTitle = true,
  isOwnProfile = false,
  profileName = ''
}: UserContentListProps) {
  const [items, setItems] = useState<(Question | Answer)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        
        if (type === 'questions') {
          const { data } = await supabase
            .from('questions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          setItems(data || []);
        } else {
          const { data } = await supabase
            .from('answers')
            .select('id, body, created_at, user_id, question_id, questions!inner(title)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          setItems(data || []);
        }
      } catch (error) {
        console.error(`Error fetching user ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userId, type, limit]);

  const getTitle = () => {
    if (isOwnProfile) {
      if (type === 'questions') {
        return strings.userContentList.myQuestions;
      }
      return strings.userContentList.myAnswers;
    } else {
      if (type === 'questions') {
        return formatString(strings.userContentList.userQuestions, { name: profileName });
      }
      return formatString(strings.userContentList.userAnswers, { name: profileName });
    }
  };

  const getIcon = () => {
    return type === 'questions' ? '❓' : '💬';
  };

  const getEmptyMessage = () => {
    if (isOwnProfile) {
      if (type === 'questions') {
        return strings.userContentList.noQuestionsYet;
      }
      return strings.userContentList.noAnswersYet;
    } else {
      if (type === 'questions') {
        return formatString(strings.userContentList.userNoQuestionsYet, { name: profileName });
      }
      return formatString(strings.userContentList.userNoAnswersYet, { name: profileName });
    }
  };

  if (loading) {
    return (
      <div className="card hover-lift">
        {showTitle && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{getIcon()}</span>
            <h2 className="text-xl font-bold text-primary">{getTitle()}</h2>
          </div>
        )}
        <LoadingSkeleton variant="card" lines={4} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card hover-lift">
        {showTitle && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{getIcon()}</span>
            <h2 className="text-xl font-bold text-primary">{getTitle()}</h2>
          </div>
        )}
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-neutral mb-2">{getEmptyMessage()}</p>
          <p className="text-sm text-neutral">
            {type === 'questions' ? strings.userContentList.firstQuestionPrompt : strings.userContentList.firstAnswerPrompt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover-lift">
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{getIcon()}</span>
          <h2 className="text-xl font-bold text-primary">{getTitle()}</h2>
        </div>
      )}
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-100 rounded-lg p-4 hover:bg-accent/5 transition-colors">
            {type === 'questions' ? (
              <div>
                <Link 
                  href={`/q/${item.id}`}
                  className="text-lg font-semibold text-primary hover:text-secondary transition-colors block mb-2"
                >
                  {(item as Question).title}
                </Link>
                <div className="text-sm text-neutral">
                  {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            ) : (
              <div>
                <Link 
                  href={`/q/${(item as Answer).question_id}`}
                  className="text-sm font-medium text-accent hover:text-secondary transition-colors block mb-1"
                >
                  {(() => {
                    const questions = (item as Answer).questions;
                    if (Array.isArray(questions)) {
                      return questions[0]?.title;
                    }
                    return questions?.title;
                  })()}
                </Link>
                <div className="text-sm text-neutral mb-2 line-clamp-2">
                  {(item as Answer).body.substring(0, 100)}...
                </div>
                <div className="text-xs text-neutral">
                  {new Date(item.created_at).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {items.length >= limit && (
          <div className="text-center pt-4">
            <Link 
              href={`/user/${userId}`}
              className="text-sm text-accent hover:text-secondary transition-colors"
            >
              Barchasini ko'rish →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}