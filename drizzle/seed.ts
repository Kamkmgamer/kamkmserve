/*
  Drizzle Seed Script for KamkmServe Dummy Data
  Run this script (e.g., using ts-node) to seed the database with dummy data.
*/

import { db } from '../src/server/db';
import { users, services, blogPosts, coupons, referrals, orders, payouts, commissions } from '../src/server/db/schema';

async function seed() {
  console.log('Seeding dummy data...');

  // 1. Insert a dummy user
  const dummyUser = {
    clerkUserId: 'dummy-user-1',
    email: 'dummy@example.com',
    name: 'Dummy User'
  };
  try {
    await db.insert(users).values(dummyUser);
    console.log('Inserted dummy user');
  } catch (error) {
    console.error('User insertion error:', error);
  }

  // 2. Insert a dummy service
  const dummyService = {
    name: 'Test Service',
    description: 'This is a test service.',
    price: 1999,
    features: 'Feature1, Feature2',
    category: 'Test Category',
    imageUrls: JSON.stringify(['https://via.placeholder.com/150'])
  };
  try {
    await db.insert(services).values(dummyService);
    console.log('Inserted dummy service');
  } catch (error) {
    console.error('Service insertion error:', error);
  }

  // 3. Insert a dummy blog post
  const dummyBlogPost = {
    title: 'Test Blog Post',
    summary: 'Test summary',
    content: 'Test content',
    thumbnailUrl: 'https://via.placeholder.com/150',
    userId: dummyUser.clerkUserId
  };
  try {
    await db.insert(blogPosts).values(dummyBlogPost);
    console.log('Inserted dummy blog post');
  } catch (error) {
    console.error('Blog post insertion error:', error);
  }

  // 4. Insert a dummy coupon
  const dummyCoupon = {
    code: 'TEST10',
    type: 'percent',
    value: 10,
    minOrderAmount: 1000,
    maxUses: 50,
    currentUses: 0,
    active: true
  };
  try {
    await db.insert(coupons).values(dummyCoupon);
    console.log('Inserted dummy coupon');
  } catch (error) {
    console.error('Coupon insertion error:', error);
  }

  // 5. Insert a dummy referral and capture its id
  let referralId = '';
  try {
    const referralResult = await db.insert(referrals).values({
      userId: dummyUser.clerkUserId,
      code: 'REF123',
      commissionRate: 0.1
    }).returning();
    if (!referralResult || !referralResult[0]) {
      throw new Error('Failed to insert dummy referral');
    }
    referralId = referralResult[0].id;
    console.log('Inserted dummy referral');
  } catch (error) {
    console.error('Referral insertion error:', error);
  }

  // 6. Insert a dummy order and capture its id
  let dummyOrderId = '';
  try {
    const orderResult = await db.insert(orders).values({
      userId: dummyUser.clerkUserId,
      couponId: undefined,
      status: 'PENDING',
      currency: 'USD',
      totalAmount: 2999,
      requirements: 'None',
      suggestions: '',
      preferences: '',
      questions: '',
      metadata: '',
      referralId: referralId
    }).returning();
    if (!orderResult || !orderResult[0]) {
      throw new Error('Failed to insert dummy order');
    }
    dummyOrderId = orderResult[0].id;
    console.log('Inserted dummy order');
  } catch (error) {
    console.error('Order insertion error:', error);
  }

  // 7. Insert a dummy payout
  try {
    await db.insert(payouts).values({
      referralId: referralId,
      amount: 500,
      status: 'PENDING',
      payoutDate: new Date()
    });
    console.log('Inserted dummy payout');
  } catch (error) {
    console.error('Payout insertion error:', error);
  }

  // 8. Insert a dummy commission using the dummy order id
  try {
    await db.insert(commissions).values({
      orderId: dummyOrderId,
      referralId: referralId,
      amount: 300,
      status: 'UNPAID'
    });
    console.log('Inserted dummy commission');
  } catch (error) {
    console.error('Commission insertion error:', error);
  }

  console.log('Seeding completed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
