"use client";

import { useParams } from 'next/navigation';
import UserProfilePage from '@/components/UserProfilePage';

export default function UsernameProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username as string;

  return <UserProfilePage identifier={username} isUsername={true} />;
}