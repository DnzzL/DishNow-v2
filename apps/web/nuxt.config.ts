// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "latest",
	devtools: { enabled: true },
	modules: ["@nuxt/ui"],
	css: ["~/assets/css/main.css"],
	devServer: {
		port: 3001,
	},
	ssr: true,
	nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
	},
	runtimeConfig: {
		public: {
			serverURL: process.env.NUXT_PUBLIC_SERVER_URL,
			pocketbaseUrl: process.env.POCKETBASE_URL || "http://localhost:8090",
		},
	},
});
