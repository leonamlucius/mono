interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  [key: string]: any; // Permite qualquer outra variável que você adicione no futuro
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}