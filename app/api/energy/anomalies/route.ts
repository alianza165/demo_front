// app/api/energy/anomalies/route.ts
export async function GET() {
  const data = {
    anomalies: [
      { id: '1', area: 'Production Line A', timestamp: '2025-09-14 10:23', value: 245, expected: 180, deviation: 36 },
      { id: '2', area: 'Compressor Room', timestamp: '2025-09-14 15:47', value: 87, expected: 65, deviation: 34 },
      { id: '3', area: 'Lighting - Main Hall', timestamp: '2025-09-14 20:15', value: 42, expected: 30, deviation: 40 }
    ]
  }
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
