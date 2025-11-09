# WebSocket Real-Time Events

Sistema de notificações em tempo real usando WebSocket (Socket.IO) para atualizações instantâneas de tasks.

## 🔌 Conexão

### Endpoint
```
ws://localhost:3000/events
```

### Autenticação

O WebSocket requer autenticação JWT. Existem duas formas de enviar o token:

#### 1. Via Authorization Header
```javascript
const socket = io('http://localhost:3000/events', {
  extraHeaders: {
    Authorization: 'Bearer YOUR_JWT_TOKEN'
  }
});
```

#### 2. Via Query Parameter
```javascript
const socket = io('http://localhost:3000/events', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

## 📡 Eventos

### Eventos Recebidos pelo Cliente

#### `connected`
Confirmação de conexão bem-sucedida.

```json
{
  "clientId": "socket-id",
  "userId": "user-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "message": "Successfully connected to real-time events"
}
```

#### `connections.count`
Número de conexões ativas do usuário.

```json
{
  "count": 2
}
```

#### `task.created`
Uma nova task foi criada.

```json
{
  "event": "task.created",
  "data": {
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "agentId": "agent-uuid",
    "status": "pending",
    "priority": "normal",
    "prompt": "User prompt...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `task.processing`
Task iniciou processamento.

```json
{
  "event": "task.processing",
  "data": {
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "agentId": "agent-uuid",
    "status": "processing",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `task.completed`
Task foi concluída com sucesso.

```json
{
  "event": "task.completed",
  "data": {
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "agentId": "agent-uuid",
    "status": "completed",
    "response": "LLM response...",
    "tokensUsed": 150,
    "executionTimeMs": 2500,
    "completedAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `task.failed`
Task falhou.

```json
{
  "event": "task.failed",
  "data": {
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "agentId": "agent-uuid",
    "status": "failed",
    "error": "Error message...",
    "retryCount": 1,
    "completedAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `task.cancelled`
Task foi cancelada.

```json
{
  "event": "task.cancelled",
  "data": {
    "taskId": "task-uuid",
    "userId": "user-uuid",
    "agentId": "agent-uuid",
    "status": "cancelled",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### `task.event`
Evento genérico para todos os tipos de eventos de task (alternativa para ouvir todos os eventos).

### Eventos Enviados pelo Cliente

#### `ping`
Verificar conectividade.

```javascript
socket.emit('ping', { message: 'Hello' });

socket.on('pong', (data) => {
  console.log(data);
  // { timestamp: "...", clientId: "...", message: "Hello" }
});
```

#### `subscribe.tasks`
Inscrever-se explicitamente para receber atualizações de tasks (opcional, já está inscrito por padrão).

```javascript
socket.emit('subscribe.tasks');

socket.on('subscribed.tasks', (data) => {
  console.log(data);
  // { userId: "...", timestamp: "...", message: "Successfully subscribed..." }
});
```

#### `unsubscribe.tasks`
Cancelar inscrição de atualizações de tasks.

```javascript
socket.emit('unsubscribe.tasks');

socket.on('unsubscribed.tasks', (data) => {
  console.log(data);
});
```

## 💻 Exemplos de Uso

### JavaScript (Browser)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Droid AI - Real-time Updates</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <div id="tasks"></div>

  <script>
    const token = 'YOUR_JWT_TOKEN'; // Obter do login

    const socket = io('http://localhost:3000/events', {
      auth: { token }
    });

    socket.on('connected', (data) => {
      console.log('Connected:', data);
    });

    socket.on('task.created', (event) => {
      console.log('New task:', event.data);
      addTaskToUI(event.data);
    });

    socket.on('task.processing', (event) => {
      console.log('Task processing:', event.data);
      updateTaskStatus(event.data.taskId, 'processing');
    });

    socket.on('task.completed', (event) => {
      console.log('Task completed:', event.data);
      updateTaskStatus(event.data.taskId, 'completed');
      displayResponse(event.data);
    });

    socket.on('task.failed', (event) => {
      console.error('Task failed:', event.data);
      updateTaskStatus(event.data.taskId, 'failed');
      showError(event.data.error);
    });

    // Ou ouvir todos os eventos de uma vez
    socket.on('task.event', (event) => {
      console.log('Task event:', event.event, event.data);
      handleTaskUpdate(event);
    });

    function addTaskToUI(task) {
      // Implementar lógica de UI
    }

    function updateTaskStatus(taskId, status) {
      // Implementar lógica de UI
    }
  </script>
</body>
</html>
```

### Node.js / React

```javascript
import { io } from 'socket.io-client';

class TaskEventsService {
  constructor(token) {
    this.socket = io('http://localhost:3000/events', {
      auth: { token }
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connected', this.onConnected);
    this.socket.on('task.created', this.onTaskCreated);
    this.socket.on('task.processing', this.onTaskProcessing);
    this.socket.on('task.completed', this.onTaskCompleted);
    this.socket.on('task.failed', this.onTaskFailed);
    this.socket.on('task.cancelled', this.onTaskCancelled);
  }

  onConnected(data) {
    console.log('Connected to real-time events', data);
  }

  onTaskCreated(event) {
    // Atualizar estado/UI
    console.log('Task created', event.data);
  }

  onTaskProcessing(event) {
    console.log('Task processing', event.data);
  }

  onTaskCompleted(event) {
    console.log('Task completed', event.data);
  }

  onTaskFailed(event) {
    console.error('Task failed', event.data);
  }

  onTaskCancelled(event) {
    console.log('Task cancelled', event.data);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Uso
const token = localStorage.getItem('jwt_token');
const taskEvents = new TaskEventsService(token);
```

### React Hook

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useTaskEvents(token) {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000/events', {
      auth: { token }
    });

    newSocket.on('connected', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('task.created', (event) => {
      setTasks(prev => [event.data, ...prev]);
    });

    newSocket.on('task.completed', (event) => {
      setTasks(prev => prev.map(task => 
        task.id === event.data.taskId 
          ? { ...task, ...event.data }
          : task
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return { socket, tasks };
}
```

## 🔒 Segurança

- **Autenticação JWT obrigatória**: Todas as conexões devem fornecer um token válido
- **Isolamento por usuário**: Cada usuário só recebe eventos de suas próprias tasks
- **Rooms privadas**: Eventos são emitidos apenas para a room específica do usuário (`user:{userId}`)
- **CORS configurável**: Definir `CORS_ORIGIN` no `.env` para ambientes de produção

## 🚀 Performance

- Conexões mantidas com keep-alive
- Eventos são emitidos apenas para usuários conectados
- Sem polling - notificações push em tempo real
- Suporta múltiplas conexões do mesmo usuário (tabs/dispositivos)

## 🐛 Debugging

### Verificar Conectividade

```javascript
socket.emit('ping', { message: 'test' });
socket.on('pong', (data) => {
  console.log('Pong received:', data);
});
```

### Logs do Servidor

O servidor registra:
- Conexões e desconexões
- Emissões de eventos
- Erros de autenticação

Procure por logs com `EventsGateway` ou `EventsService`.

## 📦 Dependências

- `@nestjs/websockets`
- `@nestjs/platform-socket.io`
- `socket.io` (client)

## 🔗 Integração com REST API

O sistema WebSocket complementa a REST API:

1. **Criar task via REST**: `POST /tasks`
2. **Receber confirmação via WebSocket**: `task.created`
3. **Receber updates via WebSocket**: `task.processing`, `task.completed`
4. **Consultar detalhes via REST**: `GET /tasks/:id`

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# .env
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### Namespace

Por padrão, o WebSocket usa o namespace `/events`. Para conectar:

```javascript
// Correto
io('http://localhost:3000/events')

// Incorreto
io('http://localhost:3000')
```
