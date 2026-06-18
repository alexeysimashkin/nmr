import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    const tableNames = (tables as any[]).map((t: any) => t.table_name)
    const requiredTables = ['User', 'Booking', 'Notification']
    const tablesExist = requiredTables.every(t => tableNames.includes(t))
    
    return NextResponse.json({
      success: true,
      tablesExist,
      existingTables: tableNames
    })
  } catch (error: any) {
    console.error('Check DB error:', error)
    return NextResponse.json({
      success: false,
      tablesExist: false,
      error: error?.message || String(error)
    })
  } finally {
    await prisma.$disconnect()
  }
}
