// src/lib/graphql/helpers/commentMutationHandler.ts
import { ApolloError } from '@apollo/client';

export const handleCommentMutation = async (
  mutationFn: () => Promise<any>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) => {
  try {
    const response = await mutationFn();

    // Check if the mutation was successful
    if (response.data) {
      onSuccess?.();
      return response.data;
    }

    throw new Error('Mutation response was empty');
  } catch (error) {
    if (error instanceof ApolloError) {
      // Check for authentication errors
      const authError = error.graphQLErrors.find(e =>
        e.message.includes('Authentication required') ||
        e.extensions?.code === 'UNAUTHENTICATED'
      );

      if (authError) {
        console.error('Authentication error:', authError);
        // You might want to trigger a re-login here
        onError?.(new Error('Please log in to comment'));
        return;
      }
    }

    console.error('Mutation error:', error);
    onError?.(error as Error);
  }
};