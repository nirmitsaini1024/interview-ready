import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

function serializeBigInts(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }

  if (typeof obj === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInts(value);
    }
    return serialized;
  }

  return obj;
}

export async function GET(req) {
  try {

    const reports = await prisma.aiReport.findMany({
      include: {
        attempt: {
          include: {
            user: true,
            interview: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const serializedReports = serializeBigInts(reports);

    return NextResponse.json({ state: true, data: serializedReports, message: 'Success' }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ state: false, error: 'Internal Server Error' }, { status: 500 });
  }
}