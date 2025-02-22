import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Comment = {
  __typename?: 'Comment';
  activeViewers: Scalars['Int']['output'];
  avatarImg?: Maybe<Scalars['String']['output']>;
  commentId: Scalars['Int']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  depth: Scalars['Int']['output'];
  interactionState: CommentInteractionState;
  isDeleted: Scalars['Boolean']['output'];
  isEdited: Scalars['Boolean']['output'];
  lastActivity: Scalars['String']['output'];
  metrics: CommentMetrics;
  parentCommentId?: Maybe<Scalars['Int']['output']>;
  path: Scalars['String']['output'];
  postId: Scalars['Int']['output'];
  replies?: Maybe<Array<Comment>>;
  reputationScore?: Maybe<Scalars['Int']['output']>;
  rootCommentId?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  user: User;
  userId: Scalars['Int']['output'];
  username: Scalars['String']['output'];
};

export type CommentActivity = {
  __typename?: 'CommentActivity';
  activeViewers: Scalars['Int']['output'];
  commentId: Scalars['Int']['output'];
  lastActivity: Scalars['String']['output'];
};

export type CommentInteractionState = {
  __typename?: 'CommentInteractionState';
  dislike: Scalars['Boolean']['output'];
  like: Scalars['Boolean']['output'];
  report: Scalars['Boolean']['output'];
};

export type CommentMetrics = {
  __typename?: 'CommentMetrics';
  dislikeCount: Scalars['Int']['output'];
  likeCount: Scalars['Int']['output'];
  replyCount: Scalars['Int']['output'];
  reportCount: Scalars['Int']['output'];
};

export type CreateCommentInput = {
  content: Scalars['String']['input'];
  parentCommentId?: InputMaybe<Scalars['Int']['input']>;
  postId: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createComment: Comment;
  deleteComment: Scalars['Boolean']['output'];
  dislikeComment: Comment;
  likeComment: Comment;
  reportComment: Comment;
  updateComment: Comment;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
};


export type MutationDeleteCommentArgs = {
  commentId: Scalars['Int']['input'];
};


export type MutationDislikeCommentArgs = {
  commentId: Scalars['Int']['input'];
};


export type MutationLikeCommentArgs = {
  commentId: Scalars['Int']['input'];
};


export type MutationReportCommentArgs = {
  commentId: Scalars['Int']['input'];
  reason: Scalars['String']['input'];
};


export type MutationUpdateCommentArgs = {
  input: UpdateCommentInput;
};

export type Query = {
  __typename?: 'Query';
  comment?: Maybe<Comment>;
  comments: Array<Comment>;
};


export type QueryCommentArgs = {
  commentId: Scalars['Int']['input'];
};


export type QueryCommentsArgs = {
  page?: Scalars['Int']['input'];
  pageSize?: Scalars['Int']['input'];
  parentCommentId?: InputMaybe<Scalars['Int']['input']>;
  postId: Scalars['Int']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  commentActivity: CommentActivity;
  commentAdded: Comment;
  commentDeleted: Scalars['String']['output'];
  commentUpdated: Comment;
};


export type SubscriptionCommentActivityArgs = {
  postId: Scalars['Int']['input'];
};


export type SubscriptionCommentAddedArgs = {
  postId: Scalars['Int']['input'];
};


export type SubscriptionCommentDeletedArgs = {
  postId: Scalars['Int']['input'];
};


export type SubscriptionCommentUpdatedArgs = {
  postId: Scalars['Int']['input'];
};

export type UpdateCommentInput = {
  commentId: Scalars['Int']['input'];
  content: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  avatarImg?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  credentials?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  expertiseArea?: Maybe<Scalars['String']['output']>;
  reputationScore?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  userId: Scalars['Int']['output'];
  username: Scalars['String']['output'];
};

export type CommentFieldsFragment = { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null };

export type GetCommentQueryVariables = Exact<{
  commentId: Scalars['Int']['input'];
}>;


export type GetCommentQuery = { __typename?: 'Query', comment?: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } | null };

export type GetCommentsQueryVariables = Exact<{
  postId: Scalars['Int']['input'];
  parentCommentId?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetCommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, username: string, avatarImg?: string | null, reputationScore?: number | null, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, username: string, avatarImg?: string | null, reputationScore?: number | null, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null }> | null, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null } }> | null, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> };

export type CreateCommentMutationVariables = Exact<{
  input: CreateCommentInput;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, username: string, avatarImg?: string | null, reputationScore?: number | null, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null }> | null, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } } };

export type UpdateCommentMutationVariables = Exact<{
  input: UpdateCommentInput;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } };

export type DeleteCommentMutationVariables = Exact<{
  commentId: Scalars['Int']['input'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: boolean };

export type LikeCommentMutationVariables = Exact<{
  commentId: Scalars['Int']['input'];
}>;


export type LikeCommentMutation = { __typename?: 'Mutation', likeComment: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } };

export type DislikeCommentMutationVariables = Exact<{
  commentId: Scalars['Int']['input'];
}>;


export type DislikeCommentMutation = { __typename?: 'Mutation', dislikeComment: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } };

export type ReportCommentMutationVariables = Exact<{
  commentId: Scalars['Int']['input'];
  reason: Scalars['String']['input'];
}>;


export type ReportCommentMutation = { __typename?: 'Mutation', reportComment: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } };

export type OnCommentAddedSubscriptionVariables = Exact<{
  postId: Scalars['Int']['input'];
}>;


export type OnCommentAddedSubscription = { __typename?: 'Subscription', commentAdded: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } };

export type OnCommentUpdatedSubscriptionVariables = Exact<{
  postId: Scalars['Int']['input'];
}>;


export type OnCommentUpdatedSubscription = { __typename?: 'Subscription', commentUpdated: { __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, username: string, avatarImg?: string | null, reputationScore?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, user: { __typename?: 'User', userId: number, username: string, email: string, avatarImg?: string | null, reputationScore?: number | null, expertiseArea?: string | null, credentials?: string | null, createdAt: string, updatedAt?: string | null }, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean }, replies?: Array<{ __typename?: 'Comment', commentId: number, content: string, userId: number, postId: number, parentCommentId?: number | null, path: string, depth: number, rootCommentId?: number | null, isEdited: boolean, isDeleted: boolean, createdAt: string, updatedAt?: string | null, lastActivity: string, activeViewers: number, metrics: { __typename?: 'CommentMetrics', likeCount: number, dislikeCount: number, replyCount: number, reportCount: number }, interactionState: { __typename?: 'CommentInteractionState', like: boolean, dislike: boolean, report: boolean } }> | null } };

export type OnCommentDeletedSubscriptionVariables = Exact<{
  postId: Scalars['Int']['input'];
}>;


export type OnCommentDeletedSubscription = { __typename?: 'Subscription', commentDeleted: string };

export type OnCommentActivitySubscriptionVariables = Exact<{
  postId: Scalars['Int']['input'];
}>;


export type OnCommentActivitySubscription = { __typename?: 'Subscription', commentActivity: { __typename?: 'CommentActivity', commentId: number, activeViewers: number, lastActivity: string } };

export const CommentFieldsFragmentDoc = gql`
    fragment CommentFields on Comment {
  commentId
  content
  userId
  postId
  parentCommentId
  path
  depth
  rootCommentId
  user {
    userId
    username
    email
    avatarImg
    reputationScore
    expertiseArea
    credentials
    createdAt
    updatedAt
  }
  username
  avatarImg
  reputationScore
  metrics {
    likeCount
    dislikeCount
    replyCount
    reportCount
  }
  interactionState {
    like
    dislike
    report
  }
  isEdited
  isDeleted
  createdAt
  updatedAt
  lastActivity
  activeViewers
  replies {
    commentId
    content
    userId
    postId
    parentCommentId
    path
    depth
    rootCommentId
    metrics {
      likeCount
      dislikeCount
      replyCount
      reportCount
    }
    interactionState {
      like
      dislike
      report
    }
    isEdited
    isDeleted
    createdAt
    updatedAt
    lastActivity
    activeViewers
  }
}
    `;
export const GetCommentDocument = gql`
  query GetComments($postId: Int!, $parentCommentId: Int, $page: Int, $pageSize: Int) {
    comments(
      postId: $postId
      parentCommentId: $parentCommentId
      page: $page
      pageSize: $pageSize
    ) {
      ...CommentFields
      replies {
        ...CommentFields
        replies {
          ...CommentFields
          replies {
            ...CommentFields
          }
        }
      }
    }
  }
    ${CommentFieldsFragmentDoc}`;

/**
 * __useGetCommentQuery__
 *
 * To run a query within a React component, call `useGetCommentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentQuery({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useGetCommentQuery(baseOptions: Apollo.QueryHookOptions<GetCommentQuery, GetCommentQueryVariables> & ({ variables: GetCommentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
      }
export function useGetCommentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentQuery, GetCommentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
        }
export function useGetCommentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommentQuery, GetCommentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommentQuery, GetCommentQueryVariables>(GetCommentDocument, options);
        }
export type GetCommentQueryHookResult = ReturnType<typeof useGetCommentQuery>;
export type GetCommentLazyQueryHookResult = ReturnType<typeof useGetCommentLazyQuery>;
export type GetCommentSuspenseQueryHookResult = ReturnType<typeof useGetCommentSuspenseQuery>;
export type GetCommentQueryResult = Apollo.QueryResult<GetCommentQuery, GetCommentQueryVariables>;
export const GetCommentsDocument = gql`
    query GetComments($postId: Int!, $parentCommentId: Int, $page: Int, $pageSize: Int) {
  comments(
    postId: $postId
    parentCommentId: $parentCommentId
    page: $page
    pageSize: $pageSize
  ) {
    ...CommentFields
    replies {
      ...CommentFields
      replies {
        ...CommentFields
      }
    }
  }
}
    ${CommentFieldsFragmentDoc}`;

/**
 * __useGetCommentsQuery__
 *
 * To run a query within a React component, call `useGetCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCommentsQuery({
 *   variables: {
 *      postId: // value for 'postId'
 *      parentCommentId: // value for 'parentCommentId'
 *      page: // value for 'page'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetCommentsQuery(baseOptions: Apollo.QueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables> & ({ variables: GetCommentsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
      }
export function useGetCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
        }
export function useGetCommentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCommentsQuery, GetCommentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCommentsQuery, GetCommentsQueryVariables>(GetCommentsDocument, options);
        }
export type GetCommentsQueryHookResult = ReturnType<typeof useGetCommentsQuery>;
export type GetCommentsLazyQueryHookResult = ReturnType<typeof useGetCommentsLazyQuery>;
export type GetCommentsSuspenseQueryHookResult = ReturnType<typeof useGetCommentsSuspenseQuery>;
export type GetCommentsQueryResult = Apollo.QueryResult<GetCommentsQuery, GetCommentsQueryVariables>;
export const CreateCommentDocument = gql`
    mutation CreateComment($input: CreateCommentInput!) {
  createComment(input: $input) {
    ...CommentFields
    replies {
      ...CommentFields
    }
  }
}
    ${CommentFieldsFragmentDoc}`;
export type CreateCommentMutationFn = Apollo.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, options);
      }
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const UpdateCommentDocument = gql`
    mutation UpdateComment($input: UpdateCommentInput!) {
  updateComment(input: $input) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export type UpdateCommentMutationFn = Apollo.MutationFunction<UpdateCommentMutation, UpdateCommentMutationVariables>;

/**
 * __useUpdateCommentMutation__
 *
 * To run a mutation, you first call `useUpdateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCommentMutation, { data, loading, error }] = useUpdateCommentMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCommentMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCommentMutation, UpdateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCommentMutation, UpdateCommentMutationVariables>(UpdateCommentDocument, options);
      }
export type UpdateCommentMutationHookResult = ReturnType<typeof useUpdateCommentMutation>;
export type UpdateCommentMutationResult = Apollo.MutationResult<UpdateCommentMutation>;
export type UpdateCommentMutationOptions = Apollo.BaseMutationOptions<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($commentId: Int!) {
  deleteComment(commentId: $commentId)
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const LikeCommentDocument = gql`
    mutation LikeComment($commentId: Int!) {
  likeComment(commentId: $commentId) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export type LikeCommentMutationFn = Apollo.MutationFunction<LikeCommentMutation, LikeCommentMutationVariables>;

/**
 * __useLikeCommentMutation__
 *
 * To run a mutation, you first call `useLikeCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeCommentMutation, { data, loading, error }] = useLikeCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useLikeCommentMutation(baseOptions?: Apollo.MutationHookOptions<LikeCommentMutation, LikeCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LikeCommentMutation, LikeCommentMutationVariables>(LikeCommentDocument, options);
      }
export type LikeCommentMutationHookResult = ReturnType<typeof useLikeCommentMutation>;
export type LikeCommentMutationResult = Apollo.MutationResult<LikeCommentMutation>;
export type LikeCommentMutationOptions = Apollo.BaseMutationOptions<LikeCommentMutation, LikeCommentMutationVariables>;
export const DislikeCommentDocument = gql`
    mutation DislikeComment($commentId: Int!) {
  dislikeComment(commentId: $commentId) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export type DislikeCommentMutationFn = Apollo.MutationFunction<DislikeCommentMutation, DislikeCommentMutationVariables>;

/**
 * __useDislikeCommentMutation__
 *
 * To run a mutation, you first call `useDislikeCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDislikeCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [dislikeCommentMutation, { data, loading, error }] = useDislikeCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *   },
 * });
 */
export function useDislikeCommentMutation(baseOptions?: Apollo.MutationHookOptions<DislikeCommentMutation, DislikeCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DislikeCommentMutation, DislikeCommentMutationVariables>(DislikeCommentDocument, options);
      }
export type DislikeCommentMutationHookResult = ReturnType<typeof useDislikeCommentMutation>;
export type DislikeCommentMutationResult = Apollo.MutationResult<DislikeCommentMutation>;
export type DislikeCommentMutationOptions = Apollo.BaseMutationOptions<DislikeCommentMutation, DislikeCommentMutationVariables>;
export const ReportCommentDocument = gql`
    mutation ReportComment($commentId: Int!, $reason: String!) {
  reportComment(commentId: $commentId, reason: $reason) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export type ReportCommentMutationFn = Apollo.MutationFunction<ReportCommentMutation, ReportCommentMutationVariables>;

/**
 * __useReportCommentMutation__
 *
 * To run a mutation, you first call `useReportCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReportCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reportCommentMutation, { data, loading, error }] = useReportCommentMutation({
 *   variables: {
 *      commentId: // value for 'commentId'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useReportCommentMutation(baseOptions?: Apollo.MutationHookOptions<ReportCommentMutation, ReportCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReportCommentMutation, ReportCommentMutationVariables>(ReportCommentDocument, options);
      }
export type ReportCommentMutationHookResult = ReturnType<typeof useReportCommentMutation>;
export type ReportCommentMutationResult = Apollo.MutationResult<ReportCommentMutation>;
export type ReportCommentMutationOptions = Apollo.BaseMutationOptions<ReportCommentMutation, ReportCommentMutationVariables>;
export const OnCommentAddedDocument = gql`
    subscription OnCommentAdded($postId: Int!) {
  commentAdded(postId: $postId) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;

/**
 * __useOnCommentAddedSubscription__
 *
 * To run a query within a React component, call `useOnCommentAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommentAddedSubscription({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useOnCommentAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables> & ({ variables: OnCommentAddedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnCommentAddedSubscription, OnCommentAddedSubscriptionVariables>(OnCommentAddedDocument, options);
      }
export type OnCommentAddedSubscriptionHookResult = ReturnType<typeof useOnCommentAddedSubscription>;
export type OnCommentAddedSubscriptionResult = Apollo.SubscriptionResult<OnCommentAddedSubscription>;
export const OnCommentUpdatedDocument = gql`
    subscription OnCommentUpdated($postId: Int!) {
  commentUpdated(postId: $postId) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;

/**
 * __useOnCommentUpdatedSubscription__
 *
 * To run a query within a React component, call `useOnCommentUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommentUpdatedSubscription({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useOnCommentUpdatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnCommentUpdatedSubscription, OnCommentUpdatedSubscriptionVariables> & ({ variables: OnCommentUpdatedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnCommentUpdatedSubscription, OnCommentUpdatedSubscriptionVariables>(OnCommentUpdatedDocument, options);
      }
export type OnCommentUpdatedSubscriptionHookResult = ReturnType<typeof useOnCommentUpdatedSubscription>;
export type OnCommentUpdatedSubscriptionResult = Apollo.SubscriptionResult<OnCommentUpdatedSubscription>;
export const OnCommentDeletedDocument = gql`
    subscription OnCommentDeleted($postId: Int!) {
  commentDeleted(postId: $postId)
}
    `;

/**
 * __useOnCommentDeletedSubscription__
 *
 * To run a query within a React component, call `useOnCommentDeletedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentDeletedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommentDeletedSubscription({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useOnCommentDeletedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnCommentDeletedSubscription, OnCommentDeletedSubscriptionVariables> & ({ variables: OnCommentDeletedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnCommentDeletedSubscription, OnCommentDeletedSubscriptionVariables>(OnCommentDeletedDocument, options);
      }
export type OnCommentDeletedSubscriptionHookResult = ReturnType<typeof useOnCommentDeletedSubscription>;
export type OnCommentDeletedSubscriptionResult = Apollo.SubscriptionResult<OnCommentDeletedSubscription>;
export const OnCommentActivityDocument = gql`
    subscription OnCommentActivity($postId: Int!) {
  commentActivity(postId: $postId) {
    commentId
    activeViewers
    lastActivity
  }
}
    `;

/**
 * __useOnCommentActivitySubscription__
 *
 * To run a query within a React component, call `useOnCommentActivitySubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnCommentActivitySubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnCommentActivitySubscription({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useOnCommentActivitySubscription(baseOptions: Apollo.SubscriptionHookOptions<OnCommentActivitySubscription, OnCommentActivitySubscriptionVariables> & ({ variables: OnCommentActivitySubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnCommentActivitySubscription, OnCommentActivitySubscriptionVariables>(OnCommentActivityDocument, options);
      }
export type OnCommentActivitySubscriptionHookResult = ReturnType<typeof useOnCommentActivitySubscription>;
export type OnCommentActivitySubscriptionResult = Apollo.SubscriptionResult<OnCommentActivitySubscription>;