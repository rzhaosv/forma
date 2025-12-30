# Getting Started with Vercel Web Analytics

This guide will help you get started with using Vercel Web Analytics on your project, showing you how to enable it, add the package to your project, deploy your app to Vercel, and view your data in the dashboard.

## Prerequisites

- A Vercel account. If you don't have one, you can [sign up for free](https://vercel.com/signup).
- A Vercel project. If you don't have one, you can [create a new project](https://vercel.com/new).
- The Vercel CLI installed. If you don't have it, you can install it using the following command:

```bash
# Using pnpm
pnpm i vercel

# Using yarn
yarn i vercel

# Using npm
npm i vercel

# Using bun
bun i vercel
```

## Step 1: Enable Web Analytics in Vercel

On the [Vercel dashboard](/dashboard), select your Project and then click the **Analytics** tab and click **Enable** from the dialog.

> **💡 Note:** Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*`) after your next deployment.

## Step 2: Add `@vercel/analytics` to Your Project

Using the package manager of your choice, add the `@vercel/analytics` package to your project:

```bash
# Using pnpm
pnpm i @vercel/analytics

# Using yarn
yarn i @vercel/analytics

# Using npm
npm i @vercel/analytics

# Using bun
bun i @vercel/analytics
```

## Step 3: Add the Analytics Component to Your App

Choose the integration method based on your framework:

### Next.js (Pages Router)

If you are using the `pages` directory, add the following code to your main app file:

```tsx filename="pages/_app.tsx"
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/next";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp;
```

### Next.js (App Router)

Add the following code to the root layout:

```tsx filename="app/layout.tsx"
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Next.js</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Remix

Add the following code to your root file:

```tsx filename="app/root.tsx"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/remix";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Analytics />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
```

### Nuxt

Add the following code to your main component:

```vue filename="app.vue"
<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<template>
  <Analytics />
  <NuxtPage />
</template>
```

### SvelteKit

Add the following code to the main layout:

```ts filename="src/routes/+layout.ts"
import { dev } from "$app/environment";
import { injectAnalytics } from "@vercel/analytics/sveltekit";

injectAnalytics({ mode: dev ? "development" : "production" });
```

> **Note:** The `injectAnalytics` function is a wrapper around the tracking script, offering more seamless integration with SvelteKit.js, including route support.

### Astro

Add the following code to your base layout:

```astro filename="src/layouts/Base.astro"
---
import Analytics from '@vercel/analytics/astro';
{/* ... */}
---

<html lang="en">
	<head>
      <meta charset="utf-8" />
      <!-- ... -->
      <Analytics />
	</head>
	<body>
		<slot />
    </body>
</html>
```

> **Note:** The `Analytics` component is available in version `@vercel/analytics@1.4.0` and later. If you are using an earlier version, you must configure the `webAnalytics` property of the Vercel adapter in your `astro.config.mjs` file as shown in the code below.

```ts filename="astro.config.mjs"
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true, // set to false when using @vercel/analytics@1.4.0
    },
  }),
});
```

### React (Create React App)

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with React.

> **Note:** When using the plain React implementation, there is no route support.

Add the following code to the main app file:

```tsx filename="App.tsx"
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <div>
      {/* ... */}
      <Analytics />
    </div>
  );
}
```

### Vue

The `Analytics` component is a wrapper around the tracking script, offering more seamless integration with Vue.

> **Note:** Route support is automatically enabled if you're using `vue-router`.

Add the following code to your main component:

```vue filename="src/App.vue"
<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue';
</script>

<template>
  <Analytics />
  <!-- your content -->
</template>
```

### Plain HTML

For plain HTML sites, you can add the following script to your `.html` files:

```html filename="index.html"
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

> **Note:** When using the HTML implementation, there is no need to install the `@vercel/analytics` package. However, there is no route support.

### Other JavaScript Frameworks

Import the `inject` function from the package, which will add the tracking script to your app. **This should only be called once in your app, and must run in the client**.

> **Note:** There is no route support with the `inject` function.

Add the following code to your main app file:

```ts filename="main.ts"
import { inject } from "@vercel/analytics";

inject();
```

## Step 4: Deploy Your App to Vercel

Deploy your app using the following command:

```bash
vercel deploy
```

If you haven't already, we also recommend [connecting your project's Git repository](/docs/git#deploying-a-git-repository), which will enable Vercel to deploy your latest commits to main without terminal commands.

Once your app is deployed, it will start tracking visitors and page views.

> **💡 Note:** If everything is set up properly, you should be able to see a Fetch/XHR request in your browser's Network tab from `/_vercel/insights/view` when you visit any page.

## Step 5: View Your Data in the Dashboard

Once your app is deployed, and users have visited your site, you can view your data in the dashboard.

To do so, go to your [dashboard](/dashboard), select your project, and click the **Analytics** tab.

After a few days of visitors, you'll be able to start exploring your data by viewing and [filtering](/docs/analytics/filtering) the panels.

Users on Pro and Enterprise plans can also add [custom events](/docs/analytics/custom-events) to their data to track user interactions such as button clicks, form submissions, or purchases.

## Privacy and Compliance

Learn more about how Vercel supports [privacy and data compliance standards](/docs/analytics/privacy-policy) with Vercel Web Analytics.

## Next Steps

Now that you have Vercel Web Analytics set up, you can explore the following topics to learn more:

- [Learn how to use the `@vercel/analytics` package](/docs/analytics/package)
- [Learn how to set update custom events](/docs/analytics/custom-events)
- [Learn about filtering data](/docs/analytics/filtering)
- [Read about privacy and compliance](/docs/analytics/privacy-policy)
- [Explore pricing](/docs/analytics/limits-and-pricing)
- [Troubleshooting](/docs/analytics/troubleshooting)

## Integration with Forma Project

For the Forma calorie tracking application:

1. **Enable Analytics**: Go to your Vercel dashboard for the Forma project and enable Web Analytics under the Analytics tab.

2. **Install Package**: 
```bash
npm install @vercel/analytics
# or with your preferred package manager
```

3. **Add to Your App**: The specific integration depends on your app framework:
   - For **Next.js App Router**, add `<Analytics />` to your root layout
   - For **React Native** or **mobile apps**, consider using alternative analytics solutions that better support mobile environments

4. **Deploy**: Ensure your deployment to Vercel includes the latest code changes with the analytics component integrated.

5. **Monitor**: Once deployed and receiving traffic, check the Analytics tab in your Vercel dashboard to see real-time visitor data, page views, and other metrics.

This setup will help you track user engagement on your web-based Forma applications and dashboards.
