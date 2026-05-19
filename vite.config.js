import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        // Fail loudly if :5173 is taken — avoids a stale server on 5173 while you use :5174.
        strictPort: true,
    },
});
