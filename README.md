# Arquitectura del MCP System

## Componentes Principales

### 1. Backend
- **Node.js con Express**: Servidor principal que coordina todas las operaciones
- **Socket.io**: Para comunicación en tiempo real entre agentes y UI
- **Supabase**: Para gestión de bases de datos y autenticación
- **LangChain**: Para gestionar el flujo de interacción entre los LLMs
- **APIs de Claude y ChatGPT**: Integración con ambos modelos

### 2. Frontend
- **React**: Para la interfaz de usuario
- **Tailwind CSS**: Para el diseño responsivo
- **Redux**: Para la gestión del estado
- **Monaco Editor**: Para visualizar y editar código

### 3. Middleware
- **Sistema de Gestión de Roles**: Para alternar entre Builder y Judge
- **Gestor de Tokens**: Para optimizar el uso de contexto en los LLMs
- **Sistema de Persistencia**: Para mantener el historial de conversaciones

### 4. Flujo de Operación
1. Usuario crea un proyecto de sitio web
2. El sistema asigna roles iniciales (Claude como Builder, ChatGPT como Judge, o viceversa)
3. Builder genera código/diseño basado en requisitos
4. Judge evalúa el trabajo y proporciona retroalimentación
5. Builder itera basado en la retroalimentación
6. El ciclo continúa hasta que se alcance una solución satisfactoria
7. Usuario puede intervenir, proporcionar feedback o cambiar requisitos en cualquier momento

### 5. Gestión de Memoria
- Uso de vectores para almacenar representaciones semánticas de conversaciones pasadas
- Sistema de recuperación contextual para mantener coherencia entre sesiones
- Mecanismo de resumen para mantener el contexto dentro de los límites de tokens

### 6. Seguridad
- OAuth para autenticación de usuarios
- Gestión segura de claves API para Claude y ChatGPT
- Aislamiento de entornos para prevenir ejecución de código malicioso

## Diagrama de Arquitectura

```
Usuario <-> Frontend (React + Tailwind) <-> Backend (Node.js/Express)
                                           /       \
                             Socket.io ---         --- APIs LLMs
                                                  /       \
                                          Claude API     ChatGPT API
                                              \             /
                                            LangChain Framework
                                                   |
                                                   v
                                              Supabase DB
```

## Flujo de Datos

1. El usuario interactúa con la interfaz React
2. Las solicitudes se envían a través de Socket.io al servidor Express
3. El servidor utiliza LangChain para gestionar la comunicación con los LLMs
4. Las respuestas se envían de vuelta al cliente a través de Socket.io
5. Los datos persistentes (proyectos, conversaciones) se almacenan en Supabase
6. El estado de la aplicación se gestiona con Redux en el frontend
