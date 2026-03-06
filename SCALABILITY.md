# SCALABILITY.md — System Scaling Strategy

> This document outlines a high-level scaling roadmap for the Task Management System API.
> It covers distributed caching, horizontal scaling, database optimization, and a future microservices path.

---

## 1. Distributed Caching with Redis

### Problem
`GET /api/v1/tasks` is the most frequently hit endpoint. Every request hits MongoDB even when the data hasn't changed, creating unnecessary load.

### Solution: Redis Cache + Invalidation

```
Client → Express → Cache Hit? → Return from Redis (< 1ms)
                 → Cache Miss? → MongoDB → Store in Redis → Return
```

### Implementation Plan

**Install Redis client:**
```bash
npm install ioredis
```

**Cache middleware pattern:**
```typescript
// src/middleware/cache.middleware.ts
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export const cacheMiddleware = (ttl = 60) => async (req, res, next) => {
  const key = `cache:${req.user.id}:tasks:${req.query.status}:${req.query.page}`;
  const cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));

  // Monkey-patch res.json to capture and cache the response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    redis.setex(key, ttl, JSON.stringify(body));
    return originalJson(body);
  };
  next();
};
```

**Invalidation strategy:**
- On `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id` — flush keys matching `cache:*:tasks:*`
- Use Redis key namespacing: `cache:{userId}:tasks:{filters}`
- TTL: 60 seconds for list endpoints

### Expected Impact
| Scenario | Without Cache | With Cache |
|---|---|---|
| Concurrent 1000 users | ~300ms avg | ~5ms avg |
| DB queries/min | 60,000 | ~500 (cache hits) |

---

## 2. Horizontal Scaling with Docker

### Architecture

```
                    ┌─────────────┐
          ┌────────►│  API Node 1 │
          │         └─────────────┘     ┌──────────┐
Internet ─►  Nginx  │                  │ MongoDB  │
  Load    │  (LB)   │  API Node 2 ──►  │ Replica  │
Balancer  │         │                  │   Set    │
          └────────►│  API Node 3 │    └──────────┘
                    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │
                    │  (Shared)   │
                    └─────────────┘
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.9'
services:
  api:
    build: ./backend
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    command: mongod --replSet rs0

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

volumes:
  mongo_data:
```

### JWT Statelesness
Because JWT is stateless (no session store required), all API nodes share the same `JWT_SECRET` and can verify tokens independently — horizontal scaling works out of the box. The only shared state is Redis (cache) and MongoDB (data).

---

## 3. Database Indexing Strategy

### Current Indexes

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `users` | `{ email: 1 }` | Unique | Fast login lookup |
| `tasks` | `{ assignedTo: 1, status: 1 }` | Compound | Filter user's tasks by status |
| `tasks` | `{ createdBy: 1 }` | Single | Ownership lookups |
| `tasks` | `{ status: 1, priority: 1 }` | Compound | Admin list filtering |

### Additional Indexes for Scale

```javascript
// For full-text task title search
db.tasks.createIndex({ title: 'text', description: 'text' });

// For TTL-based soft-delete (future feature)
db.tasks.createIndex({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30d

// For due date range queries
db.tasks.createIndex({ dueDate: 1 });
```

### MongoDB Replica Set
Run a 3-node replica set for:
- **High availability**: Automatic failover if primary goes down
- **Read scalability**: Route read queries to secondary nodes via `readPreference: secondaryPreferred`

---

## 4. Rate Limiting

Prevent brute-force attacks and API abuse using `express-rate-limit` + Redis store:

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  store: new RedisStore({ client: redis }),
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// Apply: app.use('/api/v1/auth/login', authLimiter);
// Apply: app.use('/api/v1/auth/register', authLimiter);
```

Global API rate limiting: 100 requests/minute per IP.

---

## 5. Future Microservices Path

As the system grows, extract these bounded contexts into separate services:

```
Current Monolith                     Future Microservices
─────────────                        ─────────────────────
taskflow-api                    ├── auth-service (Node.js)
  ├── /auth/*          ──────►  ├── task-service (Node.js)
  └── /tasks/*                  ├── notification-service (Go/Node.js)
                                 └── API Gateway (Kong / Nginx)
```

**Communication patterns:**
- Synchronous: REST or gRPC for request-response
- Asynchronous: RabbitMQ / Kafka for events (e.g., `task.created` → send notification email)

---

## Summary

| Concern | Solution | Impact |
|---|---|---|
| Read performance | Redis cache (60s TTL) | 95% reduction in DB reads |
| Traffic growth | Docker horizontal scaling | Linear capacity growth |
| DB queries | Compound indexes | Sub-10ms query times |
| Abuse prevention | Redis-backed rate limiting | Protects all entry points |
| Large-scale | Microservices extraction | Independent scaling per service |
