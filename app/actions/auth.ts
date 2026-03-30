'use server';

import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signup(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required' };
  }

  if (role === 'admin') {
    return { error: 'Admin signup is not allowed' };
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    db.prepare(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, email, hashedPassword, role);

    if (role === 'freelancer') {
      db.prepare(
        'INSERT INTO freelancer_profiles (id, user_id) VALUES (?, ?)'
      ).run(crypto.randomUUID(), id);
    }

    const session = await encrypt({ id, email, role, name });
    (await cookies()).set('session', session, { httpOnly: true, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });

    return { success: true, role };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'All fields are required' };
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    const session = await encrypt({ id: user.id, email: user.email, role: user.role, name: user.name });
    (await cookies()).set('session', session, { httpOnly: true, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });

    return { success: true, role: user.role };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  (await cookies()).delete('session');
  redirect('/login');
}
