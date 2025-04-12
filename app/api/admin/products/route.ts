// app/api/admin/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Helper to validate admin - fixed for App Router
async function validateAdmin() {
  // In App Router, getServerSession doesn't need request headers
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return null;
  }

  return session;
}

// CREATE
export async function POST(req: NextRequest) {
  const session = await validateAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (
      !body.name ||
      !body.category ||
      !body.description ||
      body.price === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        price: parseFloat(body.price),
        imageUrl: body.imageUrl || null, // Handle potentially undefined imageUrl
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// UPDATE
export async function PUT(req: NextRequest) {
  const session = await validateAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (
      !body.id ||
      !body.name ||
      !body.category ||
      !body.description ||
      body.price === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        category: body.category,
        description: body.description,
        price: parseFloat(body.price),
        imageUrl: body.imageUrl || null,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  const session = await validateAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// // app/api/admin/products/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { prisma } from "@/lib/db";
// import { authOptions } from "@/lib/auth";

// // Helper to validate admin
// async function validateAdmin(req: NextRequest) {
//   // In Next.js App Router, we must reconstruct cookies from the request
//   const session = await getServerSession(
//     { req: { headers: req.headers } } as any,
//     authOptions
//   );

//   if (!session || session.user?.role !== "admin") {
//     return null;
//   }
//   return session;
// }

// // CREATE
// export async function POST(req: NextRequest) {
//   const session = await validateAdmin(req);
//   if (!session) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   try {
//     const { name, category, description, price, imageUrl } = await req.json();
//     const newProduct = await prisma.product.create({
//       data: {
//         name,
//         category,
//         description,
//         price: parseFloat(price),
//         imageUrl,
//       },
//     });
//     return NextResponse.json(newProduct, { status: 201 });
//   } catch (error: any) {
//     return new Response(error.message, { status: 400 });
//   }
// }

// // UPDATE
// export async function PUT(req: NextRequest) {
//   const session = await validateAdmin(req);
//   if (!session) return new Response("Unauthorized", { status: 401 });

//   try {
//     const { id, name, category, description, price, imageUrl } =
//       await req.json();
//     const updatedProduct = await prisma.product.update({
//       where: { id: Number(id) },
//       data: {
//         name,
//         category,
//         description,
//         price: parseFloat(price),
//         imageUrl,
//       },
//     });
//     return NextResponse.json(updatedProduct, { status: 200 });
//   } catch (error: any) {
//     return new Response(error.message, { status: 400 });
//   }
// }

// // DELETE
// export async function DELETE(req: NextRequest) {
//   const session = await validateAdmin(req);
//   if (!session) return new Response("Unauthorized", { status: 401 });

//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");
//     if (!id) {
//       return new Response("Missing product ID", { status: 400 });
//     }

//     await prisma.product.delete({
//       where: { id: Number(id) },
//     });
//     return new Response(null, { status: 204 });
//   } catch (error: any) {
//     return new Response(error.message, { status: 400 });
//   }
// }
