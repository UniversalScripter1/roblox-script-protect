import { NextResponse } from 'next/server';

export async function GET() {
  // Your REAL lua script as plain text
  const script = `
-- ╔════════════════════════════════════════════╗
-- ║     YOUR SUPER SECRET PROTECTED SCRIPT     ║
-- ╚════════════════════════════════════════════╝

print("This script is protected! Only executors can run me :)")
getgenv().MyCoolFunction = function() ... end
-- paste your entire script here
  `;

  return new Response(script, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
