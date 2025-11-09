// vite.config.js
import { defineConfig } from "file:///C:/Users/vardh/Desktop/fraffe/lms/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/vardh/Desktop/fraffe/lms/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import frappeui from "file:///C:/Users/vardh/Desktop/fraffe/lms/frontend/node_modules/frappe-ui/vite/index.js";
import { VitePWA } from "file:///C:/Users/vardh/Desktop/fraffe/lms/frontend/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\vardh\\Desktop\\fraffe\\lms\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    frappeui({
      frappeProxy: true,
      lucideIcons: true,
      jinjaBootData: true,
      frappeTypes: {
        input: {}
      },
      buildConfig: {
        indexHtmlPath: "../lms/www/lms.html"
      }
    }),
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      manifest: false
    })
  ],
  server: {
    host: "0.0.0.0",
    // Accept connections from any network interface
    allowedHosts: ["ps", "fs", "home"]
    // Explicitly allow this host
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "tailwind.config.js": path.resolve(__vite_injected_original_dirname, "tailwind.config.js")
    }
  },
  optimizeDeps: {
    include: [
      "feather-icons",
      "showdown",
      "engine.io-client",
      "tailwind.config.js",
      "interactjs",
      "highlight.js",
      "plyr"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx2YXJkaFxcXFxEZXNrdG9wXFxcXGZyYWZmZVxcXFxsbXNcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHZhcmRoXFxcXERlc2t0b3BcXFxcZnJhZmZlXFxcXGxtc1xcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvdmFyZGgvRGVza3RvcC9mcmFmZmUvbG1zL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBmcmFwcGV1aSBmcm9tICdmcmFwcGUtdWkvdml0ZSdcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcblx0cGx1Z2luczogW1xyXG5cdFx0ZnJhcHBldWkoe1xyXG5cdFx0XHRmcmFwcGVQcm94eTogdHJ1ZSxcclxuXHRcdFx0bHVjaWRlSWNvbnM6IHRydWUsXHJcblx0XHRcdGppbmphQm9vdERhdGE6IHRydWUsXHJcblx0XHRcdGZyYXBwZVR5cGVzOiB7XHJcblx0XHRcdFx0aW5wdXQ6IHt9LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRidWlsZENvbmZpZzoge1xyXG5cdFx0XHRcdGluZGV4SHRtbFBhdGg6ICcuLi9sbXMvd3d3L2xtcy5odG1sJyxcclxuXHRcdFx0fSxcclxuXHRcdH0pLFxyXG5cdFx0dnVlKHtcclxuXHRcdFx0c2NyaXB0OiB7XHJcblx0XHRcdFx0ZGVmaW5lTW9kZWw6IHRydWUsXHJcblx0XHRcdFx0cHJvcHNEZXN0cnVjdHVyZTogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdH0pLFxyXG5cdFx0Vml0ZVBXQSh7XHJcblx0XHRcdHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG5cdFx0XHRkZXZPcHRpb25zOiB7XHJcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0d29ya2JveDoge1xyXG5cdFx0XHRcdGNsZWFudXBPdXRkYXRlZENhY2hlczogdHJ1ZSxcclxuXHRcdFx0XHRtYXhpbXVtRmlsZVNpemVUb0NhY2hlSW5CeXRlczogNSAqIDEwMjQgKiAxMDI0LFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRtYW5pZmVzdDogZmFsc2UsXHJcblx0XHR9KSxcclxuXHRdLFxyXG5cdHNlcnZlcjoge1xyXG5cdFx0aG9zdDogJzAuMC4wLjAnLCAvLyBBY2NlcHQgY29ubmVjdGlvbnMgZnJvbSBhbnkgbmV0d29yayBpbnRlcmZhY2VcclxuXHRcdGFsbG93ZWRIb3N0czogWydwcycsICdmcycsICdob21lJ10sIC8vIEV4cGxpY2l0bHkgYWxsb3cgdGhpcyBob3N0XHJcblx0fSxcclxuXHRyZXNvbHZlOiB7XHJcblx0XHRhbGlhczoge1xyXG5cdFx0XHQnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcclxuXHRcdFx0J3RhaWx3aW5kLmNvbmZpZy5qcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICd0YWlsd2luZC5jb25maWcuanMnKSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRvcHRpbWl6ZURlcHM6IHtcclxuXHRcdGluY2x1ZGU6IFtcclxuXHRcdFx0J2ZlYXRoZXItaWNvbnMnLFxyXG5cdFx0XHQnc2hvd2Rvd24nLFxyXG5cdFx0XHQnZW5naW5lLmlvLWNsaWVudCcsXHJcblx0XHRcdCd0YWlsd2luZC5jb25maWcuanMnLFxyXG5cdFx0XHQnaW50ZXJhY3RqcycsXHJcblx0XHRcdCdoaWdobGlnaHQuanMnLFxyXG5cdFx0XHQncGx5cicsXHJcblx0XHRdLFxyXG5cdH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFQsU0FBUyxvQkFBb0I7QUFDM1YsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGNBQWM7QUFDckIsU0FBUyxlQUFlO0FBSnhCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSLFNBQVM7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLGFBQWE7QUFBQSxNQUNiLGVBQWU7QUFBQSxNQUNmLGFBQWE7QUFBQSxRQUNaLE9BQU8sQ0FBQztBQUFBLE1BQ1Q7QUFBQSxNQUNBLGFBQWE7QUFBQSxRQUNaLGVBQWU7QUFBQSxNQUNoQjtBQUFBLElBQ0QsQ0FBQztBQUFBLElBQ0QsSUFBSTtBQUFBLE1BQ0gsUUFBUTtBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsTUFDbkI7QUFBQSxJQUNELENBQUM7QUFBQSxJQUNELFFBQVE7QUFBQSxNQUNQLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxRQUNYLFNBQVM7QUFBQSxNQUNWO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUix1QkFBdUI7QUFBQSxRQUN2QiwrQkFBK0IsSUFBSSxPQUFPO0FBQUEsTUFDM0M7QUFBQSxNQUNBLFVBQVU7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxJQUNOLGNBQWMsQ0FBQyxNQUFNLE1BQU0sTUFBTTtBQUFBO0FBQUEsRUFDbEM7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNOLEtBQUssS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxNQUNsQyxzQkFBc0IsS0FBSyxRQUFRLGtDQUFXLG9CQUFvQjtBQUFBLElBQ25FO0FBQUEsRUFDRDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ2IsU0FBUztBQUFBLE1BQ1I7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
