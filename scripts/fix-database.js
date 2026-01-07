/**
 * Fix corrupted SQLite database
 * This script attempts to repair or recreate the database
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function fixDatabase() {
  try {
    console.log('🔍 Checking database integrity...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Try a simple query
    const count = await prisma.user.count()
    console.log(`✅ Database is healthy. Found ${count} users.`)
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Database error:', error.message)
    
    if (error.message.includes('malformed') || error.message.includes('disk image')) {
      console.log('\n🔧 Database is corrupted. Attempting to fix...\n')
      
      // Close connection
      await prisma.$disconnect().catch(() => {})
      
      // Backup corrupted database
      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
      const backupPath = path.join(process.cwd(), 'prisma', `dev.db.backup.${Date.now()}`)
      
      if (fs.existsSync(dbPath)) {
        console.log(`📦 Backing up corrupted database to ${backupPath}`)
        fs.copyFileSync(dbPath, backupPath)
      }
      
      // Delete corrupted database
      if (fs.existsSync(dbPath)) {
        console.log('🗑️  Removing corrupted database...')
        fs.unlinkSync(dbPath)
      }
      
      console.log('\n✅ Corrupted database removed.')
      console.log('📝 Please run the following commands to recreate:\n')
      console.log('   npx prisma migrate dev')
      console.log('   # or')
      console.log('   npx prisma db push\n')
      console.log('📦 Backup saved at:', backupPath)
    }
    
    process.exit(1)
  }
}

fixDatabase()
