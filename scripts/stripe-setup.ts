const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

async function createProducts() {
  try {
    // Create products and prices
    const products = [
      {
        name: "Paid Credits - 5",
        description: "For 5 interviews (casual users)",
        price: 4.99,
        credits: 5,
        metadata: {
          credits: "5",
          type: "credits",
        } as any,
      },
      {
        name: "Paid Credits - 10",
        description: "For 10 interviews (medium usage)",
        price: 9.99,
        credits: 10,
        metadata: {
          credits: "10",
          type: "credits",
        } as any,
      },
      {
        name: "Unlimited 6M",
        description: "Unlimited interviews for 6 months",
        price: 39.99,
        metadata: {
          type: "subscription",
          duration: "6m",
        } as any,
      },
      {
        name: "Unlimited 1Y",
        description: "Unlimited interviews for 1 year",
        price: 69.99,
        metadata: {
          type: "subscription",
          duration: "1y",
        } as any,
      },
    ];

    for (const product of products) {
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: product.metadata,
      });

      const price = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: Math.round(product.price * 100), // Convert to cents
        currency: "usd",
      });

      console.log(`Created ${product.name} with price ID: ${price.id}`);
    }

    console.log("Setup completed successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

createProducts();
