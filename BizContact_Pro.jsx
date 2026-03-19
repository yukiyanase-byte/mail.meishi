import { useState, useMemo, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// ⚙️  CONFIG — ここだけ編集すればカスタマイズ完了
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  version: "1.1.0",
  appName: "取引先情報管理",

  // ── Google ログイン ──────────────────────────────────────────
  // 1. https://console.cloud.google.com → 「APIとサービス」→「認証情報」
  // 2. 「認証情報を作成」→「OAuthクライアントID」→ 種別: ウェブアプリ
  // 3. 「承認済みのJavaScriptオリジン」に公開URL(例: https://yourname.github.io)を追加
  // 4. 発行されたクライアントIDを下に貼り付ける
  googleClientId: "50681596217-5t7e05ffbnm0g4dtcsg5uq2e2mqkj23d.apps.googleusercontent.com",

  // アクセスを許可するGoogleアカウントのメールアドレス（複数可）
  allowedEmails: [
    "yuki.yanase@moro-zaki.com",
    // "colleague@company.com",  ← 追加したい場合はここに追記してpush
  ],

  // ── マスターデータ（後から自由に追加・変更可） ────────────────
  members:    ["山田", "鈴木", "佐々木"],
  industries: ["IT", "商社", "金融", "デザイン", "医療", "教育", "製造", "その他"],
  tags:       ["重要", "パートナー", "見込み客", "協力会社", "経営層"],
  emailGroups:["重要顧客", "パートナー", "見込み客", "全連絡先"],
};
// ═══════════════════════════════════════════════════════════════

// ── サンプルデータ ──
const SAMPLE_CONTACTS = [
  { id:1, name:"田中 太郎", company:"株式会社テクノロジー", title:"営業部長", email:"tanaka@techco.jp", phone:"03-1234-5678", industry:"IT", tags:["重要","パートナー"], memo:"展示会で名刺交換。来月フォロー予定。", addedBy:"山田", date:"2026-02-10", followUp:"2026-03-15", address:"〒100-0001 東京都千代田区千代田1-1-1 テクノロジービル5F", emailGroup:["パートナー"], lastContacted:"2026-02-15" },
  { id:9, name:"田中 花子", company:"株式会社テクノロジー", title:"技術部 主任", email:"tanaka.h@techco.jp", phone:"03-1234-5679", industry:"IT", tags:["パートナー"], memo:"技術的な窓口担当。", addedBy:"山田", date:"2026-02-12", followUp:"", address:"〒100-0001 東京都千代田区千代田1-1-1 テクノロジービル5F", emailGroup:["パートナー"], lastContacted:null },
  { id:2, name:"佐藤 花子", company:"グローバル商事", title:"マーケティング部 課長", email:"sato@global.co.jp", phone:"06-9876-5432", industry:"商社", tags:["見込み客"], memo:"セミナーで出会い。デジタルマーケに興味あり。", addedBy:"鈴木", date:"2026-02-14", followUp:"", address:"〒530-0001 大阪府大阪市北区梅田2-2-2 グローバルタワー10F", emailGroup:["見込み客"], lastContacted:null },
  { id:3, name:"鈴木 一郎", company:"フィナンシャルグループ", title:"取締役CFO", email:"suzuki@fg.jp", phone:"03-5555-0001", industry:"金融", tags:["重要","経営層"], memo:"紹介経由。予算決裁権あり。", addedBy:"山田", date:"2026-01-28", followUp:"2026-03-20", address:"〒100-0005 東京都千代田区丸の内3-3-3 フィナンシャルセンター20F", emailGroup:["重要顧客"], lastContacted:"2026-02-20" },
  { id:10, name:"鈴木 太郎", company:"フィナンシャルグループ", title:"財務部長", email:"suzuki.t@fg.jp", phone:"03-5555-0002", industry:"金融", tags:["経営層"], memo:"CFOの部下。実務担当。", addedBy:"山田", date:"2026-02-01", followUp:"", address:"〒100-0005 東京都千代田区丸の内3-3-3 フィナンシャルセンター20F", emailGroup:["重要顧客"], lastContacted:"2026-02-25" },
  { id:4, name:"高橋 美咲", company:"クリエイティブスタジオ", title:"デザインディレクター", email:"takahashi@cs.jp", phone:"03-3333-4444", industry:"デザイン", tags:["協力会社"], memo:"UI/UXのコラボ検討中。", addedBy:"佐々木", date:"2026-02-20", followUp:"", address:"〒810-0001 福岡県福岡市中央区天神4-4-4 クリエイティブビル3F", emailGroup:["パートナー"], lastContacted:null },
  { id:5, name:"伊藤 健司", company:"メディカルソリューションズ", title:"事業開発部長", email:"ito@medical.co.jp", phone:"092-111-2222", industry:"医療", tags:["見込み客","パートナー"], memo:"病院向けDXに関心。提案資料送付済み。", addedBy:"鈴木", date:"2026-03-01", followUp:"2026-03-25", address:"〒812-0011 福岡県福岡市博多区博多駅前5-5-5 メディカルビル8F", emailGroup:["見込み客"], lastContacted:"2026-03-02" },
  { id:6, name:"渡辺 由美", company:"エデュテックジャパン", title:"CEO", email:"watanabe@edtech.jp", phone:"03-7777-8888", industry:"教育", tags:["経営層","重要"], memo:"カンファレンスで登壇後に名刺交換。", addedBy:"山田", date:"2026-03-05", followUp:"", address:"〒460-0002 愛知県名古屋市中区丸の内6-6-6 エデュタワー12F", emailGroup:["重要顧客"], lastContacted:null },
  { id:7, name:"中村 拓也", company:"ロジスティクスAI", title:"CTO", email:"nakamura@logai.jp", phone:"011-222-3333", industry:"IT", tags:["パートナー"], memo:"北海道のAI企業。物流DXで協業検討。", addedBy:"佐々木", date:"2026-01-15", followUp:"", address:"〒060-0001 北海道札幌市中央区北一条西7-7-7 AIビル4F", emailGroup:["パートナー"], lastContacted:"2026-02-01" },
  { id:8, name:"小林 さくら", company:"仙台リサーチ", title:"主任研究員", email:"kobayashi@sendai-r.jp", phone:"022-444-5555", industry:"医療", tags:["見込み客"], memo:"学会で出会い。研究費の相談あり。", addedBy:"鈴木", date:"2026-02-05", followUp:"", address:"〒980-0001 宮城県仙台市青葉区一番町8-8-8 リサーチセンター2F", emailGroup:["見込み客"], lastContacted:null },
];

// ── メールテンプレート ──
const EMAIL_TEMPLATES = [
  { id:1, name:"初回ご挨拶", subject:"はじめまして — [自社名]の[自分の名前]と申します",
    body:"[相手名] 様\n\nはじめまして。[自社名]の[自分の名前]と申します。\n\n先日は名刺交換の機会をいただきありがとうございました。\nぜひ一度お時間をいただければと思い、ご連絡いたしました。\n\nご都合のよろしい日時をお知らせいただけますでしょうか。\n\nどうぞよろしくお願いいたします。\n\n[自分の名前]\n[自社名]\n[連絡先]" },
  { id:2, name:"フォローアップ", subject:"先日のご連絡の件",
    body:"[相手名] 様\n\nお世話になっております。\n\n先日はお時間をいただきありがとうございました。\nご提案についてその後いかがでしょうか。\n\nご不明点などございましたらお気軽にご連絡ください。\n\nよろしくお願いいたします。" },
  { id:3, name:"商談アポイント", subject:"打ち合わせのご依頼",
    body:"[相手名] 様\n\nお世話になっております。\n\n下記日程でお打ち合わせの機会をいただけますでしょうか。\n\n・候補日時1\n・候補日時2\n・候補日時3\n\n場所はご指定いただければ伺います。\nよろしくお願いいたします。" },
  { id:4, name:"資料送付", subject:"資料をお送りします",
    body:"[相手名] 様\n\nお世話になっております。\n\n先日ご依頼いただきました資料をお送りします。\nご確認のほどよろしくお願いいたします。\n\nご不明点がございましたら、お気軽にご連絡ください。" },
  { id:5, name:"年始ご挨拶", subject:"新年のご挨拶",
    body:"[相手名] 様\n\n新年あけましておめでとうございます。\n旧年中は大変お世話になりました。\n\n本年も変わらぬご支援のほど、よろしくお願いいたします。" },
];

const EMAIL_GROUPS = CONFIG.emailGroups;
const MEMBERS     = CONFIG.members;
const INDUSTRIES  = CONFIG.industries;
const ALL_TAGS    = CONFIG.tags;
const VIEWS = ["ダッシュボード", "連絡先ツリー", "メール作成", "名刺スキャン", "スプレッドシート", "Google連携"];
const VIEW_ICONS = ["⊞", "🌲", "✉️", "📷", "📊", "🔗"];
const COMPANY_COLORS = ["#38bdf8","#818cf8","#34d399","#f59e0b","#f87171","#c084fc","#fb923c","#a3e635","#22d3ee","#e879f9"];

const APPS_SCRIPT_CODE = `// Google Apps Script — スプレッドシート自動同期 & 毎日バックアップ
// スプレッドシートのツール > スクリプトエディタに貼り付けてください
// ※ 初回のみ setupBackupTrigger() を手動実行してください（毎日22:00自動バックアップが有効になります）

// ── ユーザー管理シートのヘルパー ──
function getUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("許可ユーザー") || ss.insertSheet("許可ユーザー");
  if (sheet.getLastRow() === 0) sheet.appendRow(["メールアドレス"]);
  return sheet;
}

// ── 連絡先の書き込み（アプリ → Sheets）──
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = JSON.parse(e.postData.contents);

  // ユーザーリストの保存
  if (data.type === 'users') {
    const sheet = getUsersSheet();
    if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
    (data.users || []).forEach(email => sheet.appendRow([email]));
    return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = ss.getSheetByName("連絡先") || ss.insertSheet("連絡先");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID","名前","会社名","役職","メール","電話","業界",
                      "タグ","担当者","登録日","フォロー日","事務所住所","最終連絡","メモ"]);
  }
  if (sheet.getLastRow() > 1) sheet.deleteRows(2, sheet.getLastRow() - 1);
  data.contacts.forEach(c => {
    sheet.appendRow([c.id, c.name, c.company, c.title, c.email, c.phone,
                     c.industry, c.tags.join('/'), c.addedBy, c.date,
                     c.followUp||"", c.address||"", c.lastContacted||"", c.memo||""]);
  });
  return ContentService
    .createTextOutput(JSON.stringify({status:"ok", updated:data.contacts.length}))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── 連絡先の読み込み（Sheets → アプリ）──
function doGet(e) {
  // ユーザーリストの取得
  if (e.parameter.type === 'users') {
    const sheet = getUsersSheet();
    const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow()-1, 1).getValues() : [];
    const users = rows.map(r => r[0]).filter(v => v);
    return ContentService.createTextOutput(JSON.stringify({users})).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("連絡先");
  if (!sheet || sheet.getLastRow() <= 1)
    return ContentService.createTextOutput(JSON.stringify({contacts:[]}))
                         .setMimeType(ContentService.MimeType.JSON);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const contacts = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify({contacts}))
                       .setMimeType(ContentService.MimeType.JSON);
}

// ── 毎日バックアップ（自動実行）────────────────────────────────
function createDailyBackup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName("連絡先");
  if (!source) { Logger.log("「連絡先」シートが見つかりません"); return; }

  const today = new Date();
  const dateStr = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd');
  const backupName = 'バックアップ_' + dateStr;

  // 同日バックアップが既にあれば上書き
  const existing = ss.getSheetByName(backupName);
  if (existing) ss.deleteSheet(existing);

  // コピーを作成して末尾に移動
  const copy = source.copyTo(ss);
  copy.setName(backupName);
  ss.moveActiveSheet(ss.getSheets().length);

  // 30日以上古いバックアップを自動削除
  ss.getSheets().forEach(sheet => {
    const m = sheet.getName().match(/^バックアップ_(\d{4}-\d{2}-\d{2})$/);
    if (m) {
      const diff = (today - new Date(m[1])) / 86400000;
      if (diff > 30) ss.deleteSheet(sheet);
    }
  });

  Logger.log('バックアップ完了: ' + backupName);
}

// ── バックアップトリガーの登録（初回1回だけ手動実行）────────────
// Apps Scriptエディタで「実行」→「setupBackupTrigger」を選択して実行してください
function setupBackupTrigger() {
  // 既存の同名トリガーを削除（重複防止）
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'createDailyBackup') ScriptApp.deleteTrigger(t);
  });
  // 毎日22:00 JST に実行するトリガーを登録
  ScriptApp.newTrigger('createDailyBackup')
    .timeBased()
    .atHour(22)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create();
  Logger.log('✅ 毎日22:00のバックアップトリガーを設定しました');
}

// ── バックアップトリガーの削除（停止したいとき）────────────────
function removeBackupTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'createDailyBackup') ScriptApp.deleteTrigger(t);
  });
  Logger.log('バックアップトリガーを削除しました');
}`;

// ── ログイン画面 ──
function LoginScreen({ onLogin, extraAllowedEmails = [] }) {
  const [error, setError] = useState("");
  const [gsiReady, setGsiReady] = useState(false);
  const isDemoMode = CONFIG.googleClientId === "YOUR_CLIENT_ID.apps.googleusercontent.com";
  const allAllowed = [...CONFIG.allowedEmails, ...extraAllowedEmails].map(e => e.toLowerCase());

  useEffect(() => {
    if (isDemoMode) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: CONFIG.googleClientId,
        callback: (response) => {
          try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            if (allAllowed.includes(payload.email.toLowerCase())) {
              onLogin(payload);
            } else {
              setError(`${payload.email} はアクセス権限がありません。管理者に連絡してください。`);
            }
          } catch { setError("認証に失敗しました。もう一度お試しください。"); }
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById('gsi-btn'),
        { theme: 'outline', size: 'large', locale: 'ja', width: 280 }
      );
      setGsiReady(true);
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#e0f2fe 0%,#f1f5f9 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#ffffff",borderRadius:20,padding:"48px 40px",boxShadow:"0 8px 40px #0000001a",textAlign:"center",width:380,maxWidth:"100%"}}>
        <div style={{fontSize:52,marginBottom:12}}>📇</div>
        <h1 style={{fontSize:22,fontWeight:700,color:"#1e293b",marginBottom:6}}>{CONFIG.appName}</h1>
        <p style={{fontSize:13,color:"#94a3b8",marginBottom:32,lineHeight:1.6}}>Googleアカウントでログインしてください<br/>（許可されたアカウントのみ利用可能）</p>

        {isDemoMode ? (
          <div>
            <div style={{background:"#fef9c3",border:"1px solid #fde68a",borderRadius:10,padding:"12px 14px",marginBottom:24,fontSize:12,color:"#854d0e",textAlign:"left",lineHeight:1.8}}>
              ⚠️ <strong>セットアップ未完了</strong><br/>
              CONFIG の <code style={{background:"#fff8dc",padding:"1px 4px",borderRadius:3}}>googleClientId</code> と <code style={{background:"#fff8dc",padding:"1px 4px",borderRadius:3}}>allowedEmails</code> を設定してください。<br/>
              設定するまでは下のボタンでデモ確認できます。
            </div>
            <button
              onClick={() => onLogin({ name:"デモユーザー", email:"demo@example.com", picture:null })}
              style={{background:"#0ea5e9",color:"#fff",border:"none",borderRadius:10,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",transition:"opacity .15s"}}
              onMouseEnter={e=>e.target.style.opacity=.85} onMouseLeave={e=>e.target.style.opacity=1}>
              🔓 デモモードで確認する
            </button>
          </div>
        ) : (
          <div>
            <div id="gsi-btn" style={{display:"flex",justifyContent:"center",minHeight:44}}></div>
            {!gsiReady && <div style={{color:"#94a3b8",fontSize:12,marginTop:8}}>読み込み中...</div>}
            {error && (
              <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#ef4444",marginTop:16,textAlign:"left"}}>
                ⛔ {error}
              </div>
            )}
          </div>
        )}

        <div style={{marginTop:32,paddingTop:20,borderTop:"1px solid #f1f5f9",fontSize:11,color:"#cbd5e1"}}>
          v{CONFIG.version}
        </div>
      </div>
    </div>
  );
}

// ── メインコンポーネント ──
export default function App() {
  // ── 認証 ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bizcontact_user')); } catch { return null; }
  });
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('bizcontact_user', JSON.stringify(userData));
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bizcontact_user');
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch {}
  };

  const [view, setView] = useState(0);
  const [contacts, setContacts] = useState(SAMPLE_CONTACTS);

  // Tree state
  const [expandedCompanies, setExpandedCompanies] = useState(new Set(["株式会社テクノロジー", "フィナンシャルグループ"]));
  const [expandedPeople, setExpandedPeople] = useState(new Set());
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [treeSearch, setTreeSearch] = useState("");

  // Search / filter
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [sortCol, setSortCol] = useState("date");
  const [sortAsc, setSortAsc] = useState(false);

  // Compose state (lifted to App to avoid re-render issues)
  const [composeTo, setComposeTo] = useState([]);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeTemplateId, setComposeTemplateId] = useState(null);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);

  // Scan state
  const [scanStep, setScanStep] = useState(0);
  const [scanData, setScanData] = useState({ name:"", company:"", title:"", email:"", phone:"", industry:"IT", tags:[], memo:"", addedBy:"山田" });
  const [scanning, setScanning] = useState(false);

  // Sync state
  const [sheetsUrl, setSheetsUrl] = useState(() => localStorage.getItem('bizcontact_sheetsUrl') || "");
  const [lastSync, setLastSync] = useState(null);
  const [showScript, setShowScript] = useState(false);

  // ユーザー管理
  const [sheetsAllowedEmails, setSheetsAllowedEmails] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");

  // sheetsUrl を localStorage に保存
  useEffect(() => { localStorage.setItem('bizcontact_sheetsUrl', sheetsUrl); }, [sheetsUrl]);

  // Apps Script からユーザーリストを取得
  useEffect(() => {
    if (!sheetsUrl) return;
    fetch(`${sheetsUrl}?type=users`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.users)) setSheetsAllowedEmails(data.users); })
      .catch(() => {});
  }, [sheetsUrl]);

  // Company metadata (技能実習生・特定技能生受入フラグ)
  const [companyMeta, setCompanyMeta] = useState({});
  const [treeGinouFilter, setTreeGinouFilter] = useState("");

  // Edit modal
  const [editContact, setEditContact] = useState(null);

  // Notification
  const [notification, setNotification] = useState("");
  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 2500); };

  const csvFileRef = useRef(null);
  const syncFileRef = useRef(null);
  const vcfFileRef = useRef(null);

  // ── Filtered & sorted contacts ──
  const filtered = useMemo(() => {
    let r = contacts.filter(c => {
      const q = search.toLowerCase();
      const match = !q || c.name.includes(q) || c.company.includes(q) || c.title.includes(q) || c.email.includes(q);
      const tag = !filterTag || c.tags.includes(filterTag);
      const ind = !filterIndustry || c.industry === filterIndustry;
      return match && tag && ind;
    });
    return [...r].sort((a, b) => {
      const va = a[sortCol] || "", vb = b[sortCol] || "";
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [contacts, search, filterTag, filterIndustry, sortCol, sortAsc]);

  // ── Company tree ──
  const companyTree = useMemo(() => {
    const q = treeSearch.toLowerCase();
    const map = {};
    contacts.forEach(c => {
      if (!map[c.company]) map[c.company] = { company: c.company, industry: c.industry, people: [], color: "" };
      map[c.company].people.push(c);
    });
    const companies = Object.values(map);
    companies.forEach((comp, i) => { comp.color = COMPANY_COLORS[i % COMPANY_COLORS.length]; });
    if (!q) return companies.sort((a, b) => a.company.localeCompare(b.company));
    return companies.filter(comp =>
      comp.company.toLowerCase().includes(q) ||
      comp.people.some(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
    ).sort((a, b) => a.company.localeCompare(b.company));
  }, [contacts, treeSearch]);

  // ── Helpers ──
  const tagColor = (t) => ({ "重要":"#ef4444","パートナー":"#3b82f6","見込み客":"#10b981","協力会社":"#f59e0b","経営層":"#8b5cf6" }[t] || "#6b7280");

  const openGmail = (toEmails, subject = "", body = "") => {
    const to = Array.isArray(toEmails) ? toEmails.join(',') : toEmails;
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const composeToContact = (person, tmpl = null) => {
    const t = tmpl || EMAIL_TEMPLATES[0];
    setComposeTo([person]);
    setComposeSubject(t.subject);
    setComposeBody(t.body.replace(/\[相手名\]/g, person.name));
    setComposeTemplateId(t.id);
    setView(2);
  };

  const applyTemplate = (tmpl) => {
    setComposeTemplateId(tmpl.id);
    setComposeSubject(tmpl.subject);
    let body = tmpl.body;
    if (composeTo.length === 1) body = body.replace(/\[相手名\]/g, composeTo[0].name);
    setComposeBody(body);
  };

  const handleSend = () => {
    if (composeTo.length === 0) { notify("宛先を選択してください"); return; }
    openGmail(composeTo.map(c => c.email), composeSubject, composeBody);
    const today = new Date().toISOString().slice(0, 10);
    setContacts(prev => prev.map(c => composeTo.find(x => x.id === c.id) ? { ...c, lastContacted: today } : c));
    notify("✅ Gmailを開きました");
  };

  const deleteContact = (id) => { setContacts(c => c.filter(x => x.id !== id)); setEditContact(null); notify("削除しました"); };
  const saveEdit = () => { setContacts(c => c.map(x => x.id === editContact.id ? editContact : x)); setEditContact(null); notify("✅ 保存しました"); };

  const addContact = () => {
    const nc = { ...scanData, id: Date.now(), date: new Date().toISOString().slice(0, 10), followUp: "", address: "", emailGroup: [], lastContacted: null };
    setContacts(c => [nc, ...c]);
    setScanStep(0);
    setScanData({ name:"", company:"", title:"", email:"", phone:"", industry:"IT", tags:[], memo:"", addedBy:"山田" });
    notify("✅ 名刺を登録しました");
    setView(1);
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanData(d => ({ ...d, name:"山本 浩二", company:"株式会社イノベーション", title:"プロダクトマネージャー", email:"yamamoto@innov.co.jp", phone:"03-0000-9999", industry:"IT" }));
      setScanning(false); setScanStep(1);
    }, 2000);
  };

  const exportCSV = () => {
    const header = ["ID","名前","会社名","役職","メール","電話","業界","タグ","担当者","登録日","フォロー日","事務所住所","最終連絡","メモ"];
    const rows = contacts.map(c => [c.id, c.name, c.company, c.title, c.email, c.phone, c.industry, c.tags.join("/"), c.addedBy, c.date, c.followUp||"", c.address||"", c.lastContacted||"", c.memo||""]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const b = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "連絡先一覧.csv"; a.click();
    notify("✅ CSVをエクスポートしました");
  };

  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result.replace(/^\uFEFF/, '');
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      const newContacts = lines.slice(1).map((line, idx) => {
        const vals = line.match(/("(?:[^"]|"")*"|[^,]*)/g).map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
        const obj = {};
        headers.forEach((h, i) => obj[h] = vals[i] || '');
        return { id: Date.now() + idx, name: obj['名前']||'', company: obj['会社名']||'', title: obj['役職']||'', email: obj['メール']||'', phone: obj['電話']||'', industry: obj['業界']||'IT', tags: obj['タグ'] ? obj['タグ'].split('/') : [], addedBy: obj['担当者']||'', date: obj['登録日']||new Date().toISOString().slice(0,10), followUp: obj['フォロー日']||'', address: obj['事務所住所']||'', lastContacted: obj['最終連絡']||null, memo: obj['メモ']||'', emailGroup: [] };
      }).filter(c => c.name && c.email);
      setContacts(newContacts);
      setLastSync(new Date().toLocaleString('ja-JP'));
      notify(`✅ ${newContacts.length}件インポートしました`);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const exportVCard = () => {
    const vcards = contacts.map(c =>
      `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nORG:${c.company}\nTITLE:${c.title}\nEMAIL:${c.email}\nTEL:${c.phone}\nADR:;;${c.address||''};;;;\nNOTE:${c.memo||''}\nEND:VCARD`
    ).join('\n\n');
    const b = new Blob([vcards], { type: 'text/vcard' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = '連絡先.vcf'; a.click();
    notify("✅ vCardを出力しました");
  };

  const importVCard = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      // Unfold multi-line values (CRLF/LF followed by space or tab)
      const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
      const cards = unfolded.split(/BEGIN:VCARD/i).filter(c => c.trim());
      const imported = cards.map((card, idx) => {
        const get = (key) => {
          const re = new RegExp(`^${key}[^:\\r\\n]*:(.+)$`, 'im');
          const m = card.match(re);
          return m ? m[1].replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\r/g, '').trim() : '';
        };
        const emailMatch = card.match(/^EMAIL[^:\r\n]*:(.+)$/im);
        const email = emailMatch ? emailMatch[1].replace(/\r/g, '').trim() : '';
        const telMatch = card.match(/^TEL[^:\r\n]*:(.+)$/im);
        const phone = telMatch ? telMatch[1].replace(/\r/g, '').trim() : '';
        const adrMatch = card.match(/^ADR[^:\r\n]*:(.+)$/im);
        let address = '';
        if (adrMatch) {
          const parts = adrMatch[1].replace(/\r/g, '').split(';');
          address = parts.filter(p => p.trim()).join(' ').trim();
        }
        const name = get('FN');
        const company = get('ORG').split(';')[0];
        const title = get('TITLE');
        const note = get('NOTE');
        return {
          id: Date.now() + idx,
          name, company, title, email, phone,
          industry: 'IT', tags: [], addedBy: '山田',
          date: new Date().toISOString().slice(0, 10),
          followUp: '', address,
          lastContacted: null, memo: note, emailGroup: []
        };
      }).filter(c => c.name && c.email);

      if (imported.length === 0) {
        notify("⚠️ インポート可能なデータが見つかりません");
        return;
      }
      setContacts(prev => {
        const existingEmails = new Set(prev.map(c => c.email));
        const newOnes = imported.filter(c => !existingEmails.has(c.email));
        notify(`✅ ${newOnes.length}件を追加しました（重複${imported.length - newOnes.length}件スキップ）`);
        return [...prev, ...newOnes];
      });
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const isAdmin = user && CONFIG.allowedEmails.map(e => e.toLowerCase()).includes(user.email.toLowerCase());

  const addAllowedUser = () => {
    const email = newUserEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) { notify("正しいメールアドレスを入力してください"); return; }
    if (!sheetsUrl) { notify("先にApps Script URLを設定・保存してください"); return; }
    if (sheetsAllowedEmails.includes(email)) { notify("すでに追加されています"); return; }
    const updated = [...sheetsAllowedEmails, email];
    fetch(sheetsUrl, { method:'POST', body: JSON.stringify({ type:'users', users: updated }), headers:{'Content-Type':'application/json'} })
      .then(() => { setSheetsAllowedEmails(updated); setNewUserEmail(""); notify(`✅ ${email} を追加しました`); })
      .catch(() => { setSheetsAllowedEmails(updated); setNewUserEmail(""); notify(`✅ ${email} を追加しました`); });
  };

  const removeAllowedUser = (email) => {
    const updated = sheetsAllowedEmails.filter(e => e !== email);
    if (!sheetsUrl) { setSheetsAllowedEmails(updated); return; }
    fetch(sheetsUrl, { method:'POST', body: JSON.stringify({ type:'users', users: updated }), headers:{'Content-Type':'application/json'} })
      .then(() => { setSheetsAllowedEmails(updated); notify(`✅ ${email} を削除しました`); })
      .catch(() => { setSheetsAllowedEmails(updated); notify(`✅ ${email} を削除しました`); });
  };

  const syncToSheets = () => {
    if (!sheetsUrl) { notify("Apps Script URLを入力してください"); return; }
    notify("⏳ 同期中...");
    fetch(sheetsUrl, { method: 'POST', body: JSON.stringify({ contacts }), headers: { 'Content-Type': 'application/json' } })
      .then(() => { setLastSync(new Date().toLocaleString('ja-JP')); notify("✅ Google Sheetsと同期しました"); })
      .catch(() => { setLastSync(new Date().toLocaleString('ja-JP')); notify("✅ 同期しました（デモ）"); });
  };

  const toggleSort = (col) => { if (sortCol === col) { setSortAsc(a => !a); } else { setSortCol(col); setSortAsc(true); } };

  const toggleCompany = (company) => {
    setExpandedCompanies(prev => { const next = new Set(prev); if (next.has(company)) next.delete(company); else next.add(company); return next; });
  };
  const togglePerson = (id) => {
    setExpandedPeople(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectContact = (c) => {
    setSelectedContacts(prev => prev.find(x => x.id === c.id) ? prev.filter(x => x.id !== c.id) : [...prev, c]);
  };

  const getCompanyMeta = (company) => companyMeta[company] || { ginouJisshu: false, tokuteiGino: false };
  const toggleCompanyMeta = (company, field) => {
    setCompanyMeta(prev => {
      const cur = prev[company] || { ginouJisshu: false, tokuteiGino: false };
      return { ...prev, [company]: { ...cur, [field]: !cur[field] } };
    });
  };

  // ── STYLES (ライトテーマ) ──
  const s = {
    app: { fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#f1f5f9", minHeight:"100vh", color:"#1e293b", display:"flex", flexDirection:"column" },
    header: { background:"#ffffff", borderBottom:"1px solid #e2e8f0", padding:"0 24px", display:"flex", alignItems:"center", gap:16, height:56, position:"sticky", top:0, zIndex:50, flexShrink:0, boxShadow:"0 1px 4px #0000000a" },
    logo: { fontSize:19, fontWeight:700, color:"#0ea5e9", letterSpacing:"-0.5px", whiteSpace:"nowrap" },
    nav: { display:"flex", gap:3, marginLeft:"auto", flexWrap:"wrap" },
    navBtn: (a) => ({ background:a?"#0ea5e9":"transparent", color:a?"#fff":"#64748b", border:a?"none":"none", padding:"6px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:a?600:400, transition:"all .15s", whiteSpace:"nowrap" }),
    main: { flex:1, padding:24, maxWidth:1400, margin:"0 auto", width:"100%", boxSizing:"border-box" },
    card: { background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:20, marginBottom:16, boxShadow:"0 1px 3px #0000000a" },
    grid3: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 },
    stat: { background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:20, textAlign:"center", boxShadow:"0 1px 3px #0000000a" },
    statNum: { fontSize:30, fontWeight:700, color:"#0ea5e9" },
    statLabel: { fontSize:12, color:"#94a3b8", marginTop:4 },
    tag: (t) => ({ background:tagColor(t)+"18", color:tagColor(t), border:`1px solid ${tagColor(t)}40`, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, display:"inline-block" }),
    btn: (v="primary") => ({ background:v==="primary"?"#0ea5e9":v==="danger"?"#fef2f2":v==="ghost"?"transparent":"#eff6ff", color:v==="danger"?"#ef4444":v==="ghost"?"#64748b":v==="primary"?"#fff":"#0369a1", border:v==="danger"?"1px solid #fecaca":v==="ghost"?"1px solid #e2e8f0":"none", padding:"7px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .15s", textDecoration:"none", display:"inline-block" }),
    iconBtn: { background:"#f8fafc", border:"1px solid #e2e8f0", color:"#64748b", padding:"4px 9px", borderRadius:6, cursor:"pointer", fontSize:12 },
    input: { background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 12px", color:"#1e293b", fontSize:13, width:"100%", boxSizing:"border-box" },
    label: { fontSize:12, color:"#64748b", marginBottom:4, display:"block" },
    badge: (color="#0ea5e9") => ({ background:color+"18", color:color, border:`1px solid ${color}40`, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600 }),
    notification: { position:"fixed", top:70, right:20, background:"#10b981", color:"#fff", padding:"10px 20px", borderRadius:8, fontWeight:600, fontSize:13, zIndex:999, boxShadow:"0 4px 12px #0003", animation:"fadeIn .2s" },
    th: (col) => ({ padding:"10px 12px", textAlign:"left", fontSize:12, color:"#64748b", cursor:"pointer", userSelect:"none", borderBottom:"1px solid #e2e8f0", whiteSpace:"nowrap", background:sortCol===col?"#e0f2fe":"#f8fafc" }),
    td: { padding:"9px 12px", fontSize:13, borderBottom:"1px solid #f1f5f9", verticalAlign:"middle" },
  };

  // ── VIEW: DASHBOARD ──
  const Dashboard = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const overdue = contacts.filter(c => c.followUp && c.followUp < todayStr);
    const upcoming = contacts.filter(c => c.followUp && c.followUp >= todayStr);
    const recentlyAdded = [...contacts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    const industryCount = {};
    contacts.forEach(c => { industryCount[c.industry] = (industryCount[c.industry] || 0) + 1; });
    const topIndustries = Object.entries(industryCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxInd = Math.max(...topIndustries.map(x => x[1]), 1);
    const colors = ["#38bdf8","#818cf8","#34d399","#f59e0b","#f87171"];
    return (
      <div>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:20,color:"#1e293b"}}>ダッシュボード</h2>
        <div style={s.grid3}>
          <div style={s.stat}><div style={s.statNum}>{contacts.length}</div><div style={s.statLabel}>総連絡先数</div></div>
          <div style={{...s.stat, borderColor:overdue.length?"#fca5a5":"#e2e8f0"}}>
            <div style={{...s.statNum, color:overdue.length?"#ef4444":"#0ea5e9"}}>{overdue.length}</div>
            <div style={s.statLabel}>期限超過フォロー</div>
          </div>
          <div style={s.stat}><div style={s.statNum}>{[...new Set(contacts.map(c=>c.company))].length}</div><div style={s.statLabel}>取引企業数</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          <div style={s.card}>
            <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12}}>最近追加した連絡先</h3>
            {recentlyAdded.map(c => (
              <div key={c.id} onClick={() => { setView(1); }} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f1f5f9",cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",color:"#0ea5e9",fontSize:13,fontWeight:700,flexShrink:0}}>{c.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company}</div>
                </div>
                <div style={{fontSize:11,color:"#94a3b8",flexShrink:0}}>{c.date}</div>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12}}>フォローアップ</h3>
            {overdue.length > 0 && (
              <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:6,padding:"5px 10px",marginBottom:8,fontSize:11,color:"#ef4444"}}>
                ⚠️ 期限超過 {overdue.length}件
              </div>
            )}
            {[...overdue, ...upcoming].slice(0, 5).map(c => (
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #f1f5f9"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:c.followUp<todayStr?"#ef4444":"#f59e0b",flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.company}</div>
                </div>
                <div style={{fontSize:11,color:c.followUp<todayStr?"#ef4444":"#f59e0b",fontWeight:600,flexShrink:0}}>{c.followUp}</div>
                <button onClick={() => composeToContact(c)} style={{...s.btn(),padding:"3px 8px",fontSize:11,flexShrink:0}}>✉️</button>
              </div>
            ))}
          </div>
          <div style={s.card}>
            <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12}}>業界分布</h3>
            {topIndustries.map(([ind, cnt], i) => (
              <div key={ind} style={{marginBottom:9}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:12,color:"#1e293b"}}>{ind}</span>
                  <span style={{fontSize:12,color:colors[i],fontWeight:600}}>{cnt}件</span>
                </div>
                <div style={{background:"#f1f5f9",borderRadius:4,height:6}}>
                  <div style={{width:`${(cnt/maxInd)*100}%`,height:"100%",background:colors[i],borderRadius:4}}/>
                </div>
              </div>
            ))}
            <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #f1f5f9",display:"flex",gap:8}}>
              <button style={{...s.btn(),fontSize:11}} onClick={() => setView(2)}>✉️ メール作成</button>
              <button style={{...s.btn("ghost"),fontSize:11}} onClick={exportCSV}>⬇ CSV出力</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── VIEW: CONTACT TREE ──
  const ContactTree = () => (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <h2 style={{fontSize:20,fontWeight:700,color:"#1e293b",margin:0}}>🌲 連絡先ツリー</h2>
        {selectedContacts.length > 0 ? (
          <div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto",flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"#0ea5e9",fontWeight:600}}>{selectedContacts.length}件選択中</span>
            <button style={s.btn()} onClick={() => openGmail(selectedContacts.map(c=>c.email), "", "")}>
              ✉️ {selectedContacts.length}件にGmailで送信
            </button>
            <button style={{...s.btn("ghost"),fontSize:12}} onClick={() => { setComposeTo(selectedContacts); setView(2); }}>
              テンプレートで作成
            </button>
            <button style={{...s.btn("ghost"),fontSize:12}} onClick={() => setSelectedContacts([])}>✕ 選択解除</button>
          </div>
        ) : (
          <button style={{...s.btn("secondary"),marginLeft:"auto",fontSize:12}} onClick={() => setView(3)}>＋ 名刺追加</button>
        )}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <input style={{...s.input,maxWidth:300}} placeholder="🔍 会社名・名前・メールで検索" value={treeSearch} onChange={e => setTreeSearch(e.target.value)} />
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <button
            onClick={() => setTreeGinouFilter(f => f==="ginouJisshu" ? "" : "ginouJisshu")}
            style={{background:treeGinouFilter==="ginouJisshu"?"#d1fae5":"#f8fafc",color:treeGinouFilter==="ginouJisshu"?"#059669":"#64748b",border:treeGinouFilter==="ginouJisshu"?"1px solid #6ee7b7":"1px solid #e2e8f0",borderRadius:6,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
            🎓 技能実習生受入
          </button>
          <button
            onClick={() => setTreeGinouFilter(f => f==="tokuteiGino" ? "" : "tokuteiGino")}
            style={{background:treeGinouFilter==="tokuteiGino"?"#dbeafe":"#f8fafc",color:treeGinouFilter==="tokuteiGino"?"#1d4ed8":"#64748b",border:treeGinouFilter==="tokuteiGino"?"1px solid #93c5fd":"1px solid #e2e8f0",borderRadius:6,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer"}}>
            🏅 特定技能生受入
          </button>
        </div>
        <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
          <button style={{...s.btn("ghost"),fontSize:12}} onClick={() => setExpandedCompanies(new Set(companyTree.map(c=>c.company)))}>
            ▼ 全て展開
          </button>
          <button style={{...s.btn("ghost"),fontSize:12}} onClick={() => { setExpandedCompanies(new Set()); setExpandedPeople(new Set()); }}>
            ▶ 全て閉じる
          </button>
        </div>
      </div>

      {(treeGinouFilter ? companyTree.filter(comp => getCompanyMeta(comp.company)[treeGinouFilter]) : companyTree).map((comp) => {
        const expanded = expandedCompanies.has(comp.company);
        const allSelected = comp.people.every(p => selectedContacts.find(x => x.id === p.id));
        const meta = getCompanyMeta(comp.company);
        return (
          <div key={comp.company} style={{background:"#ffffff",border:`1px solid ${expanded?comp.color+"66":"#e2e8f0"}`,borderRadius:10,marginBottom:8,overflow:"hidden",transition:"border .2s",boxShadow:"0 1px 3px #0000000a"}}>
            {/* 会社ヘッダー */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer",background:expanded?`${comp.color}08`:"#fafafa"}}
              onClick={() => toggleCompany(comp.company)}>
              <input type="checkbox" checked={allSelected}
                onChange={e => { e.stopPropagation(); if (allSelected) { setSelectedContacts(prev => prev.filter(x => !comp.people.find(p => p.id===x.id))); } else { setSelectedContacts(prev => { const ex = new Set(prev.map(x=>x.id)); return [...prev, ...comp.people.filter(p=>!ex.has(p.id))]; }); } }}
                onClick={e => e.stopPropagation()} style={{cursor:"pointer",flexShrink:0}} />
              <div style={{width:36,height:36,borderRadius:8,background:`${comp.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,border:`1px solid ${comp.color}30`}}>🏢</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{comp.company}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginTop:3}}>
                  <span style={{fontSize:11,color:"#64748b"}}>{comp.industry} · <span style={{color:comp.color,fontWeight:600}}>{comp.people.length}名</span></span>
                  <button onClick={e => { e.stopPropagation(); toggleCompanyMeta(comp.company, 'ginouJisshu'); }}
                    style={{background:meta.ginouJisshu?"#d1fae5":"#f1f5f9",color:meta.ginouJisshu?"#059669":"#94a3b8",border:meta.ginouJisshu?"1px solid #6ee7b7":"1px solid #e2e8f0",borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600,cursor:"pointer",flexShrink:0}}>
                    🎓 技能実習生 {meta.ginouJisshu ? "✓" : "—"}
                  </button>
                  <button onClick={e => { e.stopPropagation(); toggleCompanyMeta(comp.company, 'tokuteiGino'); }}
                    style={{background:meta.tokuteiGino?"#dbeafe":"#f1f5f9",color:meta.tokuteiGino?"#1d4ed8":"#94a3b8",border:meta.tokuteiGino?"1px solid #93c5fd":"1px solid #e2e8f0",borderRadius:4,padding:"1px 8px",fontSize:10,fontWeight:600,cursor:"pointer",flexShrink:0}}>
                    🏅 特定技能生 {meta.tokuteiGino ? "✓" : "—"}
                  </button>
                </div>
              </div>
              <button style={{...s.btn(),padding:"4px 10px",fontSize:11,flexShrink:0}} onClick={e => { e.stopPropagation(); openGmail(comp.people.map(p=>p.email).join(',')); }}>
                ✉️ 全員にメール
              </button>
              <span style={{color:comp.color,fontSize:14,transform:expanded?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",flexShrink:0}}>▶</span>
            </div>

            {/* 担当者一覧 */}
            {expanded && comp.people.map(person => {
              const pExpanded = expandedPeople.has(person.id);
              const isSelected = !!selectedContacts.find(x => x.id === person.id);
              return (
                <div key={person.id} style={{borderTop:"1px solid #f1f5f9"}}>
                  {/* 人物行 */}
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px 9px 52px",cursor:"pointer",background:pExpanded?"#f0f9ff":"#ffffff",transition:"background .1s"}}
                    onClick={() => togglePerson(person.id)}>
                    <input type="checkbox" checked={isSelected} onChange={e => { e.stopPropagation(); toggleSelectContact(person); }} onClick={e => e.stopPropagation()} style={{cursor:"pointer",flexShrink:0}} />
                    <div style={{width:30,height:30,borderRadius:"50%",background:`${comp.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:comp.color,fontSize:13,fontWeight:700,flexShrink:0}}>{person.name[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{person.name}</div>
                      <div style={{fontSize:11,color:"#64748b",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{person.title}</div>
                    </div>
                    <div style={{fontSize:12,color:"#0ea5e9",flexShrink:0,marginRight:8}}>{person.email}</div>
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                      <button style={s.iconBtn} title="メールアドレスをコピー" onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(person.email); notify("📋 コピーしました: " + person.email); }}>📋</button>
                      <button style={{...s.btn(),padding:"3px 10px",fontSize:11}} onClick={e => { e.stopPropagation(); composeToContact(person); }}>✉️</button>
                      <button style={s.iconBtn} onClick={e => { e.stopPropagation(); setEditContact({...person}); }}>✏️</button>
                    </div>
                    <span style={{color:"#cbd5e1",fontSize:12,transform:pExpanded?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",marginLeft:4,flexShrink:0}}>▶</span>
                  </div>

                  {/* 詳細展開 */}
                  {pExpanded && (
                    <div style={{padding:"14px 16px 14px 82px",background:"#f8fafc",borderTop:"1px solid #e2e8f0"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                        <div>
                          <div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>📧 メールアドレス</div>
                          <a href={`mailto:${person.email}`} style={{fontSize:12,color:"#0ea5e9",textDecoration:"none"}}>{person.email}</a>
                        </div>
                        <div>
                          <div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>📞 電話番号</div>
                          <div style={{fontSize:12,color:"#475569"}}>{person.phone}</div>
                        </div>
                        {person.address && <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>📍 事務所住所</div><div style={{fontSize:12,color:"#475569"}}>{person.address}</div></div>}
                        {person.followUp && <div><div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>🔔 フォロー日</div><div style={{fontSize:12,color:"#f59e0b",fontWeight:600}}>{person.followUp}</div></div>}
                        {person.lastContacted && <div><div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>📅 最終連絡</div><div style={{fontSize:12,color:"#475569"}}>{person.lastContacted}</div></div>}
                        <div><div style={{fontSize:10,color:"#94a3b8",marginBottom:2}}>👤 担当者</div><div style={{fontSize:12,color:"#475569"}}>{person.addedBy}</div></div>
                      </div>
                      {person.tags.length > 0 && (
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                          {person.tags.map(t => <span key={t} style={s.tag(t)}>{t}</span>)}
                        </div>
                      )}
                      {person.memo && (
                        <div style={{fontSize:12,color:"#475569",background:"#ffffff",padding:"8px 10px",borderRadius:6,marginBottom:10,border:"1px solid #e2e8f0"}}>💬 {person.memo}</div>
                      )}
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                        <span style={{fontSize:11,color:"#94a3b8",alignSelf:"center"}}>テンプレート:</span>
                        {EMAIL_TEMPLATES.slice(0, 3).map(tmpl => (
                          <button key={tmpl.id} style={{...s.btn("ghost"),padding:"3px 10px",fontSize:11}} onClick={() => composeToContact(person, tmpl)}>{tmpl.name}</button>
                        ))}
                        <button style={{...s.btn("danger"),padding:"4px 10px",fontSize:11,marginLeft:"auto"}} onClick={() => deleteContact(person.id)}>削除</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {(treeGinouFilter ? companyTree.filter(comp => getCompanyMeta(comp.company)[treeGinouFilter]) : companyTree).length === 0 && (
        <div style={{textAlign:"center",padding:60,color:"#94a3b8"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔍</div>
          <div>{treeGinouFilter ? `「${treeGinouFilter==="ginouJisshu"?"技能実習生受入":"特定技能生受入"}」の企業が見つかりません` : `「${treeSearch}」に一致する連絡先が見つかりません`}</div>
        </div>
      )}
    </div>
  );

  // ── VIEW: COMPOSE ──
  const ComposeView = () => {
    const recipientFiltered = contacts.filter(c => {
      const q = recipientSearch.toLowerCase();
      return (!q || c.name.includes(q) || c.company.includes(q) || c.email.includes(q)) && !composeTo.find(x => x.id === c.id);
    });
    return (
      <div style={{maxWidth:740}}>
        <h2 style={{fontSize:20,fontWeight:700,marginBottom:20,color:"#1e293b"}}>✉️ メール作成</h2>

        {/* テンプレート選択 */}
        <div style={s.card}>
          <h3 style={{fontSize:13,fontWeight:600,color:"#64748b",marginBottom:10}}>テンプレートを選択</h3>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {EMAIL_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                style={{background:composeTemplateId===t.id?"#0ea5e9":"#f8fafc",color:composeTemplateId===t.id?"#fff":"#475569",border:`1px solid ${composeTemplateId===t.id?"#0ea5e9":"#e2e8f0"}`,padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12,transition:"all .15s"}}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* 作成フォーム */}
        <div style={s.card}>
          {/* 宛先 */}
          <div style={{marginBottom:14}}>
            <label style={s.label}>宛先</label>
            <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 10px",minHeight:44,position:"relative"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
                {composeTo.map(c => (
                  <span key={c.id} style={{background:"#e0f2fe",color:"#0369a1",border:"1px solid #bae6fd",borderRadius:4,padding:"3px 8px",fontSize:12,display:"flex",alignItems:"center",gap:4}}>
                    {c.name}&nbsp;<span style={{fontSize:10,opacity:.7}}>&lt;{c.email}&gt;</span>
                    <span onClick={() => setComposeTo(prev => prev.filter(x => x.id !== c.id))} style={{cursor:"pointer",opacity:.5,fontSize:14,marginLeft:2}}>✕</span>
                  </span>
                ))}
                <input style={{background:"transparent",border:"none",outline:"none",color:"#1e293b",fontSize:13,flex:1,minWidth:140}}
                  placeholder="＋ 宛先を追加..."
                  value={recipientSearch}
                  onChange={e => { setRecipientSearch(e.target.value); setShowRecipientPicker(true); }}
                  onFocus={() => setShowRecipientPicker(true)}
                  onBlur={() => setTimeout(() => setShowRecipientPicker(false), 150)} />
              </div>
            </div>
            {showRecipientPicker && recipientSearch && recipientFiltered.length > 0 && (
              <div style={{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:8,marginTop:4,maxHeight:180,overflowY:"auto",zIndex:20,position:"relative",boxShadow:"0 4px 12px #0000001a"}}>
                {recipientFiltered.slice(0, 8).map(c => (
                  <div key={c.id} onMouseDown={() => { setComposeTo(prev => [...prev, c]); setRecipientSearch(""); setShowRecipientPicker(false); }}
                    style={{padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #f1f5f9"}}
                    onMouseEnter={e => e.currentTarget.style.background="#f0f9ff"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",color:"#0ea5e9",fontSize:12,fontWeight:700}}>{c.name[0]}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{c.name}</div>
                      <div style={{fontSize:11,color:"#64748b"}}>{c.email} · {c.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#94a3b8"}}>グループ一括追加:</span>
              {EMAIL_GROUPS.map(g => (
                <button key={g} onClick={() => {
                  const gc = g === "全連絡先" ? contacts : contacts.filter(c => c.emailGroup?.includes(g) || c.tags.includes(g));
                  setComposeTo(prev => { const ex = new Set(prev.map(x => x.id)); return [...prev, ...gc.filter(c => !ex.has(c.id))]; });
                }} style={{...s.btn("ghost"),padding:"3px 10px",fontSize:11}}>{g}</button>
              ))}
            </div>
          </div>

          {/* 件名 */}
          <div style={{marginBottom:14}}>
            <label style={s.label}>件名</label>
            <input style={s.input} value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="件名を入力..." />
          </div>

          {/* 本文 */}
          <div style={{marginBottom:16}}>
            <label style={s.label}>本文</label>
            <textarea style={{...s.input,height:200,resize:"vertical",fontFamily:"inherit",lineHeight:1.8}}
              value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="メール本文を入力..." />
          </div>

          {/* 送信ボタン */}
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <button style={{...s.btn(),padding:"10px 24px",fontSize:14}} onClick={handleSend}>
              📤 Gmailで開く {composeTo.length > 0 && `(${composeTo.length}件)`}
            </button>
            <a href={`mailto:${composeTo.map(c=>c.email).join(',')}?subject=${encodeURIComponent(composeSubject)}&body=${encodeURIComponent(composeBody)}`}
              style={{...s.btn("secondary"),padding:"10px 16px",fontSize:12}}>
              📧 メールアプリで開く
            </a>
            <button style={{...s.btn("ghost"),fontSize:12}} onClick={() => { setComposeTo([]); setComposeSubject(""); setComposeBody(""); setComposeTemplateId(null); }}>クリア</button>
          </div>
        </div>

        {/* プレビュー */}
        {(composeSubject || composeBody) && (
          <div style={s.card}>
            <h3 style={{fontSize:13,fontWeight:600,color:"#64748b",marginBottom:10}}>プレビュー</h3>
            <div style={{background:"#f8fafc",borderRadius:8,padding:16,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>宛先: <span style={{color:"#0ea5e9"}}>{composeTo.map(c=>c.email).join(', ') || '—'}</span></div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>件名: <span style={{color:"#1e293b",fontWeight:600}}>{composeSubject || '—'}</span></div>
              <div style={{fontSize:13,color:"#475569",whiteSpace:"pre-wrap",lineHeight:1.8}}>{composeBody || '—'}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── VIEW: SCAN ──
  const ScanView = () => (
    <div style={{maxWidth:560}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:20,color:"#1e293b"}}>📷 名刺スキャン・登録</h2>
      {scanStep === 0 && (
        <div style={s.card}>
          <div style={{background:"#f8fafc",border:"2px dashed #e2e8f0",borderRadius:12,padding:48,textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:48,marginBottom:12}}>📇</div>
            <div style={{color:"#64748b",marginBottom:16,fontSize:14}}>名刺画像をアップロード、またはデモスキャンを試す</div>
            <button style={s.btn()} onClick={simulateScan} disabled={scanning}>{scanning ? "🔄 読み取り中..." : "✨ デモスキャン実行"}</button>
          </div>
          {scanning && <div style={{textAlign:"center",color:"#0ea5e9",fontSize:13}}>AIが名刺情報を解析中...</div>}
        </div>
      )}
      {scanStep === 1 && (
        <div style={s.card}>
          <h3 style={{fontSize:14,fontWeight:600,color:"#94a3b8",marginBottom:16}}>✅ 読み取り結果を確認・編集</h3>
          {[["name","名前"],["company","会社名"],["title","役職"],["email","メール"],["phone","電話"]].map(([k,l]) => (
            <div key={k} style={{marginBottom:12}}>
              <label style={s.label}>{l}</label>
              <input style={s.input} value={scanData[k]} onChange={e => setScanData(d => ({...d,[k]:e.target.value}))} />
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <label style={s.label}>業界</label>
            <select style={s.input} value={scanData.industry} onChange={e => setScanData(d => ({...d,industry:e.target.value}))}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div style={{marginBottom:12}}>
            <label style={s.label}>タグ</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {ALL_TAGS.map(t => (
                <button key={t} onClick={() => setScanData(d => ({...d,tags:d.tags.includes(t)?d.tags.filter(x=>x!==t):[...d.tags,t]}))}
                  style={{...s.tag(t),cursor:"pointer",opacity:scanData.tags.includes(t)?1:0.35,border:`1px solid ${tagColor(t)}`}}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={s.label}>メモ</label>
            <textarea style={{...s.input,height:72,resize:"vertical"}} value={scanData.memo} onChange={e => setScanData(d => ({...d,memo:e.target.value}))} />
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={s.btn()} onClick={addContact}>💾 登録する</button>
            <button style={{...s.btn("ghost")}} onClick={() => setScanStep(0)}>戻る</button>
          </div>
        </div>
      )}
    </div>
  );

  // ── VIEW: SPREADSHEET ──
  const SpreadsheetView = () => {
    const cols = [
      {key:"name",label:"名前"},{key:"company",label:"会社名"},{key:"title",label:"役職"},
      {key:"email",label:"メール"},{key:"phone",label:"電話"},{key:"industry",label:"業界"},
      {key:"addedBy",label:"担当者"},{key:"date",label:"登録日"},{key:"followUp",label:"フォロー日"},
    ];
    const sortIcon = col => sortCol===col?(sortAsc?"▲":"▼"):"⇅";
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <h2 style={{fontSize:20,fontWeight:700,color:"#1e293b",margin:0}}>📊 スプレッドシート</h2>
          <div style={{display:"flex",gap:8,marginLeft:"auto",flexWrap:"wrap"}}>
            <button style={{...s.btn("ghost"),fontSize:12}} onClick={exportCSV}>⬇ CSV出力</button>
            <label style={{...s.btn("ghost"),fontSize:12,cursor:"pointer"}}>
              ⬆ CSV取込 <input type="file" accept=".csv" ref={csvFileRef} onChange={importCSV} style={{display:"none"}} />
            </label>
            <button style={{...s.btn(),fontSize:12}} onClick={() => setView(5)}>🔗 Sheets同期設定</button>
          </div>
        </div>
        {/* フィルター */}
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
          <input style={{...s.input,maxWidth:280}} placeholder="🔍 名前・会社・メールで検索" value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{...s.input,width:120}} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="">タグ: 全て</option>
            {ALL_TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select style={{...s.input,width:120}} value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
            <option value="">業界: 全て</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
          <span style={{color:"#64748b",fontSize:13,marginLeft:"auto"}}>{filtered.length}件</span>
        </div>

        <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 1px 3px #0000000a"}}>
          <table style={{width:"100%",borderCollapse:"collapse",background:"#ffffff",fontSize:13}}>
            <thead>
              <tr>
                <th style={{...s.th(""),width:36,textAlign:"center"}}>#</th>
                {cols.map(c => (
                  <th key={c.key} style={s.th(c.key)} onClick={() => toggleSort(c.key)}>{c.label} {sortIcon(c.key)}</th>
                ))}
                <th style={{...s.th(""),textAlign:"center"}}>タグ</th>
                <th style={{...s.th(""),textAlign:"center"}}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{background:i%2===0?"#ffffff":"#f8fafc"}}
                  onMouseEnter={e => e.currentTarget.style.background="#f0f9ff"}
                  onMouseLeave={e => e.currentTarget.style.background=i%2===0?"#ffffff":"#f8fafc"}>
                  <td style={{...s.td,textAlign:"center",color:"#94a3b8"}}>{i+1}</td>
                  {cols.map(col => (
                    <td key={col.key} style={{...s.td,
                      color:col.key==="name"?"#1e293b":col.key==="email"?"#0ea5e9":col.key==="followUp"&&c[col.key]?"#f59e0b":"#475569",
                      fontWeight:col.key==="name"?600:400}}>
                      {col.key==="email" ? <a href={`mailto:${c.email}`} style={{color:"#0ea5e9",textDecoration:"none"}}>{c.email}</a> : c[col.key]||<span style={{color:"#cbd5e1"}}>—</span>}
                    </td>
                  ))}
                  <td style={s.td}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{c.tags.map(t=><span key={t} style={s.tag(t)}>{t}</span>)}</div></td>
                  <td style={{...s.td,textAlign:"center"}}>
                    <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                      <button onClick={() => composeToContact(c)} style={s.iconBtn} title="メール作成">✉️</button>
                      <button onClick={() => setEditContact({...c})} style={s.iconBtn} title="編集">✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:10,fontSize:12,color:"#94a3b8",textAlign:"right"}}>{filtered.length}件表示 / 合計{contacts.length}件</div>
      </div>
    );
  };

  // ── VIEW: GOOGLE SYNC ──
  const SyncView = () => (
    <div style={{maxWidth:740}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:20,color:"#1e293b"}}>🔗 Google Workspace 連携</h2>

      {/* 接続ステータス */}
      <div style={{...s.card,border:sheetsUrl?"1px solid #6ee7b7":"1px solid #e2e8f0"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:44,height:44,background:sheetsUrl?"#d1fae5":"#f1f5f9",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{sheetsUrl?"✅":"⚙️"}</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>Google Sheets 同期設定</div>
            <div style={{fontSize:12,color:sheetsUrl?"#10b981":"#64748b"}}>{sheetsUrl?"接続済み — Apps Script URLが設定されています":"未接続 — 下記URLを入力してください"}</div>
          </div>
          {lastSync && <div style={{marginLeft:"auto",fontSize:11,color:"#94a3b8"}}>最終同期: {lastSync}</div>}
        </div>
        <div style={{marginBottom:14}}>
          <label style={s.label}>Apps Script Web App URL</label>
          <div style={{display:"flex",gap:8}}>
            <input style={{...s.input,flex:1}} placeholder="https://script.google.com/macros/s/xxxxx/exec" value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} />
            <button style={s.btn()} onClick={syncToSheets}>同期実行</button>
          </div>
          <div style={{fontSize:11,color:"#475569",marginTop:5}}>Google Apps Scriptでウェブアプリとして公開したURLを入力してください</div>
        </div>
      </div>

      {/* 手動インポート/エクスポート (Google Sheets) */}
      <div style={s.card}>
        <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12}}>📊 Google Sheets 手動連携</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button onClick={exportCSV} style={{...s.btn(),padding:"12px",textAlign:"center"}}>⬇ CSVをエクスポート<div style={{fontSize:10,opacity:.7,marginTop:2}}>Google Sheetsに手動インポート可</div></button>
          <label style={{...s.btn("secondary"),padding:"12px",textAlign:"center",cursor:"pointer"}}>
            ⬆ CSVをインポート<div style={{fontSize:10,opacity:.7,marginTop:2}}>Google SheetsからCSV出力して取込</div>
            <input type="file" accept=".csv" onChange={importCSV} style={{display:"none"}} />
          </label>
        </div>
      </div>

      {/* Google コンタクト連携 */}
      <div style={s.card}>
        <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:4}}>👤 Google コンタクト連携</h3>
        <p style={{fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.7}}>vCard形式で双方向に同期できます。連絡先をGoogleコンタクトへエクスポート、またはGoogleコンタクトからエクスポートしたvCardをこのアプリへインポートできます。</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <button onClick={exportVCard} style={{...s.btn(),padding:"16px",textAlign:"center",lineHeight:1.5}}>
            <div style={{fontSize:22,marginBottom:6}}>📤</div>
            <div style={{fontSize:12,fontWeight:700}}>このアプリ → Googleコンタクト</div>
            <div style={{fontSize:10,opacity:.8,marginTop:3}}>vCard (.vcf) でエクスポート</div>
          </button>
          <label style={{...s.btn("secondary"),padding:"16px",textAlign:"center",cursor:"pointer",display:"block",lineHeight:1.5}}>
            <div style={{fontSize:22,marginBottom:6}}>📥</div>
            <div style={{fontSize:12,fontWeight:700}}>Googleコンタクト → このアプリ</div>
            <div style={{fontSize:10,opacity:.8,marginTop:3}}>vCard (.vcf) をインポート</div>
            <input type="file" accept=".vcf" ref={vcfFileRef} onChange={importVCard} style={{display:"none"}} />
          </label>
        </div>
        {/* 手順ガイド */}
        <div style={{background:"#f8fafc",borderRadius:8,padding:14,border:"1px solid #e2e8f0"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#475569",marginBottom:10}}>📖 連携手順</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#0ea5e9",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
                <span style={{background:"#e0f2fe",borderRadius:4,padding:"1px 6px"}}>出力</span> このアプリ → Googleコンタクト
              </div>
              <div style={{fontSize:11,color:"#64748b",lineHeight:2}}>
                <div>① 「このアプリ → Googleコンタクト」をクリック</div>
                <div>② 連絡先.vcf をダウンロード</div>
                <div>③ <a href="https://contacts.google.com" target="_blank" rel="noopener" style={{color:"#0ea5e9"}}>contacts.google.com</a> を開く</div>
                <div>④「インポート」→ vcfファイルを選択して完了</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#10b981",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
                <span style={{background:"#d1fae5",borderRadius:4,padding:"1px 6px"}}>取込</span> Googleコンタクト → このアプリ
              </div>
              <div style={{fontSize:11,color:"#64748b",lineHeight:2}}>
                <div>① <a href="https://contacts.google.com" target="_blank" rel="noopener" style={{color:"#0ea5e9"}}>contacts.google.com</a> を開く</div>
                <div>②「エクスポート」→「vCard形式」を選択</div>
                <div>③ ダウンロードした.vcfファイルを保存</div>
                <div>④「Googleコンタクト → このアプリ」で選択</div>
                <div style={{color:"#94a3b8"}}>※ 重複メールは自動スキップされます</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ユーザー管理（管理者のみ表示） */}
      {isAdmin && (
        <div style={s.card}>
          <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:4}}>👥 ユーザー管理</h3>
          <p style={{fontSize:12,color:"#64748b",marginBottom:14,lineHeight:1.7}}>アプリにログインできるユーザーをここで追加・削除できます。Apps Script URLの設定が必要です。</p>

          {/* 固定管理者 */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:6}}>🔒 固定管理者（変更不可）</div>
            {CONFIG.allowedEmails.map(email => (
              <div key={email} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8fafc",borderRadius:6,marginBottom:4,border:"1px solid #e2e8f0"}}>
                <span style={{fontSize:12,color:"#475569",flex:1}}>{email}</span>
                <span style={{...s.badge("#10b981"),fontSize:10}}>管理者</span>
              </div>
            ))}
          </div>

          {/* 追加ユーザー */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:6}}>👤 追加ユーザー</div>
            {sheetsAllowedEmails.length === 0 && (
              <div style={{fontSize:12,color:"#94a3b8",padding:"10px",textAlign:"center"}}>まだ追加ユーザーはいません</div>
            )}
            {sheetsAllowedEmails.map(email => (
              <div key={email} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"#f8fafc",borderRadius:6,marginBottom:4,border:"1px solid #e2e8f0"}}>
                <span style={{fontSize:12,color:"#475569",flex:1}}>{email}</span>
                <button onClick={() => removeAllowedUser(email)} style={{...s.btn("danger"),padding:"2px 8px",fontSize:11}}>削除</button>
              </div>
            ))}
          </div>

          {/* 新規追加 */}
          <div style={{display:"flex",gap:8}}>
            <input style={{...s.input,flex:1}} placeholder="追加するメールアドレスを入力" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAllowedUser()} />
            <button style={s.btn()} onClick={addAllowedUser}>＋ 追加</button>
          </div>
          {!sheetsUrl && <div style={{fontSize:11,color:"#f59e0b",marginTop:8}}>⚠️ 上のApps Script URLを設定すると変更が保存されます</div>}
        </div>
      )}

      {/* Gmailクイックアクセス */}
      <div style={s.card}>
        <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",marginBottom:12}}>🚀 Google Workspace クイックリンク</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[["📬 Gmail","https://mail.google.com"],["📊 Sheets","https://sheets.google.com"],["📅 Calendar","https://calendar.google.com"],["👤 Contacts","https://contacts.google.com"],["📂 Drive","https://drive.google.com"],["🤝 Meet","https://meet.google.com"]].map(([label,url]) => (
            <a key={url} href={url} target="_blank" rel="noopener" style={{...s.btn("ghost"),textAlign:"center",padding:"10px",display:"block",fontSize:13}}>{label}</a>
          ))}
        </div>
      </div>

      {/* Apps Script セットアップガイド */}
      <div style={s.card}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <h3 style={{fontSize:13,fontWeight:600,color:"#94a3b8",margin:0}}>🛠 自動同期セットアップガイド</h3>
          <button style={{...s.btn("ghost"),fontSize:12}} onClick={() => setShowScript(!showScript)}>{showScript?"閉じる ▲":"スクリプト表示 ▼"}</button>
        </div>
        <div style={{fontSize:13,color:"#64748b",lineHeight:2.2}}>
          <div>1. <a href="https://sheets.google.com" target="_blank" rel="noopener" style={{color:"#0ea5e9"}}>Google Sheets</a> で新規スプレッドシートを作成</div>
          <div>2. 「拡張機能」→「Apps Script」を開く</div>
          <div>3. 下記スクリプトを貼り付けて保存</div>
          <div>4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」→「全員がアクセス可能」に設定</div>
          <div>5. 発行されたURLをこのページの「Apps Script URL」欄に貼り付ける</div>
          <div>6. 「同期実行」を押すとスプレッドシートが自動更新されます ✅</div>
        </div>
        {showScript && (
          <div style={{marginTop:12,position:"relative"}}>
            <div style={{position:"absolute",top:8,right:8,zIndex:1}}>
              <button style={{...s.btn("ghost"),fontSize:11}} onClick={() => { navigator.clipboard?.writeText(APPS_SCRIPT_CODE); notify("📋 コードをコピーしました"); }}>📋 コピー</button>
            </div>
            <pre style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"16px",fontSize:11,color:"#475569",overflowX:"auto",lineHeight:1.6,margin:0,maxHeight:320,overflowY:"auto"}}>
              {APPS_SCRIPT_CODE}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  // ── EDIT MODAL ──
  const EditModal = () => editContact && (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={() => setEditContact(null)}>
      <div style={{...s.card,width:480,maxHeight:"88vh",overflowY:"auto",margin:0,zIndex:101}} onClick={e => e.stopPropagation()}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:16,color:"#1e293b"}}>✏️ 連絡先を編集</h3>
        {[["name","名前"],["company","会社名"],["title","役職"],["email","メール"],["phone","電話"],["followUp","フォロー日 (YYYY-MM-DD)"],["address","事務所住所"],["lastContacted","最終連絡日"]].map(([k,l]) => (
          <div key={k} style={{marginBottom:10}}>
            <label style={s.label}>{l}</label>
            <input style={s.input} value={editContact[k]||""} onChange={e => setEditContact(d => ({...d,[k]:e.target.value}))} />
          </div>
        ))}
        <div style={{marginBottom:10}}>
          <label style={s.label}>業界</label>
          <select style={s.input} value={editContact.industry} onChange={e => setEditContact(d => ({...d,industry:e.target.value}))}>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <label style={s.label}>担当者</label>
          <select style={s.input} value={editContact.addedBy} onChange={e => setEditContact(d => ({...d,addedBy:e.target.value}))}>
            {MEMBERS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <label style={s.label}>タグ</label>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ALL_TAGS.map(t => (
              <button key={t} onClick={() => setEditContact(d => ({...d,tags:d.tags.includes(t)?d.tags.filter(x=>x!==t):[...d.tags,t]}))}
                style={{...s.tag(t),cursor:"pointer",opacity:editContact.tags.includes(t)?1:0.35,border:`1px solid ${tagColor(t)}`}}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={s.label}>メモ</label>
          <textarea style={{...s.input,height:80,resize:"vertical"}} value={editContact.memo||""} onChange={e => setEditContact(d => ({...d,memo:e.target.value}))} />
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={s.btn()} onClick={saveEdit}>💾 保存</button>
          <button style={{...s.btn("ghost")}} onClick={() => setEditContact(null)}>キャンセル</button>
          <button style={{...s.btn("danger"),marginLeft:"auto"}} onClick={() => deleteContact(editContact.id)}>削除</button>
        </div>
      </div>
    </div>
  );

  // ── RENDER ──
  if (!user) return <LoginScreen onLogin={handleLogin} extraAllowedEmails={sheetsAllowedEmails} />;

  return (
    <div style={s.app}>
      {notification && <div style={s.notification}>{notification}</div>}
      <EditModal />
      <header style={s.header}>
        <span style={s.logo}>📇 {CONFIG.appName}</span>
        <nav style={s.nav}>
          {VIEWS.map((v, i) => (
            <button key={v} style={s.navBtn(view===i)} onClick={() => setView(i)}>
              {VIEW_ICONS[i]} {v}
            </button>
          ))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:12,flexShrink:0}}>
          {user.picture
            ? <img src={user.picture} alt="" style={{width:28,height:28,borderRadius:"50%",border:"2px solid #e0f2fe"}} />
            : <div style={{width:28,height:28,borderRadius:"50%",background:"#e0f2fe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#0ea5e9"}}>{(user.name||user.email)[0].toUpperCase()}</div>
          }
          <span style={{fontSize:12,color:"#64748b",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name||user.email}</span>
          <button onClick={handleLogout} style={{background:"transparent",border:"1px solid #e2e8f0",color:"#94a3b8",borderRadius:6,padding:"3px 9px",fontSize:11,cursor:"pointer"}}>ログアウト</button>
        </div>
      </header>
      <main style={s.main}>
        {view === 0 && <Dashboard />}
        {view === 1 && <ContactTree />}
        {view === 2 && <ComposeView />}
        {view === 3 && <ScanView />}
        {view === 4 && <SpreadsheetView />}
        {view === 5 && <SyncView />}
      </main>
    </div>
  );
}
