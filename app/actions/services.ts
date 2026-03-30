'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createService(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'freelancer') {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const features = formData.get('features') as string; // comma separated

  if (!title || !description || isNaN(price) || !features) {
    return { error: 'All fields are required' };
  }

  try {
    const id = crypto.randomUUID();
    const featuresArray = features.split(',').map(f => f.trim()).filter(f => f);
    
    db.prepare(
      'INSERT INTO services (id, freelancer_id, title, description, price, features) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, session.id, title, description, price, JSON.stringify(featuresArray));

    revalidatePath('/freelancer');
    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateServiceStatus(serviceId: string, status: 'approved' | 'rejected') {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  try {
    db.prepare('UPDATE services SET status = ? WHERE id = ?').run(status, serviceId);
    revalidatePath('/admin');
    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateFreelancerProfile(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'freelancer') {
    return { error: 'Unauthorized' };
  }

  const bio = formData.get('bio') as string;
  const portfolio_url = formData.get('portfolio_url') as string;
  const phone = formData.get('phone') as string;
  const contact_email = formData.get('contact_email') as string;

  try {
    db.prepare(`
      UPDATE freelancer_profiles 
      SET bio = ?, portfolio_url = ?, phone = ?, contact_email = ?
      WHERE user_id = ?
    `).run(bio, portfolio_url, phone, contact_email, session.id);

    revalidatePath('/freelancer');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
