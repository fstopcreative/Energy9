# Genel Kontrol Raporu

Son güncelleme: 2026-05-11

Build temiz, TypeScript hatasız (`npm run build` ✓).
Tracked dosya sayısı: **2695 → 16** (node_modules + build artifacts artık dışarıda).

## ✅ Çözülenler

### 1. `.gitignore` eklendi
Yeni `.gitignore` kapsam: `node_modules/`, `dist/`, `build/`, `.vite/`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`, `.idea/`, `.vscode/`, `*.swp`, log'lar, `.vercel`.

`git rm --cached` ile node_modules (2664 dosya), dist, .vite, ve tüm .DS_Store'lar index'ten çıkarıldı. Bir sonraki commit'te git tarihine yansıyacak.

**Sonuç:** `.env.local` artık güvenle eklenebilir (webhook secret commit olmaz).

### 2. `body-schema.json` silindi
`body-main.json` ile birebir aynıydı (3209 byte). Duplikasyon temizlendi.

### 3. CSV / Formula Injection guard
[api/submit-claim.ts](api/submit-claim.ts) içine `sanitizeForExcel()` eklendi. `=`, `+`, `-`, `@`, tab, CR ile başlayan tüm string değerlere `'` prefix konuyor → Excel formül olarak yorumlamıyor.

```ts
if (/^[=+\-@\t\r]/.test(value)) {
  return "'" + value;
}
```

Hem `cleanString` hem de `cleanStringArray` bu sanitizasyondan geçiyor.

### 4. Payload boyutu limiti
Handler başında `JSON.stringify(req.body).length > 50_000` ise **413 Payload too large** dönülüyor. Her field için ayrıca **5 000 karakter** kesimi (`MAX_FIELD_LENGTH`) uygulanıyor.

### 6. Honeypot field
Forma görünmez `website_url` input'u eklendi (off-screen `left: -10000px`, `tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`). API'de bu alan doluysa **200 OK** dönülüp veri silently drop ediliyor — bot retry'a girmiyor.

### 7. `env-check.ts` kaldırıldı
Endpoint silindi, README referansı da güncellendi. Artık env config state'i public değil.

## 🟠 Kalan – Yüksek

### 5. Rate limiting hâlâ yok
IP başına spam koruması yok. Çözüm Vercel KV (Upstash Redis) gerektiriyor — ayrı bir kurulum işi. Honeypot kısa vadede çoğu botu durdurur ama insan saldırgan veya sofistike botlara karşı dakikalık limit gerekir.

## 🔵 Kalan – Düşük

### 8. Security headers
`vercel.json`'a `headers` ekleyerek `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, basit bir CSP eklenebilir.

### 9. Phone regex çok gevşek
`/^[+\d][\d\s()-]{6,}$/` — `+++++++` geçer. UK için daha sıkı: `/^(\+?44|0)\s?\d{2,4}\s?\d{3,4}\s?\d{3,4}$/`.

### 10. Date min/max yok
`contract_start_date` / `contract_end_date` HTML date input'larında `min="1990-01-01" max="2030-12-31"` benzeri sınır yok.

### 11. Text input'larda `maxLength` yok
API zaten 5 000 karakter kesiyor, ama client'ta da `maxLength` koymak UX olarak daha iyi (kullanıcı kesileceğini görür).

### 12. API'de format re-validation yok
Postcode / email / telefon regex sadece client'ta. Defense-in-depth için API tarafına da konulabilir.

## ℹ️ Hâlâ eksik

- **Logging** — `console.error` ile Vercel logs'a başarısız submission'lar yazılabilir
- **Test** — kapsam dışı kabul edildi

## Özet

| # | Madde | Durum |
| --- | --- | --- |
| 1 | `.gitignore` + untrack | ✅ |
| 2 | body-schema.json sil | ✅ |
| 3 | CSV injection guard | ✅ |
| 4 | Payload size limit | ✅ |
| 5 | Rate limiting | ⏳ KV gerekir |
| 6 | Honeypot | ✅ |
| 7 | env-check.ts kaldır | ✅ |
| 8 | Security headers | ⏳ |
| 9 | Phone regex | ⏳ |
| 10 | Date min/max | ⏳ |
| 11 | maxLength | ⏳ |
| 12 | API format re-validation | ⏳ |

**Bir sonraki commit'te dikkat:** index'ten silinen ~2700 node_modules/dist dosyası git'te delete olarak görünüyor. Commit'leyince repo tarihçesi temizlenecek. Eğer önceki commit'lerdeki node_modules'u da silmek istersen `git filter-repo` veya `bfg` gerekir (history rewrite, force push).
