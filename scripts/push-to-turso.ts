import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://pak-booster-db-creatorboost-db.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODg5NTYyMTMsImlkIjoiMDFhMDg1ZmItZTYwMS03ZTRjLTllNjUtOGIyNmExYjU0MDcxIiwia2lkIjoidWZKWGZqdFFrR1BBTUhfZzdNaWw2VWpDM1JPUHdoVnI5bElSYVhUMFprMCIsInJpZCI6IjllNTNkODg5LWU4NmQtNDZmMi1hNmUzLTdkYmMxYjBlYmY5OSJ9.wuDtzzLaagUVhm9MjgoevD9CME5bFwLKkQWRfDFkd4NbOihnTqSSeDfWfYQC5Z89d6EKddbPQsUSA46lkKOZAg',
})

const sql = `
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "wallet_balance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

CREATE TABLE IF NOT EXISTS "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_username_key" ON "admin_users"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_email_key" ON "admin_users"("email");

CREATE TABLE IF NOT EXISTS "payment_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jazzcash_enabled" INTEGER NOT NULL DEFAULT 1,
    "jazzcash_number" TEXT,
    "jazzcash_title" TEXT,
    "easypaisa_enabled" INTEGER NOT NULL DEFAULT 1,
    "easypaisa_number" TEXT,
    "easypaisa_title" TEXT,
    "qr_enabled" INTEGER NOT NULL DEFAULT 1,
    "qr_code" TEXT,
    "qr_title" TEXT,
    "updated_at" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 100,
    "max_quantity" INTEGER NOT NULL DEFAULT 100000,
    "avg_start_time" TEXT,
    "speed" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "deposits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "sender_info" TEXT,
    "screenshot" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approved_by" TEXT,
    "start_count" INTEGER,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "wallet_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "previous_balance" REAL NOT NULL,
    "new_balance" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "order_id" TEXT,
    "deposit_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "wallet_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "wallet_transactions_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read_status" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reply" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_plans_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_plans_user_id_plan_id_key" ON "user_plans"("user_id", "plan_id");

CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site_name" TEXT NOT NULL DEFAULT 'PAK BOOSTER',
    "site_tagline" TEXT,
    "admin_name" TEXT,
    "admin_phone" TEXT,
    "admin_email" TEXT,
    "admin_whatsapp" TEXT,
    "instagram" TEXT DEFAULT '',
    "youtube" TEXT DEFAULT '',
    "facebook" TEXT DEFAULT '',
    "twitter" TEXT DEFAULT '',
    "telegram" TEXT DEFAULT '',
    "updated_at" DATETIME NOT NULL
);
`

async function main() {
  console.log('🚀 Connecting to Turso...')
  
  // Split by semicolons and filter empty
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
  
  let success = 0
  let failed = 0
  
  for (const stmt of statements) {
    try {
      await client.execute(stmt)
      const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1] || 
                         stmt.match(/CREATE UNIQUE INDEX IF NOT EXISTS "(\w+)"/)?.[1] || 'unknown'
      console.log(`✅ ${tableName}`)
      success++
    } catch (e: any) {
      console.log(`⚠️ Error: ${e.message}`)
      failed++
    }
  }
  
  // Insert default admin
  console.log('\n📋 Creating default admin...')
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "admin_users" ("id", "username", "email", "password_hash", "role", "created_at") VALUES (?, ?, ?, ?, ?, ?)`,
      args: ['admin-001', 'admin', 'seemi78000@gmail.com', '$2a$10$dummy', 'admin', new Date().toISOString()]
    })
    console.log('✅ Default admin created')
  } catch (e: any) {
    console.log(`⚠️ Admin: ${e.message}`)
  }

  // Insert default payment settings
  console.log('📋 Creating default payment settings...')
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "payment_settings" ("id", "jazzcash_enabled", "jazzcash_number", "jazzcash_title", "easypaisa_enabled", "easypaisa_number", "easypaisa_title", "qr_enabled", "qr_title", "updated_at") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['ps-001', 1, '03479178048', 'Waseem Abbas', 1, '03479178048', 'Waseem Abbas', 0, 'QR Payment', new Date().toISOString()]
    })
    console.log('✅ Default payment settings created')
  } catch (e: any) {
    console.log(`⚠️ Payment Settings: ${e.message}`)
  }

  // Insert default site settings
  console.log('📋 Creating default site settings...')
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "site_settings" ("id", "site_name", "site_tagline", "admin_name", "admin_phone", "admin_email", "admin_whatsapp", "updated_at") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['ss-001', 'PAK BOOSTER', 'Social Services', 'Waseem Abbas', '03479178048', 'Seemi78000@gmail.com', '03479178048', new Date().toISOString()]
    })
    console.log('✅ Default site settings created')
  } catch (e: any) {
    console.log(`⚠️ Site Settings: ${e.message}`)
  }

  // Verify tables
  console.log('\n📊 Verifying tables...')
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  console.log('Tables:', tables.rows.map(r => r.name).join(', '))

  console.log(`\n✅ Done! ${success} statements OK, ${failed} failed`)
  client.close()
}

main().catch(console.error)
