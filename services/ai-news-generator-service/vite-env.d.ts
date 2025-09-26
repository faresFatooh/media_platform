/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_BACKEND_URL: string
  // يمكنك إضافة أي متغيرات بيئة أخرى هنا في المستقبل
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}