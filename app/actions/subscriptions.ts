'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function subscribe(plan: 299 | 699) {
  const session = await getSession();
  if (!session || session.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  try {
    const id = crypto.randomUUID();
    // 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Upsert subscription
    db.prepare(`
      INSERT INTO subscriptions (id, client_id, plan, unlocked_count, expires_at)
      VALUES (?, ?, ?, 0, ?)
      ON CONFLICT(client_id) DO UPDATE SET
        plan = excluded.plan,
        unlocked_count = 0,
        expires_at = excluded.expires_at
    `).run(id, session.id, plan, expiresAt);

    revalidatePath('/client');
    revalidatePath('/services');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function unlockContact(serviceId: string) {
  const session = await getSession();
  if (!session || session.role !== 'client') {
    return { error: 'Unauthorized' };
  }

  try {
    const sub = db.prepare('SELECT * FROM subscriptions WHERE client_id = ?').get(session.id) as any;
    
    if (!sub || new Date(sub.expires_at) < new Date()) {
      return { error: 'No active subscription' };
    }

    if (sub.plan === 299 && sub.unlocked_count >= 10) {
      return { error: 'You have reached your limit of 10 unlocks for this month. Upgrade to ₹699 plan for unlimited access.' };
    }

    // Check if already unlocked
    const existing = db.prepare('SELECT id FROM unlocked_contacts WHERE client_id = ? AND service_id = ?').get(session.id, serviceId);
    if (existing) {
      return { success: true };
    }

    db.transaction(() => {
      db.prepare('INSERT INTO unlocked_contacts (id, client_id, service_id) VALUES (?, ?, ?)').run(crypto.randomUUID(), session.id, serviceId);
      db.prepare('UPDATE subscriptions SET unlocked_count = unlocked_count + 1 WHERE id = ?').run(sub.id);
    })();

    revalidatePath(`/services/${serviceId}`);
    revalidatePath('/client');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
