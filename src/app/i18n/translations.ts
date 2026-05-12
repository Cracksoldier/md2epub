export type Locale = 'en' | 'de' | 'es' | 'da' | 'ja' | 'zh-TW';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'da', label: 'Dansk' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-TW', label: '繁體中文' },
];

export interface TranslationMap {
  toolbar: {
    import: string;
    settings: string;
    exportEpub: string;
    generating: string;
    importTitle: string;
    settingsTitle: string;
    exportTitle: string;
    languageLabel: string;
  };
  editor: {
    label: string;
    words: string;
    importTitle: string;
    clearTitle: string;
    dropHint: string;
    placeholder: string;
  };
  preview: {
    label: string;
    chapter: string;
    chapters: string;
  };
  settings: {
    title: string;
    closeTitle: string;
    bookTitle: string;
    bookTitlePlaceholder: string;
    author: string;
    authorPlaceholder: string;
    language: string;
    coverImage: string;
    removeCover: string;
    uploadCover: string;
    uploadCoverHint: string;
    splitChapters: string;
    splitChaptersDesc: string;
  };
  toast: {
    nothingToExport: string;
    downloaded: string;
    exportFailed: string;
    coverLoadError: string;
  };
}

export const TRANSLATIONS: Record<Locale, TranslationMap> = {
  en: {
    toolbar: {
      import: 'Import',
      settings: 'Settings',
      exportEpub: 'Export EPUB',
      generating: 'Generating…',
      importTitle: 'Import .md file (or drag and drop)',
      settingsTitle: 'Book settings (Ctrl+,)',
      exportTitle: 'Download EPUB (Ctrl+E)',
      languageLabel: 'UI Language',
    },
    editor: {
      label: 'Markdown',
      words: 'words',
      importTitle: 'Import file',
      clearTitle: 'Clear editor',
      dropHint: 'Drop .md file to import',
      placeholder: '# My Book Title\n\nStart writing your book here...\n\nDrop a .md file anywhere to import it.',
    },
    preview: {
      label: 'Preview',
      chapter: 'chapter',
      chapters: 'chapters',
    },
    settings: {
      title: 'Book Settings',
      closeTitle: 'Close settings',
      bookTitle: 'Book Title',
      bookTitlePlaceholder: 'My Book',
      author: 'Author',
      authorPlaceholder: 'Jane Doe',
      language: 'Language',
      coverImage: 'Cover Image',
      removeCover: 'Remove cover',
      uploadCover: 'Upload cover image',
      uploadCoverHint: 'JPG or PNG recommended',
      splitChapters: 'Split into chapters',
      splitChaptersDesc: 'Split content at each H1 and H2 heading into separate EPUB chapters.',
    },
    toast: {
      nothingToExport: 'Nothing to export — add some content first.',
      downloaded: '"{0}" downloaded!',
      exportFailed: 'Export failed — see console for details.',
      coverLoadError: 'Could not load image. Please use a JPEG or PNG.',
    },
  },

  de: {
    toolbar: {
      import: 'Importieren',
      settings: 'Einstellungen',
      exportEpub: 'EPUB exportieren',
      generating: 'Wird erstellt…',
      importTitle: '.md-Datei importieren (oder ablegen)',
      settingsTitle: 'Bucheinstellungen (Strg+,)',
      exportTitle: 'EPUB herunterladen (Strg+E)',
      languageLabel: 'Sprache der Oberfläche',
    },
    editor: {
      label: 'Markdown',
      words: 'Wörter',
      importTitle: 'Datei importieren',
      clearTitle: 'Editor leeren',
      dropHint: '.md-Datei ablegen zum Importieren',
      placeholder: '# Mein Buchtitel\n\nHier mit dem Schreiben beginnen...\n\n.md-Datei hier ablegen, um sie zu importieren.',
    },
    preview: {
      label: 'Vorschau',
      chapter: 'Kapitel',
      chapters: 'Kapitel',
    },
    settings: {
      title: 'Bucheinstellungen',
      closeTitle: 'Einstellungen schließen',
      bookTitle: 'Buchtitel',
      bookTitlePlaceholder: 'Mein Buch',
      author: 'Autor',
      authorPlaceholder: 'Max Mustermann',
      language: 'Sprache',
      coverImage: 'Titelbild',
      removeCover: 'Titelbild entfernen',
      uploadCover: 'Titelbild hochladen',
      uploadCoverHint: 'JPG oder PNG empfohlen',
      splitChapters: 'In Kapitel aufteilen',
      splitChaptersDesc: 'Inhalt an H1- und H2-Überschriften in separate EPUB-Kapitel aufteilen.',
    },
    toast: {
      nothingToExport: 'Nichts zum Exportieren – füge zuerst Inhalt hinzu.',
      downloaded: '„{0}" heruntergeladen!',
      exportFailed: 'Export fehlgeschlagen – Details in der Konsole.',
      coverLoadError: 'Bild konnte nicht geladen werden. Bitte JPEG oder PNG verwenden.',
    },
  },

  es: {
    toolbar: {
      import: 'Importar',
      settings: 'Ajustes',
      exportEpub: 'Exportar EPUB',
      generating: 'Generando…',
      importTitle: 'Importar archivo .md (o arrastrar y soltar)',
      settingsTitle: 'Ajustes del libro (Ctrl+,)',
      exportTitle: 'Descargar EPUB (Ctrl+E)',
      languageLabel: 'Idioma de la interfaz',
    },
    editor: {
      label: 'Markdown',
      words: 'palabras',
      importTitle: 'Importar archivo',
      clearTitle: 'Limpiar editor',
      dropHint: 'Suelta el archivo .md para importar',
      placeholder: '# Título de mi libro\n\nEmpieza a escribir aquí...\n\nSuelta un archivo .md en cualquier lugar para importarlo.',
    },
    preview: {
      label: 'Vista previa',
      chapter: 'capítulo',
      chapters: 'capítulos',
    },
    settings: {
      title: 'Ajustes del libro',
      closeTitle: 'Cerrar ajustes',
      bookTitle: 'Título del libro',
      bookTitlePlaceholder: 'Mi libro',
      author: 'Autor',
      authorPlaceholder: 'Juan García',
      language: 'Idioma',
      coverImage: 'Imagen de portada',
      removeCover: 'Quitar portada',
      uploadCover: 'Subir imagen de portada',
      uploadCoverHint: 'Se recomienda JPG o PNG',
      splitChapters: 'Dividir en capítulos',
      splitChaptersDesc: 'Divide el contenido en cada encabezado H1 y H2 en capítulos EPUB separados.',
    },
    toast: {
      nothingToExport: 'Nada que exportar — añade contenido primero.',
      downloaded: '"{0}" descargado!',
      exportFailed: 'Error al exportar — ver consola para más detalles.',
      coverLoadError: 'No se pudo cargar la imagen. Por favor usa JPEG o PNG.',
    },
  },

  da: {
    toolbar: {
      import: 'Importer',
      settings: 'Indstillinger',
      exportEpub: 'Eksporter EPUB',
      generating: 'Genererer…',
      importTitle: 'Importer .md-fil (eller træk og slip)',
      settingsTitle: 'Bogindstillinger (Ctrl+,)',
      exportTitle: 'Download EPUB (Ctrl+E)',
      languageLabel: 'Grænsefladesprog',
    },
    editor: {
      label: 'Markdown',
      words: 'ord',
      importTitle: 'Importer fil',
      clearTitle: 'Ryd editor',
      dropHint: 'Slip .md-fil for at importere',
      placeholder: '# Min bogtitel\n\nBegynd at skrive her...\n\nSlip en .md-fil et sted for at importere den.',
    },
    preview: {
      label: 'Forhåndsvisning',
      chapter: 'kapitel',
      chapters: 'kapitler',
    },
    settings: {
      title: 'Bogindstillinger',
      closeTitle: 'Luk indstillinger',
      bookTitle: 'Bogtitel',
      bookTitlePlaceholder: 'Min bog',
      author: 'Forfatter',
      authorPlaceholder: 'Jens Jensen',
      language: 'Sprog',
      coverImage: 'Omslagsbillede',
      removeCover: 'Fjern omslag',
      uploadCover: 'Upload omslagsbillede',
      uploadCoverHint: 'JPG eller PNG anbefales',
      splitChapters: 'Opdel i kapitler',
      splitChaptersDesc: 'Opdel indhold ved hvert H1- og H2-overskrift i separate EPUB-kapitler.',
    },
    toast: {
      nothingToExport: 'Intet at eksportere — tilføj noget indhold først.',
      downloaded: '"{0}" downloadet!',
      exportFailed: 'Eksport fejlede — se konsollen for detaljer.',
      coverLoadError: 'Kunne ikke indlæse billede. Brug venligst JPEG eller PNG.',
    },
  },

  ja: {
    toolbar: {
      import: 'インポート',
      settings: '設定',
      exportEpub: 'EPUBを出力',
      generating: '生成中…',
      importTitle: '.mdファイルをインポート（またはドラッグ＆ドロップ）',
      settingsTitle: '本の設定 (Ctrl+,)',
      exportTitle: 'EPUBをダウンロード (Ctrl+E)',
      languageLabel: '表示言語',
    },
    editor: {
      label: 'Markdown',
      words: '語',
      importTitle: 'ファイルをインポート',
      clearTitle: 'エディタをクリア',
      dropHint: '.mdファイルをドロップしてインポート',
      placeholder: '# 本のタイトル\n\nここから書き始めてください...\n\n.mdファイルをここにドロップしてインポートできます。',
    },
    preview: {
      label: 'プレビュー',
      chapter: 'チャプター',
      chapters: 'チャプター',
    },
    settings: {
      title: '本の設定',
      closeTitle: '設定を閉じる',
      bookTitle: '本のタイトル',
      bookTitlePlaceholder: '私の本',
      author: '著者',
      authorPlaceholder: '山田 太郎',
      language: '言語',
      coverImage: '表紙画像',
      removeCover: '表紙を削除',
      uploadCover: '表紙画像をアップロード',
      uploadCoverHint: 'JPGまたはPNGを推奨',
      splitChapters: 'チャプターに分割',
      splitChaptersDesc: 'H1とH2の見出しでコンテンツを分割し、個別のEPUBチャプターを作成します。',
    },
    toast: {
      nothingToExport: '出力するコンテンツがありません — 最初にコンテンツを追加してください。',
      downloaded: '「{0}」をダウンロードしました！',
      exportFailed: '出力に失敗しました — 詳細はコンソールを確認してください。',
      coverLoadError: '画像を読み込めませんでした。JPEGまたはPNGを使用してください。',
    },
  },

  'zh-TW': {
    toolbar: {
      import: '匯入',
      settings: '設定',
      exportEpub: '匯出 EPUB',
      generating: '產生中…',
      importTitle: '匯入 .md 檔案（或拖放）',
      settingsTitle: '書籍設定 (Ctrl+,)',
      exportTitle: '下載 EPUB (Ctrl+E)',
      languageLabel: '介面語言',
    },
    editor: {
      label: 'Markdown',
      words: '字',
      importTitle: '匯入檔案',
      clearTitle: '清除編輯器',
      dropHint: '拖放 .md 檔案以匯入',
      placeholder: '# 我的書名\n\n在此開始寫作...\n\n拖放 .md 檔案至任何位置以匯入。',
    },
    preview: {
      label: '預覽',
      chapter: '章節',
      chapters: '章節',
    },
    settings: {
      title: '書籍設定',
      closeTitle: '關閉設定',
      bookTitle: '書名',
      bookTitlePlaceholder: '我的書',
      author: '作者',
      authorPlaceholder: '作者姓名',
      language: '語言',
      coverImage: '封面圖片',
      removeCover: '移除封面',
      uploadCover: '上傳封面圖片',
      uploadCoverHint: '建議使用 JPG 或 PNG',
      splitChapters: '分割為章節',
      splitChaptersDesc: '在每個 H1 和 H2 標題處分割內容，生成獨立的 EPUB 章節。',
    },
    toast: {
      nothingToExport: '沒有可匯出的內容 — 請先新增內容。',
      downloaded: '「{0}」已下載！',
      exportFailed: '匯出失敗 — 請查看控制台以了解詳情。',
      coverLoadError: '無法載入圖片，請使用 JPEG 或 PNG。',
    },
  },
};
