const path = require('path');
const fs = require('fs-extra');
const islam_bot = require('./src/Telegram/index.js');

// 1. تحديد المسارات
const Path_Local = __dirname;
const Path_appData = path.join(__dirname, 'data');
const settingsDir = path.join(Path_appData, 'islam_bot');

// التأكد من وجود المجلد
fs.ensureDirSync(settingsDir);

// 2. قراءة الإعدادات من متغيرات Heroku
const token = process.env.BOT_TOKEN;
const ownerId = process.env.OWNER_ID || '';

if (!token) {
    console.error('❌ خطأ: لم يتم تعيين BOT_TOKEN داخل Config Vars في Heroku!');
    process.exit(1);
}

// 3. إنشاء وتهيئة ملف الإعدادات Settings.json
const settingsFilePath = path.join(settingsDir, 'Settings.json');
const settingsData = {
    token: token,
    owner: ownerId,
    start: true,
    off_on: 'on'
};
fs.writeJSONSync(settingsFilePath, settingsData, { spaces: '\t' });

// 4. إنشاء وتجهيز الملفات الناقصة (Users, Channels, Groups, etc.)
const initJsonFile = (fileName, defaultData) => {
    const filePath = path.join(settingsDir, fileName);
    if (!fs.existsSync(filePath)) {
        fs.writeJSONSync(filePath, defaultData, { spaces: '\t' });
    }
};

// إنشاء الملفات المطلوبة بمصفوفات فارغة افتراضياً
initJsonFile('Users.json', []);
initJsonFile('Channels.json', []);
initJsonFile('Groups.json', []);
initJsonFile('Admin.json', [ownerId].filter(Boolean));
initJsonFile('Errors.json', []);

// 5. محاكي الإشعارات المخصص للسيرفر
class MockNotification {
    constructor(options) {
        this.title = options?.title || '';
        this.body = options?.body || '';
    }
    show() {
        console.log(`[Notification] ${this.title}: ${this.body}`);
    }
}

// 6. تشغيل البوت
console.log('⏳ جاري تشغيل بوت القرآن الكريم...');
try {
    islam_bot(Path_appData, Path_Local, MockNotification);
    console.log('✅ تم تشغيل البوت بنجاح واستقرار!');
} catch (error) {
    console.error('❌ حدث خطأ أثناء تشغيل البوت:', error);
}
