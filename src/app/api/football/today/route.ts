import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey =
      process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API_FOOTBALL_KEY" },
        { status: 500 }
      );
    }

    const today =
      new Date().toISOString().split("T")[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "API-Football request failed",
          status: response.status,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "FOOTBALL TODAY ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load football fixtures" },
      { status: 500 }
    );
  }
}