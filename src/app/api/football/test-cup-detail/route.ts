import {
  NextResponse,
} from "next/server";

export async function GET() {
  try {
    const sourceUrl =
      "/football/match/fc-dunav-ruse-vs-lokomotiv-plovdiv/x7lm7phj82jkm2w/";

    const parts =
      sourceUrl
        .split("/")
        .filter(Boolean);

    const idSlug =
      parts[
        parts.length - 1
      ];

    const nameSlug =
      parts[
        parts.length - 2
      ];

    const testSlug =
      async (
        slug: string
      ) => {
        const response =
          await fetch(
            `https://sportscore.com/api/v1/match/?sport=football&slug=${encodeURIComponent(
              slug
            )}`,
            {
              cache:
                "no-store",
            }
          );

        let data:
          any = null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        return {
          slug,

          httpStatus:
            response.status,

          ok:
            response.ok,

          data,
        };
      };

    const [
      idResult,
      nameResult,
    ] =
      await Promise.all([
        testSlug(
          idSlug
        ),

        testSlug(
          nameSlug
        ),
      ]);

    return NextResponse.json({
      sourceUrl,

      idResult,

      nameResult,
    });
  } catch (error) {
    console.error(
      "CUP DETAIL TEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to inspect cup match detail",

        details:
          error instanceof
          Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}