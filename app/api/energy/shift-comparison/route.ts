// app/api/energy/shift-comparison/route.ts
export async function GET() {
  const data = {
    shifts: [
      { name: 'Morning', consumption: 1250, average: 1100, limit: 1500 },
      { name: 'Evening', consumption: 1650, average: 1550, limit: 1800 },
      { name: 'Night', consumption: 950, average: 900, limit: 1200 }
    ],
    timeframe: '2025-09-14'
  }
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
