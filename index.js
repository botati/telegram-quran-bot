const path = require('path');
const fs = require('fs-extra');
const islam_bot = require('./src/Telegram/index.js');

// 1. تحديد المجلدات للعمل كبيئة سيرفر
const Path_Local = __dirname;
const Path_appData = path.join(__dirname, 'data');

// 2. قراءة الإعدادات من متغيرات Heroku
const token = process.env.BOT_TOKEN;
const ownerId = process.env.OWNER_ID || '';

if (!token) {
    console.error('❌ خطأ: لم يتم تعيين BOT_TOKEN داخل Config Vars في Heroku!');
    process.exit(1);
}

// 3. إنشاء مجلد الإعدادات وملف Settings.json كما يتوقعه سورس البوت
const settingsDir = path.join(Path_appData, 'islam_bot');
fs.ensureDirSync(settingsDir);

const settingsFilePath = path.join(settingsDir, 'Settings.json');

const settingsData = {
    token: token,
    owner: ownerId,
    start: true,
    off_on: 'on'
};

fs.writeJSONSync(settingsFilePath, settingsData, { spaces: '\t' });

// 4. محاكي إشعارات بديل عن إشعارات واجهة سطح المكتب (Electron)
class MockNotification {
    constructor(options) {
        this.title = options?.title || '';
        this.body = options?.body || '';
    }
    show() {
        console.log(`[Notification] ${this.title}: ${this.body}`);
    }
}

// 5. تشغيل البوت
console.log('⏳ جاري تشغيل بوت القرآن الكريم...');
try {
    islam_bot(Path_appData, Path_Local, MockNotification);
    console.log('✅ تم تشغيل البوت بنجاح على Heroku!');
} catch (error) {
    console.error('❌ حدث خطأ أثناء تشغيل البوت:', error);
}
