# Site Ready Build

bro i have all the pages for the site can you build the site

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b86cfe6b-dbb5-4626-88ba-a54179a2077b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Environment Variables Configuration

### Local Development (`.env` / `.env.local`) & Vercel Production

| Variable Name | Scope | Description |
| --- | --- | --- |
| `VITE_SHOPIFY_STORE_DOMAIN` | Frontend / Build | Shopify Storefront Domain (`spark-zen-2.myshopify.com`) |
| `VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Frontend / Build | Shopify Public Storefront API Access Token |
| `VITE_SHOPIFY_STOREFRONT_API_VERSION` | Frontend / Build | Shopify Storefront API Version (`2026-07`) |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Server Only | Private Shopify Admin API Access Token with `draft_orders:write` & `orders:write` scopes for server-side order creation |
| `RAZORPAY_KEY_ID` | Server Only | Public Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Server Only (NEVER expose to client) | Razorpay Secret Key for HMAC-SHA256 verification |
| `RAZORPAY_WEBHOOK_SECRET` | Server Only | Webhook secret for verifying `X-Razorpay-Signature` |

> ⚠️ **Security Warning:** `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` must **NEVER** be prefixed with `VITE_` or exposed in client-side code bundles. Add them exclusively to server environment variables in Vercel.

