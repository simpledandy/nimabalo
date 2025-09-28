/**
 * Centralized strings for the Nimabalo application
 * 
 * This file contains all user-facing text strings organized by feature/page.
 * Each key is descriptive and indicates where the string is used.
 * 
 * To change any text in the app, simply update the corresponding value here.
 */

export const strings = {
  // Navigation & Header
  nav: {
    home: "Nimabalo bosh sahifa",
    profile: "Shaxsiy ko'rinish",
    notifications: "Bildirishnomalar",
    notificationsComingSoon: "Bildirishnomalar tez orada!",
    signOut: "Nimabalodan chiqish",
    signOutConfirm: "Haqiqatan ham tizimdan chiqmoqchimisiz? Sizning ma'lumotlaringiz saqlanadi.",
    signOutConfirmYes: "Ha, chiqish",
    signOutConfirmCancel: "Bekor qilish",
  },

  // Homepage
  home: {
    title: "Xo'sh, nima baloni bilmoqchisiz?",
    subtitle: "Savollaringizni so'rang, insonlardan javob oling! 🌟",
    inputPlaceholder: "Savolingizni yozing...",
    submitButton: "Odamlardan so'raymiz!",
    submittingButton: "Yuborilmoqda…",
    characterCounter: {
      writing: "✍️",
      typing: "📝", 
      warning: "🚨"
    },
    tip: "💡 Maslahat: Savolingizni aniq va tushunarli yozing!",
    successMessage: "Savolingiz muvaffaqiyatli yuborildi! Javobni kutib turing! 🚀",
    errorMessages: {
      emptyTitle: "Savol sarlavhasi bo'lishi mumkin emas.",
      duplicateQuestion: "Bu savol allaqachon so'ralgan. Iltimos, boshqa savol so'rang yoki mavjud savolni toping.",
      userNotFound: "Foydalanuvchi ma'lumotlari topilmadi. Iltimos, qayta tizimga kiring.",
      genericError: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
    }
  },

  // Authentication
  auth: {
    welcome: "Xush kelibsiz!",
    welcomeSubtitle: "Savollaringizga javob toping yoki boshqalarga yordam bering",
    loginTitle: "Kirish / Ro'yxatdan o'tish",
    loginSubtitle: "Tezda hisob yarating va barcha imkoniyatlardan foydalaning!",
    loggedInMessage: "Siz tizimga kirdingiz!",
    goHome: "Bosh sahifa",
    askQuestion: "Savol bering",
    tip: "💡 Hisob yaratish bepul va faqat bir necha soniya!",
    errorPrefix: "Xatolik:",
    formLabels: {
      email: "Elektron pochta",
      password: "Parol",
      emailPlaceholder: "Elektron pochta manzilingizni yozing",
      passwordPlaceholder: "Parol kiriting",
      passwordCreatePlaceholder: "Parol yarating",
      buttonLabel: "Kirish",
      signupButtonLabel: "Ro'yxatdan o'tish",
      loadingButtonLabel: "Kirilmoqda...",
      signupLoadingButtonLabel: "Yuborilmoqda...",
      linkText: "Kirishga qaytish",
      signupLinkText: "Ro'yxatdan o'tishga qaytish",
      socialProviderText: "Google bilan kirish",
      signupSocialProviderText: "Google bilan ro'yxatdan o'tish",
      forgotPasswordLink: "Parolni unutdingizmi?",
      forgotPasswordButton: "Parolni tiklash",
      forgotPasswordLoading: "Yuborilmoqda...",
      magicLinkButton: "Magic link yuborish",
      magicLinkLoading: "Yuborilmoqda...",
      magicLinkText: "Magic link yuborish",
      updatePasswordLabel: "Yangi parol",
      updatePasswordPlaceholder: "Yangi parol kiriting",
      updatePasswordButton: "Parolni yangilash",
      updatePasswordLoading: "Yuborilmoqda...",
      verifyOtpButton: "Tasdiqlash kodini yuborish",
      verifyOtpLoading: "Yuborilmoqda..."
    },
    validationErrors: {
      passwordTooShort: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
      passwordTooLong: "Parol 72 ta belgidan ko'p bo'lmasligi kerak",
      passwordInvalidCharacters: "Parol faqat harflar, raqamlar va maxsus belgilardan iborat bo'lishi kerak",
      emailInvalid: "To'g'ri email manzil kiriting",
      emailRequired: "Email manzil kiritilishi shart",
      passwordRequired: "Parol kiritilishi shart",
      confirmPasswordMismatch: "Parollar mos kelmadi",
      userAlreadyExists: "Bu email bilan ro'yxatdan o'tilgan. Kirish tugmasini bosing",
      invalidCredentials: "Email yoki parol noto'g'ri",
      tooManyRequests: "Juda ko'p urinishlar. Iltimos, biroz kutib qayta urinib ko'ring",
      networkError: "Internet aloqasi bilan bog'liq muammo. Iltimos, qayta urinib ko'ring",
      signupDisabled: "Ro'yxatdan o'tish hozircha o'chirilgan. Iltimos, keyinroq urinib ko'ring",
      emailNotConfirmed: "Email tasdiqlanmagan. Iltimos, email manzilingizni tekshiring",
      weakPassword: "Parol juda oddiy. Iltimos, kuchliroq parol tanlang",
      genericError: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring"
    }
  },

  // Profile Pages
  profile: {
    personalProfile: "Shaxsiy Ko'rinish",
    userProfile: "Foydalanuvchi Profili",
    editProfile: "Tahrirlash",
    profileInfo: "Profil ma'lumotlari",
    editProfileTitle: "Profilni tahrirlash",
    stats: {
      questions: "Savollar",
      answers: "Javoblar", 
      position: "Pozitsiya"
    },
    fields: {
      email: "Email",
      username: "Iznom",
      fullName: "To'liq ism",
      usernamePlaceholder: "Betakror taxallusingiz",
      fullNamePlaceholder: "Ismingiz"
    },
    buttons: {
      save: "Saqlash",
      saving: "Saqlanmoqda...",
      loginRequired: "Ko'rish uchun tizimga kiring.",
      goToLogin: "Kirish sahifasiga o'tish"
    },
    messages: {
      saved: "Saqlandi!",
      emailNotShown: "Email ko'rsatilmagan",
      emailNotShownPublic: "Ko'rsatilmagan"
    },
    usernameSetup: {
      title: "Iznom",
      subtitle: "Bu sizning betakror taxallusingiz.",
      pickUsername: "Iznomingizni tanlang",
      usernameLabel: "Iznom",
      usernamePlaceholder: "Sizning iznomingiz",
      usernameRules: "Faqat kichik harflar, raqamlar va pastki chiziq ruxsat etiladi",
      suggestionsTitle: "Yoki bularni sinab ko'ring:",
      available: "Ajoyib! Bu iznom mavjud",
      taken: "Bu iznom allaqachon olingan",
      invalid: "Noto'g'ri iznom formati",
      saving: "Saqlanmoqda...",
      createProfile: "Profil yaratish",
      skipForNow: "Hozircha o'tkazib yuborish (keyinroq o'rnatishingiz mumkin)",
      tip: "Iznomingiz - bu sahifadagi shaxsiy ko'rinishingizga eltuvchi yo'l"
    }
  },

  // Question Detail Page
  question: {
    backToQuestions: "Barcha savollarga qaytish",
    backToQuestionsMobile: "Barcha savollar",
    askedTime: "So'ralgan vaqti:",
    author: "Muallif:",
    authorLabel: "Foydalanuvchi",
    answers: "Javoblar",
    totalAnswers: "Jami {count} ta javob",
    averageLength: "O'rtacha {length} belgi",
    detailedAnswers: "{count} ta batafsil javob",
    noAnswers: "Hali javoblar yo'q",
    noAnswersSubtitle: "Birinchi javobni siz bering! 💡",
    writeAnswer: "Sizning javobingiz",
    answerPlaceholder: "Bu yerga yozing... 💡",
    answerButton: "Javob yuborish!",
    answerSubmitting: "Yuborilmoqda…",
    answerSuccess: "Javobingiz muvaffaqiyatli yuborildi! 🚀",
    answerTip: "💡 Maslahat: Batafsil va foydali javob yozing!",
    answerLength: "{length} belgi",
    answerTime: "Javob berilgan vaqti:",
    answerNumber: "#{number}",
    sorting: {
      label: "Saralash",
      newest: "Eng yangi",
      oldest: "Eng eski", 
      longest: "Eng uzun",
      shortest: "Eng qisqa",
      sorted: "🔄 Saralandi!"
    },
    showKnowledge: "Bilimingizni ko'rsating!",
    detailedAnswerTooltip: "Batafsil javob",
    errors: {
      answerTooShort: "Javob juda qisqa.",
      answerSubmitError: "Javobni yuborishda xatolik yuz berdi"
    }
  },

  // Latest Questions
  latestQuestions: {
    title: "So'nggi savollar",
    loading: "Yuklanmoqda…",
    noQuestions: "Hali savollar yo'q.",
    author: "Muallif:",
    sameCount: "{count} kishida ham qiziq",
    anonymousUser: "Anon",
    buttons: {
      answer: "Bu savolga javob bering",
      answerText: "Javob",
      sameQuestion: "Menda ham shu savol",
      sameQuestionActive: "Menda ham shu savol ✓",
      sameQuestionLoading: "...",
      sameQuestionRequiresAuth: "Qiziqish bildirish uchun kirish kerak"
    },
    tooltips: {
      answer: "Bu savolga javob bering",
      sameQuestion: "Xuddi shu savol menda ham bor",
      sameQuestionRequiresAuth: "Savolga munosabat bildirish uchun tizimga kiring"
    }
  },

  // Auth Modal
  authModal: {
    defaultTitle: "Tizimga kirish kerak",
    defaultMessage: "Bu amalni bajarish uchun tizimga kiring yoki ro'yxatdan o'ting",
    signupTitle: "Ro'yxatdan o'ting",
    signupButton: "Ro'yxatdan o'tish",
    loginButton: "Tizimga kirish",
    backToLogin: "← Tizimga kirish",
    cancel: "Bekor qilish",
    titles: {
      askQuestion: "Savol yuborish uchun tizimga kiring",
      showInterest: "Qiziqish bildirish uchun tizimga kiring",
      answerQuestion: "Javobingizni yetkazish uchun foydalanuvchiga aylaning🤗"
    },
    messages: {
      askQuestion: "Savolingizni yuborish va javoblarni olish uchun tizimga kiring yoki ro'yxatdan o'ting",
      showInterest: "Bu savolga qiziqish bildirish uchun tizimga kiring yoki ro'yxatdan o'ting",
      answerQuestion: "Javobingizni saqlash va boshqalarga yordam berish uchun tizimga kiring yoki ro'yxatdan o'ting"
    }
  },

  // Badge System
  badge: {
    title: "Siz nimabalo.uzda {position}-foydalanuvchi bo'ldingiz!",
    description: "Tasavvur qiling, millionlab odamlar nimabalo.uzni ishlatayotganda siz bu raqamingiz bilan qancha maqtanishingiz mumkin! Eng muhimi, sizda dalil bor - ushbu yorliq! Baxtli kashfiyotlar! 🎉",
    thankYou: "Rahmat!",
    sectionTitle: "Yorliqlaringiz",
    displayTitle: "Siz nimabalo.uzda x-foydalanuvchi bo'ldingiz!"
  },

  // Notifications
  notifications: {
    title: "Xabarnomalar",
    subtitle: "Sizning yangi nishonlaringiz va xabarlaringiz",
    noNotifications: "Hozircha yangi xabarnomalar yo'q",
    gotIt: "Tushundim"
  },

  // Surprise CTA
  surprise: {
    button: "Savollarga javobingiz bormi?",
    buttonMobile: "Javob?",
    surprises: [
      {
        title: "Syurpriz kerakmi?",
        message: "Qiziquvchilarga javob topishda yordam bering, keyin his qilasiz!",
        cta: "Ketdik"
      },
      {
        title: "Qiziqmi?",
        message: "Har kuni bitta yangi narsani o'rgating. Birinchi bo'lib javob bering!",
        cta: "Boshla"
      },
      {
        title: "Keling, kashf qilamiz!",
        message: "O'zingizga xos javob ulashing, fikringizni dunyo eshitsin!",
        cta: "Qani"
      },
      {
        title: "Bir oz sehr?",
        message: "Odamlarga yordam berishga tayyormisiz?",
        cta: "Ko'raylikchi"
      }
    ],
    later: "Keyinroq"
  },

  // Independence Day
  independence: {
    date: "1-SENTABR",
    title: "Mustaqillik kuni muborak!",
    message: "Erkin savol berishda davom etaylik. Bayramingiz muborak!",
    thankYou: "Rahmat!"
  },

  // Error Messages
  errors: {
    userNotFound: "Foydalanuvchi topilmadi",
    userNotFoundMessage: "Bu foydalanuvchi mavjud emas",
    questionNotFound: "Savol topilmadi",
    questionNotFoundMessage: "Bu savol mavjud emas yoki o'chirilgan",
    genericError: "Xatolik yuz berdi",
    goHome: "Bosh sahifaga qaytish"
  },

  // Time Utils
  time: {
    justNow: "Hozirgina",
    minutesAgo: "{minutes} daqiqa oldin",
    hoursAgo: "{hours} soat oldin", 
    daysAgo: "{days} kun oldin",
    weeksAgo: "{weeks} hafta oldin",
    monthsAgo: "{months} oy oldin",
    yearsAgo: "{years} yil oldin"
  }
} as const;

// Helper function to replace placeholders in strings
export function formatString(template: string, replacements: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return replacements[key]?.toString() || match;
  });
}
