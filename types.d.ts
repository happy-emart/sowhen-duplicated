
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    username?: string;
  }

  interface User {
    username?: string;
  }
}
