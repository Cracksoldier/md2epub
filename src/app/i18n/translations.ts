export type Locale = 'en' | 'de' | 'de-styr' | 'es' | 'da' | 'ja' | 'zh-TW';

export const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'de-styr', label: 'Steirisch' },
  { code: 'es', label: 'Español' },
  { code: 'da', label: 'Dansk' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-TW', label: '繁體中文' },
];

export interface TranslationMap {
  toolbar: {
    import: string;
    saveProject: string;
    loadProject: string;
    settings: string;
    exportEpub: string;
    generating: string;
    importTitle: string;
    saveProjectTitle: string;
    loadProjectTitle: string;
    settingsTitle: string;
    exportTitle: string;
    languageLabel: string;
    coffee: string;
    coffeeTitle: string;
  };
  editor: {
    label: string;
    words: string;
    readingTime: string;
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
    publisher: string;
    publisherPlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    epubTheme: string;
    themeClassic: string;
    themeModern: string;
    themeMinimal: string;
    splitChapters: string;
    splitChaptersDesc: string;
  };
  toast: {
    nothingToExport: string;
    downloaded: string;
    exportFailed: string;
    coverLoadError: string;
    projectSaved: string;
    projectLoaded: string;
    projectLoadError: string;
    dismissTitle: string;
  };
  welcome: {
    title: string;
    privacyHeading: string;
    privacyText: string;
    languageLabel: string;
    continueBtn: string;
  };
  chapterList: {
    label: string;
    noChapters: string;
  };
  shortcuts: {
    title: string;
    closeTitle: string;
    closeBtn: string;
    groupGeneral: string;
    groupEditor: string;
    actionExport: string;
    actionSettings: string;
    actionHelp: string;
    actionBold: string;
    actionItalic: string;
    actionIndent: string;
  };
}

export const TRANSLATIONS: Record<Locale, TranslationMap> = {
  en: {
    toolbar: {
      import: 'Import',
      saveProject: 'Save Project',
      loadProject: 'Load Project',
      settings: 'Settings',
      exportEpub: 'Export EPUB',
      generating: 'Generating…',
      importTitle: 'Import .md file (or drag and drop)',
      saveProjectTitle: 'Save project as JSON',
      loadProjectTitle: 'Load project from JSON',
      settingsTitle: 'Book settings (Ctrl+,)',
      exportTitle: 'Download EPUB (Ctrl+E)',
      languageLabel: 'UI Language',
      coffee: 'Buy me a coffee',
      coffeeTitle: 'Buy me a coffee',
    },
    editor: {
      label: 'Markdown',
      words: 'words',
      readingTime: '~{0} min read',
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
      publisher: 'Publisher',
      publisherPlaceholder: 'Publisher name',
      description: 'Description',
      descriptionPlaceholder: 'A short summary of the book…',
      epubTheme: 'EPUB Theme',
      themeClassic: 'Classic (serif)',
      themeModern: 'Modern (sans-serif)',
      themeMinimal: 'Minimal',
      splitChapters: 'Split into chapters',
      splitChaptersDesc: 'Split content at each H1 heading into separate EPUB chapters. H2 headings become subchapters within their chapter.',
    },
    toast: {
      nothingToExport: 'Nothing to export — add some content first.',
      downloaded: '"{0}" downloaded!',
      exportFailed: 'Export failed — see console for details.',
      coverLoadError: 'Could not load image. Please use a JPEG or PNG.',
      projectSaved: 'Project saved.',
      projectLoaded: 'Project loaded: {0}',
      projectLoadError: 'Invalid project file.',
      dismissTitle: 'Dismiss',
    },
    welcome: {
      title: 'Welcome to MD → EPUB',
      privacyHeading: 'Your data stays on your device',
      privacyText: 'Everything runs entirely in your browser. Your text, files, and metadata are never sent to any server.',
      languageLabel: 'Choose your language',
      continueBtn: 'Get Started',
    },
    chapterList: {
      label: 'Chapters',
      noChapters: 'No chapters yet',
    },
    shortcuts: {
      title: 'Keyboard Shortcuts',
      closeTitle: 'Close',
      closeBtn: 'Close',
      groupGeneral: 'General',
      groupEditor: 'Editor',
      actionExport: 'Export EPUB',
      actionSettings: 'Open / close settings',
      actionHelp: 'Show keyboard shortcuts',
      actionBold: 'Bold',
      actionItalic: 'Italic',
      actionIndent: 'Indent 2 spaces',
    },
  },

  de: {
    toolbar: {
      import: 'Importieren',
      saveProject: 'Projekt speichern',
      loadProject: 'Projekt laden',
      settings: 'Einstellungen',
      exportEpub: 'EPUB exportieren',
      generating: 'Wird erstellt…',
      importTitle: '.md-Datei importieren (oder ablegen)',
      saveProjectTitle: 'Projekt als JSON speichern',
      loadProjectTitle: 'Projekt aus JSON laden',
      settingsTitle: 'Bucheinstellungen (Strg+,)',
      exportTitle: 'EPUB herunterladen (Strg+E)',
      languageLabel: 'Sprache der Oberfläche',
      coffee: 'Spendier mir einen Kaffee',
      coffeeTitle: 'Spendier mir einen Kaffee',
    },
    editor: {
      label: 'Markdown',
      words: 'Wörter',
      readingTime: '~{0} Min. Lesezeit',
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
      publisher: 'Verlag',
      publisherPlaceholder: 'Verlagsname',
      description: 'Beschreibung',
      descriptionPlaceholder: 'Eine kurze Zusammenfassung des Buches…',
      epubTheme: 'EPUB-Design',
      themeClassic: 'Klassisch (Serifenschrift)',
      themeModern: 'Modern (serifenlos)',
      themeMinimal: 'Minimal',
      splitChapters: 'In Kapitel aufteilen',
      splitChaptersDesc: 'Inhalt an H1-Überschriften in separate EPUB-Kapitel aufteilen. H2-Überschriften werden zu Unterkapiteln im jeweiligen Kapitel.',
    },
    toast: {
      nothingToExport: 'Nichts zum Exportieren – füge zuerst Inhalt hinzu.',
      downloaded: '„{0}" heruntergeladen!',
      exportFailed: 'Export fehlgeschlagen – Details in der Konsole.',
      coverLoadError: 'Bild konnte nicht geladen werden. Bitte JPEG oder PNG verwenden.',
      projectSaved: 'Projekt gespeichert.',
      projectLoaded: 'Projekt geladen: {0}',
      projectLoadError: 'Ungültige Projektdatei.',
      dismissTitle: 'Schließen',
    },
    welcome: {
      title: 'Willkommen bei MD → EPUB',
      privacyHeading: 'Deine Daten bleiben bei dir',
      privacyText: 'Alles läuft vollständig in deinem Browser. Dein Text, deine Dateien und Metadaten werden niemals an einen Server gesendet.',
      languageLabel: 'Sprache wählen',
      continueBtn: 'Loslegen',
    },
    chapterList: {
      label: 'Kapitel',
      noChapters: 'Noch keine Kapitel',
    },
    shortcuts: {
      title: 'Tastenkürzel',
      closeTitle: 'Schließen',
      closeBtn: 'Schließen',
      groupGeneral: 'Allgemein',
      groupEditor: 'Editor',
      actionExport: 'EPUB exportieren',
      actionSettings: 'Einstellungen öffnen / schließen',
      actionHelp: 'Tastenkürzel anzeigen',
      actionBold: 'Fett',
      actionItalic: 'Kursiv',
      actionIndent: '2 Leerzeichen einrücken',
    },
  },

  'de-styr': {
    toolbar: {
      import: 'Einlesen',
      saveProject: 'Projekt speichern',
      loadProject: 'Projekt laden',
      settings: 'Einstellungen',
      exportEpub: 'EPUB exportiern',
      generating: 'Wiad gmocht…',
      importTitle: '.md-Datei einlesen (oder drogn und lossn)',
      saveProjectTitle: 'Projekt ois JSON speichern',
      loadProjectTitle: 'Projekt aus JSON laden',
      settingsTitle: 'Buacheinstellungen (Strg+,)',
      exportTitle: 'EPUB runterladen (Strg+E)',
      languageLabel: 'Oberflächen-Sproch',
      coffee: 'Hau mir an Kaffee aussa',
      coffeeTitle: 'Hau mir an Kaffee aussa',
    },
    editor: {
      label: 'Markdown',
      words: 'Wörter',
      readingTime: '~{0} Min. Lesezeit',
      importTitle: 'Datei einlesen',
      clearTitle: 'Editor ausleern',
      dropHint: '.md-Datei hinlegn zum Einlesen',
      placeholder: '# Mei Buachtitel\n\nDo kumm i zum Schreim on...\n\nA .md-Datei irgendwo hinlegn zum Einlesen.',
    },
    preview: {
      label: 'Vorschau',
      chapter: 'Kapitel',
      chapters: 'Kapitel',
    },
    settings: {
      title: 'Buacheinstellungen',
      closeTitle: 'Einstellungen zumachen',
      bookTitle: 'Buachtitel',
      bookTitlePlaceholder: 'Mei Buach',
      author: 'Autor',
      authorPlaceholder: 'Franz Gruber',
      language: 'Sproch',
      coverImage: 'Titelbiid',
      removeCover: 'Titelbiid wegschmeißn',
      uploadCover: 'Titelbiid hochladen',
      uploadCoverHint: 'JPG oder PNG empfohlen',
      publisher: 'Verlog',
      publisherPlaceholder: 'Verlogsname',
      description: 'Beschreibung',
      descriptionPlaceholder: 'A kurze Zsammenfassung vom Buach…',
      epubTheme: 'EPUB-Design',
      themeClassic: 'Klassisch (Serifenschrift)',
      themeModern: 'Modern (serifenlos)',
      themeMinimal: 'Minimal',
      splitChapters: 'In Kapitel aufteilen',
      splitChaptersDesc: 'Den Inhalt bei jedn H1-Überschrift in eigane EPUB-Kapitel aufteilen. H2-Überschriften wern zu Unterkapiteln im jeweiligen Kapitel.',
    },
    toast: {
      nothingToExport: 'Nix zum Exportiern – schreib zerscht wos.',
      downloaded: '„{0}" runtergladen!',
      exportFailed: 'Export hob ned funktioniert – schau in d Konsol nei.',
      coverLoadError: 'Biid hot si ned laden lossn. Nimm bitte a JPEG oder PNG.',
      projectSaved: 'Projekt gspreichert.',
      projectLoaded: 'Projekt gladen: {0}',
      projectLoadError: 'Ungütige Projektdatei.',
      dismissTitle: 'Wegda',
    },
    welcome: {
      title: 'Willkumm bei MD → EPUB',
      privacyHeading: 'Deine Daten bleibn bei dir',
      privacyText: 'Ois lauft direkt in deim Browser. Dei Text, dei Dateien und Metadaten wern nie an kan Server gschickt.',
      languageLabel: 'Sproch auswählen',
      continueBtn: 'Los geht\'s',
    },
    chapterList: {
      label: 'Kapitel',
      noChapters: 'No kane Kapitel',
    },
    shortcuts: {
      title: 'Tastnkürzel',
      closeTitle: 'Zumachen',
      closeBtn: 'Zumachen',
      groupGeneral: 'Allgemoin',
      groupEditor: 'Editor',
      actionExport: 'EPUB exportiern',
      actionSettings: 'Einstellungen auf- / zumachen',
      actionHelp: 'Tastnkürzel ozoagn',
      actionBold: 'Fett',
      actionItalic: 'Kursiv',
      actionIndent: '2 Leerzeichen einrückn',
    },
  },

  es: {
    toolbar: {
      import: 'Importar',
      saveProject: 'Guardar proyecto',
      loadProject: 'Cargar proyecto',
      settings: 'Ajustes',
      exportEpub: 'Exportar EPUB',
      generating: 'Generando…',
      importTitle: 'Importar archivo .md (o arrastrar y soltar)',
      saveProjectTitle: 'Guardar proyecto como JSON',
      loadProjectTitle: 'Cargar proyecto desde JSON',
      settingsTitle: 'Ajustes del libro (Ctrl+,)',
      exportTitle: 'Descargar EPUB (Ctrl+E)',
      languageLabel: 'Idioma de la interfaz',
      coffee: 'Invítame un café',
      coffeeTitle: 'Invítame un café',
    },
    editor: {
      label: 'Markdown',
      words: 'palabras',
      readingTime: '~{0} min de lectura',
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
      publisher: 'Editorial',
      publisherPlaceholder: 'Nombre de la editorial',
      description: 'Descripción',
      descriptionPlaceholder: 'Un breve resumen del libro…',
      epubTheme: 'Tema EPUB',
      themeClassic: 'Clásico (con serifa)',
      themeModern: 'Moderno (sin serifa)',
      themeMinimal: 'Mínimal',
      splitChapters: 'Dividir en capítulos',
      splitChaptersDesc: 'Divide el contenido en cada encabezado H1 en capítulos EPUB separados. Los encabezados H2 se convierten en subcapítulos dentro de su capítulo.',
    },
    toast: {
      nothingToExport: 'Nada que exportar — añade contenido primero.',
      downloaded: '"{0}" descargado!',
      exportFailed: 'Error al exportar — ver consola para más detalles.',
      coverLoadError: 'No se pudo cargar la imagen. Por favor usa JPEG o PNG.',
      projectSaved: 'Proyecto guardado.',
      projectLoaded: 'Proyecto cargado: {0}',
      projectLoadError: 'Archivo de proyecto inválido.',
      dismissTitle: 'Cerrar',
    },
    welcome: {
      title: 'Bienvenido a MD → EPUB',
      privacyHeading: 'Tus datos permanecen en tu dispositivo',
      privacyText: 'Todo se ejecuta completamente en tu navegador. Tu texto, archivos y metadatos nunca se envían a ningún servidor.',
      languageLabel: 'Elige tu idioma',
      continueBtn: 'Comenzar',
    },
    chapterList: {
      label: 'Capítulos',
      noChapters: 'Sin capítulos',
    },
    shortcuts: {
      title: 'Atajos de teclado',
      closeTitle: 'Cerrar',
      closeBtn: 'Cerrar',
      groupGeneral: 'General',
      groupEditor: 'Editor',
      actionExport: 'Exportar EPUB',
      actionSettings: 'Abrir / cerrar ajustes',
      actionHelp: 'Mostrar atajos de teclado',
      actionBold: 'Negrita',
      actionItalic: 'Cursiva',
      actionIndent: 'Indentar 2 espacios',
    },
  },

  da: {
    toolbar: {
      import: 'Importer',
      saveProject: 'Gem projekt',
      loadProject: 'Indlæs projekt',
      settings: 'Indstillinger',
      exportEpub: 'Eksporter EPUB',
      generating: 'Genererer…',
      importTitle: 'Importer .md-fil (eller træk og slip)',
      saveProjectTitle: 'Gem projekt som JSON',
      loadProjectTitle: 'Indlæs projekt fra JSON',
      settingsTitle: 'Bogindstillinger (Ctrl+,)',
      exportTitle: 'Download EPUB (Ctrl+E)',
      languageLabel: 'Grænsefladesprog',
      coffee: 'Køb mig en kaffe',
      coffeeTitle: 'Køb mig en kaffe',
    },
    editor: {
      label: 'Markdown',
      words: 'ord',
      readingTime: '~{0} min læsning',
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
      publisher: 'Udgiver',
      publisherPlaceholder: 'Udgiverens navn',
      description: 'Beskrivelse',
      descriptionPlaceholder: 'En kort opsummering af bogen…',
      epubTheme: 'EPUB-tema',
      themeClassic: 'Klassisk (serif)',
      themeModern: 'Moderne (sans-serif)',
      themeMinimal: 'Minimal',
      splitChapters: 'Opdel i kapitler',
      splitChaptersDesc: 'Opdel indhold ved hvert H1-overskrift i separate EPUB-kapitler. H2-overskrifter bliver underkapitler i deres kapitel.',
    },
    toast: {
      nothingToExport: 'Intet at eksportere — tilføj noget indhold først.',
      downloaded: '"{0}" downloadet!',
      exportFailed: 'Eksport fejlede — se konsollen for detaljer.',
      coverLoadError: 'Kunne ikke indlæse billede. Brug venligst JPEG eller PNG.',
      projectSaved: 'Projekt gemt.',
      projectLoaded: 'Projekt indlæst: {0}',
      projectLoadError: 'Ugyldig projektfil.',
      dismissTitle: 'Luk',
    },
    welcome: {
      title: 'Velkommen til MD → EPUB',
      privacyHeading: 'Dine data forbliver på din enhed',
      privacyText: 'Alt kører udelukkende i din browser. Din tekst, filer og metadata sendes aldrig til nogen server.',
      languageLabel: 'Vælg dit sprog',
      continueBtn: 'Kom i gang',
    },
    chapterList: {
      label: 'Kapitler',
      noChapters: 'Ingen kapitler endnu',
    },
    shortcuts: {
      title: 'Tastaturgenveje',
      closeTitle: 'Luk',
      closeBtn: 'Luk',
      groupGeneral: 'Generelt',
      groupEditor: 'Editor',
      actionExport: 'Eksporter EPUB',
      actionSettings: 'Åbn / luk indstillinger',
      actionHelp: 'Vis tastaturgenveje',
      actionBold: 'Fed',
      actionItalic: 'Kursiv',
      actionIndent: 'Indryk 2 mellemrum',
    },
  },

  ja: {
    toolbar: {
      import: 'インポート',
      saveProject: 'プロジェクトを保存',
      loadProject: 'プロジェクトを読込',
      settings: '設定',
      exportEpub: 'EPUBを出力',
      generating: '生成中…',
      importTitle: '.mdファイルをインポート（またはドラッグ＆ドロップ）',
      saveProjectTitle: 'プロジェクトをJSONで保存',
      loadProjectTitle: 'JSONからプロジェクトを読込',
      settingsTitle: '本の設定 (Ctrl+,)',
      exportTitle: 'EPUBをダウンロード (Ctrl+E)',
      languageLabel: '表示言語',
      coffee: 'コーヒーをおごる',
      coffeeTitle: 'コーヒーをおごる',
    },
    editor: {
      label: 'Markdown',
      words: '語',
      readingTime: '約{0}分',
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
      publisher: '出版社',
      publisherPlaceholder: '出版社名',
      description: '概要',
      descriptionPlaceholder: '本の短い説明…',
      epubTheme: 'EPUBテーマ',
      themeClassic: 'クラシック（セリフ体）',
      themeModern: 'モダン（サンセリフ体）',
      themeMinimal: 'ミニマル',
      splitChapters: 'チャプターに分割',
      splitChaptersDesc: 'H1の見出しでコンテンツを分割し、個別のEPUBチャプターを作成します。H2の見出しは各チャプター内のサブチャプターになります。',
    },
    toast: {
      nothingToExport: '出力するコンテンツがありません — 最初にコンテンツを追加してください。',
      downloaded: '「{0}」をダウンロードしました！',
      exportFailed: '出力に失敗しました — 詳細はコンソールを確認してください。',
      coverLoadError: '画像を読み込めませんでした。JPEGまたはPNGを使用してください。',
      projectSaved: 'プロジェクトを保存しました。',
      projectLoaded: 'プロジェクトを読み込みました：{0}',
      projectLoadError: '無効なプロジェクトファイルです。',
      dismissTitle: '閉じる',
    },
    welcome: {
      title: 'MD → EPUB へようこそ',
      privacyHeading: 'データはお使いのデバイス上に保持されます',
      privacyText: 'すべてブラウザ上で動作します。テキスト、ファイル、メタデータがサーバーに送信されることはありません。',
      languageLabel: '言語を選択',
      continueBtn: 'はじめる',
    },
    chapterList: {
      label: 'チャプター一覧',
      noChapters: 'チャプターなし',
    },
    shortcuts: {
      title: 'キーボードショートカット',
      closeTitle: '閉じる',
      closeBtn: '閉じる',
      groupGeneral: '全般',
      groupEditor: 'エディタ',
      actionExport: 'EPUBを出力',
      actionSettings: '設定を開く / 閉じる',
      actionHelp: 'ショートカット一覧を表示',
      actionBold: '太字',
      actionItalic: 'イタリック',
      actionIndent: '2スペースインデント',
    },
  },

  'zh-TW': {
    toolbar: {
      import: '匯入',
      saveProject: '儲存專案',
      loadProject: '載入專案',
      settings: '設定',
      exportEpub: '匯出 EPUB',
      generating: '產生中…',
      importTitle: '匯入 .md 檔案（或拖放）',
      saveProjectTitle: '將專案儲存為 JSON',
      loadProjectTitle: '從 JSON 載入專案',
      settingsTitle: '書籍設定 (Ctrl+,)',
      exportTitle: '下載 EPUB (Ctrl+E)',
      languageLabel: '介面語言',
      coffee: '請我喝杯咖啡',
      coffeeTitle: '請我喝杯咖啡',
    },
    editor: {
      label: 'Markdown',
      words: '字',
      readingTime: '約{0}分鐘閱讀',
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
      publisher: '出版社',
      publisherPlaceholder: '出版社名稱',
      description: '簡介',
      descriptionPlaceholder: '書籍的簡短摘要…',
      epubTheme: 'EPUB 主題',
      themeClassic: '經典（襯線字體）',
      themeModern: '現代（無襯線字體）',
      themeMinimal: '極簡',
      splitChapters: '分割為章節',
      splitChaptersDesc: '在每個 H1 標題處分割內容，生成獨立的 EPUB 章節。H2 標題成為其所在章節的子章節。',
    },
    toast: {
      nothingToExport: '沒有可匯出的內容 — 請先新增內容。',
      downloaded: '「{0}」已下載！',
      exportFailed: '匯出失敗 — 請查看控制台以了解詳情。',
      coverLoadError: '無法載入圖片，請使用 JPEG 或 PNG。',
      projectSaved: '專案已儲存。',
      projectLoaded: '專案已載入：{0}',
      projectLoadError: '無效的專案檔案。',
      dismissTitle: '關閉',
    },
    welcome: {
      title: '歡迎使用 MD → EPUB',
      privacyHeading: '您的資料保留在裝置上',
      privacyText: '所有處理完全在您的瀏覽器中進行。您的文字、檔案和中繼資料不會傳送至任何伺服器。',
      languageLabel: '選擇語言',
      continueBtn: '開始使用',
    },
    chapterList: {
      label: '章節列表',
      noChapters: '尚無章節',
    },
    shortcuts: {
      title: '鍵盤快捷鍵',
      closeTitle: '關閉',
      closeBtn: '關閉',
      groupGeneral: '一般',
      groupEditor: '編輯器',
      actionExport: '匯出 EPUB',
      actionSettings: '開啟 / 關閉設定',
      actionHelp: '顯示鍵盤快捷鍵',
      actionBold: '粗體',
      actionItalic: '斜體',
      actionIndent: '縮排 2 個空格',
    },
  },
};
