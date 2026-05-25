import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumeHistory, processResume } from '../services/resumeService';
import { useAuth } from '../context/AuthContext';

export function useResumeHistory() {
  const { currentUser } = useAuth();
  
  return useQuery({
    queryKey: ['resumeHistory', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) return [];
      const data = await getResumeHistory();
      return data;
    },
    enabled: !!currentUser, // Only fetch when user is logged in
  });
}

export function useProcessResume() {
  const queryClient = useQueryClient();
  const { currentUser, fetchUserPlans } = useAuth();

  return useMutation({
    mutationFn: (fileInfo) => processResume(fileInfo),
    onSuccess: async () => {
      // Invalidate the history cache to trigger an automatic refetch
      queryClient.invalidateQueries({ queryKey: ['resumeHistory', currentUser?.uid] });
      // Update plan credits
      await fetchUserPlans(true);
    },
    onError: async () => {
      // Still fetch plans in case of backend refund or error logic
      await fetchUserPlans(true);
    }
  });
}
