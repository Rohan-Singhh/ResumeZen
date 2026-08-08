import { useQuery } from '@tanstack/react-query';
import { getResumeHistory } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';

export function useResumeHistory() {
  const { currentUser } = useAuth();

  return useQuery({
    queryKey: ['resumeHistory', currentUser?._id],
    queryFn: getResumeHistory,
    enabled: !!currentUser, // Only fetch when user is logged in
  });
}
