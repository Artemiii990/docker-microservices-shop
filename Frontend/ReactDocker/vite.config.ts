import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({

    base: "/",

    plugins: [react()],

    server: {

        host: "0.0.0.0",

        proxy: {

            "/api/products": {
                target: "http://productservice:8080",
                changeOrigin: true
            },

            "/api/auth": {
                target: "http://authservice:8080",
                changeOrigin: true
            },

            "/api/orders": {
                target: "http://oorderservice:8080",
                changeOrigin: true
            }
        }
    }
});