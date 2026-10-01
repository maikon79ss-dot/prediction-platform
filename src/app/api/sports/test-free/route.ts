import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://sportscore.com/api/v1/fixtures/?sport=football&date=2026-10-10&status=upcoming&limit=200",
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json({
      httpStatus: response.status,
      data,
    });
  } catch (error) {
    console.error(
      "SPORTSCORE TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load free sports fixtures",
      },
      {
        status: 500,
      }
    );
  }
}