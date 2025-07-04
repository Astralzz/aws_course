# Curso Técnico Profesional de Next.js (Modelo-Vista-Controlador al estilo Laravel con TypeScript)

## 🧠 Mapeo Conceptual Laravel → Next.js

| Laravel               | Next.js (App Router)                     |
| --------------------- | ---------------------------------------- |
| `routes/web.php`      | estructura de carpetas en `/app`         |
| Controladores         | `app/(grupo)/route.ts`                   |
| Vistas Blade          | `page.tsx` con JSX/TSX                   |
| Middlewares           | `middleware.ts` (Edge Middleware)        |
| Providers / Inyección | Context API, Dependency Injection manual |
| Requests/Validation   | Zod / Yup / Superstruct                  |

---

## 📁 Estructura de Proyecto MVC-like

```
/app
  /dashboard
    /settings
      page.tsx             ← Vista
      layout.tsx           ← Layout persistente
      route.ts             ← Controlador (maneja POST, GET...)

/controllers             ← Lógica controladora
/services                ← Servicios para lógica de negocio
/models                  ← Definición de esquemas y tipos
/validators              ← Validaciones (Zod, Yup...)
/middleware.ts           ← Middleware global tipo auth
/utils                   ← Funciones auxiliares
/types                   ← Tipos TS globales
/public                  ← Assets estáticos
```

---

## 📡 Routing (similar a Laravel `routes/web.php`)

En **App Router** de Next.js, cada carpeta representa una ruta:

```bash
/app/users/page.tsx        → /users (GET)
/app/users/route.ts        → /users (POST, PUT, DELETE)
```

### 🛠 Ejemplo de `route.ts` como Controlador

```ts
// app/users/route.ts
import { NextResponse } from 'next/server';
import { createUser } from '@/controllers/user.controller';

export async function POST(req: Request) {
  const body = await req.json();
  const user = await createUser(body);
  return NextResponse.json(user);
}
```

---

## 🎮 Controladores

```ts
// controllers/user.controller.ts
import { zUser } from '@/validators/user.validator';
import { UserService } from '@/services/user.service';

export async function createUser(payload: any) {
  const parsed = zUser.parse(payload);
  const user = await UserService.create(parsed);
  return user;
}
```

---

## 🧪 Validaciones

```ts
// validators/user.validator.ts
import { z } from 'zod';

export const zUser = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
```

---

## 🧰 Servicios

```ts
// services/user.service.ts
import { User } from '@/models/user.model';

export const UserService = {
  async create(data: User) {
    // Simula persistencia
    return { id: Date.now(), ...data };
  },
};
```

---

## 🔐 Seguridad: Middleware Global (como `auth` de Laravel)

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuth = request.cookies.has('token');
  const protectedRoutes = ['/dashboard'];

  if (protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r)) && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## 👁️ Vistas

```tsx
// app/users/page.tsx
import { getUsers } from '@/controllers/user.controller';

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔌 Inyección de Dependencias

Puedes usar **Context API**, o incluso crear `service container` propio:

```ts
// context/UserContext.tsx
export const UserContext = createContext<User[]>([]);
```

O de forma manual:

```ts
const userService = new UserService(apiClient);
```

---

## 🧾 Glosario Rápido

* `route.ts`: Actúa como controlador (POST, GET, PUT...)
* `page.tsx`: Vista principal (Blade-equivalente)
* `layout.tsx`: Layout persistente entre rutas hijas
* `middleware.ts`: Funciones tipo middleware global (auth, logging)
* `Context`: Para DI y estado global
* `services/`: Lógica de negocio
* `validators/`: Validaciones con Zod
* `models/`: Modelos de datos (usualmente TS-only)