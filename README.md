# الواجهة (Frontend)

واجهة عربية (RTL) لمكتب الإجازات.

## التشغيل

```bash
npm install
npm run dev
```

في التطوير، `/api` يُوجَّه إلى `http://localhost:4000`.

## النشر على Vercel

- لا تستخدم `VITE_API_URL` في الإنتاج
- `vercel.json` يوجّه `/api/*` إلى Railway

راجع [../docs/DEPLOY.md](../docs/DEPLOY.md).

## المسارات

- `/manager/*` — المدير
- `/branch/*` — رئيس الفرع
- `/employee/*` — الموظف (+ مسارات الفريق عند التفويض)

تسجيل الدخول بـ **اسم المستخدم**.
