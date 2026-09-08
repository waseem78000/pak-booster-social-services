import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client'

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

const services = [
  // ========== INSTAGRAM ==========
  { name: 'Instagram Followers [Real]', category: 'Instagram', description: 'Real Instagram followers with profile picture & posts. HQ accounts. No refill.', price: 120, minQuantity: 100, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
  { name: 'Instagram Followers [Cheapest]', category: 'Instagram', description: 'Low quality Instagram followers. Budget friendly. No refill.', price: 50, minQuantity: 100, maxQuantity: 500000, avgStartTime: '6 hours', speed: '10000/day' },
  { name: 'Instagram Likes [HQ Profile]', category: 'Instagram', description: 'Instagram post likes from HQ profiles with posts & followers. Instant start.', price: 60, minQuantity: 50, maxQuantity: 500000, avgStartTime: '10 minutes', speed: '20000/day' },
  { name: 'Instagram Likes [Cheapest]', category: 'Instagram', description: 'Budget Instagram likes. Mixed quality. No refill.', price: 25, minQuantity: 50, maxQuantity: 1000000, avgStartTime: '1 hour', speed: '50000/day' },
  { name: 'Instagram Views [Reel/Video]', category: 'Instagram', description: 'Instagram reel/video views. Real views. Instant start.', price: 15, minQuantity: 100, maxQuantity: 10000000, avgStartTime: '5 minutes', speed: '100000/day' },
  { name: 'Instagram Views [Story]', category: 'Instagram', description: 'Instagram story views from real accounts.', price: 20, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '50000/day' },
  { name: 'Instagram Comments [Custom]', category: 'Instagram', description: 'Custom Instagram comments. Write your own comments. HQ profiles.', price: 500, minQuantity: 10, maxQuantity: 5000, avgStartTime: '2 hours', speed: '200/day' },
  { name: 'Instagram Saves', category: 'Instagram', description: 'Instagram post saves. Helps with algorithm ranking.', price: 80, minQuantity: 50, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
  { name: 'Instagram Shares', category: 'Instagram', description: 'Instagram post shares. Boosts reach.', price: 80, minQuantity: 50, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },

  // ========== TIKTOK ==========
  { name: 'TikTok Likes [HQ Profile] [Fast Speed]', category: 'TikTok', description: 'TikTok likes from HQ profiles with posts. No refill. Super instant. Day 10K.', price: 90, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '100000/day' },
  { name: 'TikTok Likes [Cheapest]', category: 'TikTok', description: 'Budget TikTok likes. Mixed quality. No refill.', price: 35, minQuantity: 100, maxQuantity: 2000000, avgStartTime: '1 hour', speed: '50000/day' },
  { name: 'TikTok Followers [HQ]', category: 'TikTok', description: 'TikTok followers from HQ profiles. 30-day refill guarantee.', price: 150, minQuantity: 100, maxQuantity: 500000, avgStartTime: '12 hours', speed: '5000/day' },
  { name: 'TikTok Followers [Cheapest]', category: 'TikTok', description: 'Budget TikTok followers. No refill.', price: 60, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '24 hours', speed: '10000/day' },
  { name: 'TikTok Views [Real]', category: 'TikTok', description: 'TikTok video views from real accounts. Instant start.', price: 15, minQuantity: 500, maxQuantity: 50000000, avgStartTime: '5 minutes', speed: '500000/day' },
  { name: 'TikTok Views [Cheapest]', category: 'TikTok', description: 'Budget TikTok views. Mixed quality.', price: 5, minQuantity: 1000, maxQuantity: 100000000, avgStartTime: '1 hour', speed: '1000000/day' },
  { name: 'TikTok Comments [Custom]', category: 'TikTok', description: 'Custom TikTok comments. Write your own.', price: 400, minQuantity: 10, maxQuantity: 5000, avgStartTime: '2 hours', speed: '200/day' },
  { name: 'TikTok Shares', category: 'TikTok', description: 'TikTok video shares. Helps virality.', price: 100, minQuantity: 100, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },
  { name: 'TikTok Likes [With Views] [HQ]', category: 'TikTok', description: 'TikTok likes + views combo. HQ real accounts. No refill. Super instant.', price: 89, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '50000/day' },

  // ========== YOUTUBE ==========
  { name: 'YouTube Subscribers [Real]', category: 'YouTube', description: 'Real YouTube subscribers. 30-day drop guarantee. HQ accounts.', price: 300, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '2000/day' },
  { name: 'YouTube Subscribers [Cheapest]', category: 'YouTube', description: 'Budget YouTube subscribers. No refill.', price: 100, minQuantity: 100, maxQuantity: 500000, avgStartTime: '48 hours', speed: '5000/day' },
  { name: 'YouTube Views [Monetizable]', category: 'YouTube', description: 'YouTube views with retention. Monetizable. 30-60s retention.', price: 200, minQuantity: 500, maxQuantity: 10000000, avgStartTime: '1 hour', speed: '100000/day' },
  { name: 'YouTube Views [Cheapest]', category: 'YouTube', description: 'Budget YouTube views. Non-retention.', price: 50, minQuantity: 500, maxQuantity: 50000000, avgStartTime: '30 minutes', speed: '500000/day' },
  { name: 'YouTube Likes', category: 'YouTube', description: 'YouTube video likes from real accounts. No refill.', price: 150, minQuantity: 50, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
  { name: 'YouTube Likes [Cheapest]', category: 'YouTube', description: 'Budget YouTube likes. Mixed quality.', price: 60, minQuantity: 50, maxQuantity: 1000000, avgStartTime: '6 hours', speed: '20000/day' },
  { name: 'YouTube Dislikes', category: 'YouTube', description: 'YouTube video dislikes.', price: 200, minQuantity: 10, maxQuantity: 50000, avgStartTime: '2 hours', speed: '2000/day' },
  { name: 'YouTube Watch Hours [Monetization]', category: 'YouTube', description: 'YouTube watch hours for monetization. 4000 hours package. Safe method.', price: 5000, minQuantity: 1000, maxQuantity: 5000, avgStartTime: '48 hours', speed: '100 hours/day' },

  // ========== FACEBOOK ==========
  { name: 'Facebook Page Likes', category: 'Facebook', description: 'Real Facebook page likes. HQ profiles. 30-day refill.', price: 200, minQuantity: 100, maxQuantity: 500000, avgStartTime: '24 hours', speed: '5000/day' },
  { name: 'Facebook Page Likes [Cheapest]', category: 'Facebook', description: 'Budget Facebook page likes. No refill.', price: 80, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '48 hours', speed: '10000/day' },
  { name: 'Facebook Post Likes', category: 'Facebook', description: 'Facebook post likes. Mixed profiles. No refill.', price: 50, minQuantity: 50, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
  { name: 'Facebook Followers', category: 'Facebook', description: 'Facebook profile/page followers.', price: 150, minQuantity: 100, maxQuantity: 500000, avgStartTime: '24 hours', speed: '3000/day' },
  { name: 'Facebook Video Views', category: 'Facebook', description: 'Facebook video views. Real views.', price: 30, minQuantity: 500, maxQuantity: 10000000, avgStartTime: '30 minutes', speed: '100000/day' },
  { name: 'Facebook Post Shares', category: 'Facebook', description: 'Facebook post shares. Boosts organic reach.', price: 100, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '3000/day' },

  // ========== TELEGRAM ==========
  { name: 'Telegram Members [Channel/Group]', category: 'Telegram', description: 'Telegram channel/group members. Real accounts. No refill.', price: 80, minQuantity: 100, maxQuantity: 500000, avgStartTime: '6 hours', speed: '10000/day' },
  { name: 'Telegram Members [Cheapest]', category: 'Telegram', description: 'Budget Telegram members. Mixed quality.', price: 40, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '12 hours', speed: '20000/day' },
  { name: 'Telegram Post Views', category: 'Telegram', description: 'Telegram channel post views. Real views.', price: 15, minQuantity: 100, maxQuantity: 1000000, avgStartTime: '10 minutes', speed: '50000/day' },
  { name: 'Telegram Channel Subscribers', category: 'Telegram', description: 'Telegram channel subscribers. HQ profiles.', price: 120, minQuantity: 100, maxQuantity: 200000, avgStartTime: '6 hours', speed: '5000/day' },
  { name: 'Telegram Post Reactions', category: 'Telegram', description: 'Telegram post reactions. Various emoji options.', price: 50, minQuantity: 50, maxQuantity: 100000, avgStartTime: '1 hour', speed: '5000/day' },

  // ========== TWITTER/X ==========
  { name: 'Twitter/X Followers [Real]', category: 'Twitter/X', description: 'Twitter followers from HQ profiles. 30-day refill.', price: 200, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '3000/day' },
  { name: 'Twitter/X Followers [Cheapest]', category: 'Twitter/X', description: 'Budget Twitter followers. No refill.', price: 80, minQuantity: 100, maxQuantity: 500000, avgStartTime: '48 hours', speed: '10000/day' },
  { name: 'Twitter/X Likes', category: 'Twitter/X', description: 'Twitter tweet likes. HQ profiles.', price: 100, minQuantity: 50, maxQuantity: 500000, avgStartTime: '1 hour', speed: '10000/day' },
  { name: 'Twitter/X Retweets', category: 'Twitter/X', description: 'Twitter retweets from real accounts.', price: 150, minQuantity: 50, maxQuantity: 200000, avgStartTime: '2 hours', speed: '5000/day' },
  { name: 'Twitter/X Views', category: 'Twitter/X', description: 'Twitter tweet/post views.', price: 20, minQuantity: 500, maxQuantity: 10000000, avgStartTime: '30 minutes', speed: '100000/day' },

  // ========== LINKEDIN ==========
  { name: 'LinkedIn Connections', category: 'LinkedIn', description: 'LinkedIn profile connections. Professional accounts.', price: 500, minQuantity: 50, maxQuantity: 10000, avgStartTime: '24 hours', speed: '500/day' },
  { name: 'LinkedIn Followers [Company Page]', category: 'LinkedIn', description: 'LinkedIn company page followers.', price: 400, minQuantity: 100, maxQuantity: 50000, avgStartTime: '24 hours', speed: '1000/day' },
  { name: 'LinkedIn Post Likes', category: 'LinkedIn', description: 'LinkedIn post likes. Professional profiles.', price: 300, minQuantity: 50, maxQuantity: 50000, avgStartTime: '6 hours', speed: '2000/day' },

  // ========== DISCORD ==========
  { name: 'Discord Server Members', category: 'Discord', description: 'Discord server members. Realistic profiles.', price: 100, minQuantity: 100, maxQuantity: 100000, avgStartTime: '6 hours', speed: '5000/day' },
  { name: 'Discord Server Members [Cheapest]', category: 'Discord', description: 'Budget Discord server members.', price: 50, minQuantity: 100, maxQuantity: 500000, avgStartTime: '12 hours', speed: '10000/day' },

  // ========== SPOTIFY ==========
  { name: 'Spotify Plays', category: 'Spotify', description: 'Spotify track plays. Real streams. Safe method.', price: 100, minQuantity: 1000, maxQuantity: 10000000, avgStartTime: '1 hour', speed: '50000/day' },
  { name: 'Spotify Followers', category: 'Spotify', description: 'Spotify artist followers.', price: 200, minQuantity: 100, maxQuantity: 50000, avgStartTime: '24 hours', speed: '1000/day' },
  { name: 'Spotify Monthly Listeners', category: 'Spotify', description: 'Spotify monthly listeners. Safe method.', price: 300, minQuantity: 500, maxQuantity: 1000000, avgStartTime: '24 hours', speed: '10000/day' },

  // ========== PINTEREST ==========
  { name: 'Pinterest Followers', category: 'Pinterest', description: 'Pinterest account followers. HQ profiles.', price: 150, minQuantity: 100, maxQuantity: 100000, avgStartTime: '24 hours', speed: '2000/day' },
  { name: 'Pinterest Repins', category: 'Pinterest', description: 'Pinterest pin repins. Boosts visibility.', price: 80, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '5000/day' },
  { name: 'Pinterest Likes', category: 'Pinterest', description: 'Pinterest pin likes.', price: 60, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '5000/day' },

  // ========== THREADS ==========
  { name: 'Threads Followers', category: 'Threads', description: 'Threads app followers. Real accounts.', price: 150, minQuantity: 100, maxQuantity: 100000, avgStartTime: '12 hours', speed: '3000/day' },
  { name: 'Threads Likes', category: 'Threads', description: 'Threads post likes.', price: 80, minQuantity: 50, maxQuantity: 200000, avgStartTime: '1 hour', speed: '10000/day' },
  { name: 'Threads Reposts', category: 'Threads', description: 'Threads post reposts.', price: 100, minQuantity: 50, maxQuantity: 100000, avgStartTime: '2 hours', speed: '5000/day' },

  // ========== SNAPCHAT ==========
  { name: 'Snapchat Story Views', category: 'Snapchat', description: 'Snapchat story views. Real accounts.', price: 50, minQuantity: 500, maxQuantity: 1000000, avgStartTime: '1 hour', speed: '50000/day' },
  { name: 'Snapchat Spotlight Views', category: 'Snapchat', description: 'Snapchat spotlight views. Boost visibility.', price: 30, minQuantity: 1000, maxQuantity: 10000000, avgStartTime: '30 minutes', speed: '100000/day' },

  // ========== WEBSITE / SEO ==========
  { name: 'Website Traffic [Worldwide]', category: 'Website & SEO', description: 'Real website traffic from worldwide. Organic looking. Bounce rate 60-80%.', price: 100, minQuantity: 1000, maxQuantity: 10000000, avgStartTime: '1 hour', speed: '50000/day' },
  { name: 'Website Traffic [Pakistan]', category: 'Website & SEO', description: 'Website traffic from Pakistan only.', price: 200, minQuantity: 1000, maxQuantity: 5000000, avgStartTime: '1 hour', speed: '20000/day' },
  { name: 'Google Reviews [5 Star]', category: 'Website & SEO', description: 'Google business 5-star reviews. Real looking. With text.', price: 500, minQuantity: 1, maxQuantity: 100, avgStartTime: '24 hours', speed: '5/day' },

  // ========== AI SERVICES ==========
  { name: 'AI Image Generation', category: 'AI Services', description: 'Custom AI generated images. HD quality. Various styles available.', price: 100, minQuantity: 1, maxQuantity: 100, avgStartTime: '1 hour', speed: '10/day' },
  { name: 'AI Video Generation', category: 'AI Services', description: 'AI generated short videos. 5-15 seconds. Various themes.', price: 500, minQuantity: 1, maxQuantity: 20, avgStartTime: '6 hours', speed: '5/day' },
  { name: 'AI Content Writing', category: 'AI Services', description: 'AI-powered content writing. Blog posts, articles, social media captions.', price: 200, minQuantity: 1, maxQuantity: 50, avgStartTime: '2 hours', speed: '10/day' },
  { name: 'AI Logo Design', category: 'AI Services', description: 'AI generated logo designs. Multiple concepts. PNG + SVG.', price: 300, minQuantity: 1, maxQuantity: 20, avgStartTime: '2 hours', speed: '5/day' },
]

async function main() {
  console.log('🗑️  Deleting old services...')
  await prisma.service.deleteMany()
  
  console.log(`📦 Adding ${services.length} services...`)
  for (const s of services) {
    await prisma.service.create({ data: s })
  }
  
  console.log('✅ Done! Services seeded:')
  const count = await prisma.service.count()
  console.log(`   Total: ${count} services`)
  
  const categories = await prisma.service.groupBy({ by: ['category'] })
  console.log(`   Categories: ${categories.length}`)
  for (const c of categories) {
    const cCount = await prisma.service.count({ where: { category: c.category } })
    console.log(`     - ${c.category}: ${cCount} services`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
