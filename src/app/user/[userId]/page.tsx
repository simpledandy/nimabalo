"use client";

import { useParams } from 'next/navigation';
import UserProfilePage from '@/components/UserProfilePage';

export default function UserIdProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId as string;

  return <UserProfilePage identifier={userId} isUsername={false} />;
}