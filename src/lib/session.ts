import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

// This perfectly mirrors your FastAPI TokenPayload BaseModel!
export interface TokenPayload {
  sub: string;
  company_id?: string;
  role?: 'OWNER' | 'SUPERVISOR' | 'EMPLOYEE';
  is_platform_admin?: boolean;
  exp?: number;
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  
  if (!token) return null;
  
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    return null;
  }
}