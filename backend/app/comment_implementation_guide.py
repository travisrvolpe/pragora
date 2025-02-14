"""# Implementation Guide: Real-time Comments and Threaded Posts
The implementation involves several major components:

WebSocket integration for real-time updates
GraphQL layer for efficient data fetching
Database schema updates for threading support
State management with Apollo Client
Optimistic updates for better UX


leverage  existing FastAPI backend while adding new capabilities:

WebSocket manager for handling real-time connections
Updated comment service with broadcasting
New database indexes for efficient queries


On the frontend:

Uses Apollo Client for GraphQL integration
Implements custom hooks for WebSocket management
Provides optimistic updates for immediate feedback
Handles connection management and error cases


For deployment:

WebSocket-capable infrastructure
Database scaling for threaded comments
Security measures for real-time connections
Monitoring and error handling


## 1. Backend Changes (FastAPI)

### 1.1 Update Database Schema
```sql
-- Add parent_id to posts table for threading
ALTER TABLE posts ADD COLUMN parent_post_id INTEGER REFERENCES posts(post_id);

-- Update comments table for threading
ALTER TABLE comments ADD COLUMN path ltree;
CREATE INDEX comment_path_idx ON comments USING gist (path);
```

### 1.2 Add WebSocket Support in FastAPI
```python
# websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, post_id: int):
        await websocket.accept()
        if post_id not in self.active_connections:
            self.active_connections[post_id] = []
        self.active_connections[post_id].append(websocket)

    async def disconnect(self, websocket: WebSocket, post_id: int):
        self.active_connections[post_id].remove(websocket)

    async def broadcast_to_post(self, post_id: int, message: dict):
        if post_id in self.active_connections:
            for connection in self.active_connections[post_id]:
                await connection.send_json(message)

manager = ConnectionManager()

# routes/websocket_routes.py
from fastapi import APIRouter, WebSocket, Depends
from .websocket_manager import manager
from .auth import get_current_user

router = APIRouter()

@router.websocket("/ws/post/{post_id}")
async def websocket_endpoint(websocket: WebSocket, post_id: int):
    await manager.connect(websocket, post_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Process received data
            await manager.broadcast_to_post(post_id, data)
    except:
        await manager.disconnect(websocket, post_id)
```

### 1.3 Update Comment Service
```python
# services/comment_service.py
async def create_comment(db: Session, user_id: int, comment: CommentCreate):
    db_comment = Comment(
        content=comment.content,
        user_id=user_id,
        post_id=comment.post_id,
        parent_comment_id=comment.parent_comment_id,
        path=compute_comment_path(comment.parent_comment_id)
    )
    db.add(db_comment)
    db.commit()

    # Broadcast new comment via WebSocket
    await manager.broadcast_to_post(
        comment.post_id,
        {
            "type": "new_comment",
            "data": comment.dict()
        }
    )
    return db_comment
```

## 2. GraphQL Integration (Next.js)

### 2.1 Set up Apollo Client
```typescript
// lib/apollo-client.ts
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: 'http://localhost:8000/graphql'
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8000/graphql',
    connectionParams: {
      // Add auth token if needed
    }
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});
```

### 2.2 Define GraphQL Schema and Operations
```graphql
# schema.graphql
type Comment {
  id: ID!
  content: String!
  userId: ID!
  postId: ID!
  parentId: ID
  path: String
  createdAt: DateTime!
  user: User!
}

type Subscription {
  commentAdded(postId: ID!): Comment!
}

type Mutation {
  addComment(input: AddCommentInput!): Comment!
}

input AddCommentInput {
  content: String!
  postId: ID!
  parentId: ID
}
```

### 2.3 Create Comment Components
```tsx
// components/comments/CommentThread.tsx
import { useSubscription, useMutation } from '@apollo/client';
import { COMMENT_ADDED_SUBSCRIPTION, ADD_COMMENT_MUTATION } from '@/lib/graphql';

export const CommentThread: React.FC<{ postId: string }> = ({ postId }) => {
  const { data, loading } = useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
    variables: { postId }
  });

  const [addComment] = useMutation(ADD_COMMENT_MUTATION);

  const handleSubmit = async (content: string, parentId?: string) => {
    await addComment({
      variables: {
        input: {
          content,
          postId,
          parentId
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <CommentForm onSubmit={handleSubmit} />
      <CommentList comments={data?.comments || []} onReply={handleSubmit} />
    </div>
  );
};
```

## 3. WebSocket Integration with Next.js

### 3.1 Create WebSocket Hook
```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export function useWebSocket(postId: number) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/post/${postId}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle different message types
      switch (data.type) {
        case 'new_comment':
          // Update local state with new comment
          break;
        case 'comment_updated':
          // Update existing comment
          break;
      }
    };

    ws.current.onerror = (error) => {
      toast({
        title: "WebSocket Error",
        description: "Connection error occurred",
        variant: "destructive"
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [postId]);

  return ws.current;
}
```

### 3.2 Integrate WebSocket with Post Component
```tsx
// components/posts/PostDetail.tsx
import { useWebSocket } from '@/hooks/useWebSocket';

export const PostDetail: React.FC<{ post: Post }> = ({ post }) => {
  const ws = useWebSocket(post.post_id);

  const handleComment = async (content: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'new_comment',
        data: {
          content,
          post_id: post.post_id
        }
      }));
    }
  };

  return (
    <div>
      <PostContent post={post} />
      <CommentThread
        postId={post.post_id}
        onComment={handleComment}
      />
    </div>
  );
};
```

## 4. State Management and Caching

### 4.1 Update Cache Configuration
```typescript
// lib/apollo-client.ts
const cache = new InMemoryCache({
  typePolicies: {
    Comment: {
      fields: {
        replies: {
          merge(existing = [], incoming: any[]) {
            return [...existing, ...incoming];
          }
        }
      }
    }
  }
});
```

### 4.2 Optimistic Updates
```typescript
// hooks/useComments.ts
export function useComments(postId: string) {
  const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
    optimisticResponse: {
      addComment: {
        __typename: 'Comment',
        id: 'temp-id',
        content: '',
        createdAt: new Date().toISOString()
      }
    },
    update: (cache, { data: { addComment } }) => {
      cache.modify({
        fields: {
          comments(existingComments = []) {
            const newCommentRef = cache.writeFragment({
              data: addComment,
              fragment: gql`
                fragment NewComment on Comment {
                  id
                  content
                  createdAt
                }
              `
            });
            return [...existingComments, newCommentRef];
          }
        }
      });
    }
  });

  return { addComment };
}
```

## 5. Deployment Considerations

1. **WebSocket Infrastructure:**
   - Use a WebSocket-capable server (e.g., Uvicorn)
   - Configure load balancers for WebSocket support
   - Implement proper connection scaling

2. **Database Scaling:**
   - Index the comment paths for efficient hierarchical queries
   - Implement materialized paths for better performance
   - Consider caching frequently accessed comment threads

3. **Security Measures:**
   - Implement WebSocket authentication
   - Rate limiting for comment creation
   - Input validation and sanitization
   - CORS configuration for WebSocket connections

4. **Monitoring:**
   - Track WebSocket connection metrics
   - Monitor comment creation/update performance
   - Set up alerts for connection issues
   - Log important events for debugging

5. **Error Handling:**
   - Implement reconnection logic for WebSocket disconnects
   - Handle network failures gracefully
   - Provide feedback for failed operations
   - Cache comments locally for offline support"""