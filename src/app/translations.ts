export const translations = {
  en: {
    nav: {
      login: "Login",
      register: "Create account",
    },

    hero: {
      eyebrow: "Predict real events",
      title1: "Make predictions.",
      title2: "Build your track record.",
      description:
        "Follow sports, weather and long-term events. Use virtual points, make predictions before events begin and track your accuracy over time.",
      start: "Start with 10,000 points",
      how: "How it works",
      note: "New accounts start with 10,000 virtual points.",
    },

    preview: {
      label: "Platform preview",
      title: "Open markets",
      liveLater: "LIVE DATA LATER",
      open: "OPEN",
      football: "Football",
      tennis: "Tennis",
      weather: "Weather",
      arsenal: "Arsenal vs Liverpool",
      arsenalTime: "Predictions close at 15:00",
      dimitrov: "Grigor Dimitrov vs Novak Djokovic",
      dimitrovTime: "Predictions close before match start",
      rain: "Will it rain in Sofia tomorrow?",
      rainTime: "Weather market",
    },

    how: {
      eyebrow: "How it works",
      title: "Simple prediction flow",
      description: "Every prediction follows the same basic process.",

      step1Title: "Create an account",
      step1Text:
        "Start with 10,000 virtual points in your personal balance.",

      step2Title: "Choose an event",
      step2Text:
        "Open a sports, weather or long-term prediction market.",

      step3Title: "Make your prediction",
      step3Text:
        "Choose your outcome and decide how many points to use.",

      step4Title: "Get the result",
      step4Text:
        "After the official result is confirmed, correct predictions receive points.",
    },

    categories: {
      eyebrow: "Categories",
      title: "Different ways to predict",
      description:
        "Follow upcoming events and place predictions before the market closes.",
      football: "Football",
      tennis: "Tennis",
      basketball: "Basketball",
      weather: "Weather",
      formula1: "Formula 1",
      longTerm: "Long-Term",
    },

    longTerm: {
      eyebrow: "Long-term predictions",
      title: "Predict season winners",
      description:
        "Make longer-term predictions such as who will win the Premier League, Champions League or another major competition.",
      example: "Example market",
      question: "Who will win the Premier League?",
      minimum: "Minimum: 1,000 points",
    },

    performance: {
      eyebrow: "Personal performance",
      title: "Track your accuracy",
      description:
        "Your dashboard keeps your predictions, accuracy, points, rankings and history in one place.",
      accuracy: "Accuracy",
      ranking: "Ranking",
    },

    cta: {
      eyebrow: "Ready to start?",
      title: "Create your account and start predicting",
      description:
        "Start with 10,000 virtual points and build your prediction record across different categories.",
      button: "Create free account",
    },

    footer: {
      points: "Virtual points only",
    },
  },

  bg: {
    nav: {
      login: "Вход",
      register: "Създай акаунт",
    },

    hero: {
      eyebrow: "Прогнозирай реални събития",
      title1: "Прави прогнози.",
      title2: "Изгради своята статистика.",
      description:
        "Следи спорт, времето и дългосрочни събития. Използвай виртуални точки, прави прогнози преди началото и следи точността си.",
      start: "Започни с 10 000 точки",
      how: "Как работи",
      note: "Всеки нов акаунт започва с 10 000 виртуални точки.",
    },

    preview: {
      label: "Преглед на платформата",
      title: "Отворени прогнози",
      liveLater: "ДАННИ НА ЖИВО ПО-КЪСНО",
      open: "ОТВОРЕНО",
      football: "Футбол",
      tennis: "Тенис",
      weather: "Време",
      arsenal: "Arsenal срещу Liverpool",
      arsenalTime: "Прогнозите приключват в 15:00",
      dimitrov: "Григор Димитров срещу Новак Джокович",
      dimitrovTime: "Прогнозите приключват преди началото на мача",
      rain: "Ще вали ли утре в София?",
      rainTime: "Прогноза за времето",
    },

    how: {
      eyebrow: "Как работи",
      title: "Лесен процес за прогнозиране",
      description: "Всяка прогноза преминава през една и съща основна система.",

      step1Title: "Създай акаунт",
      step1Text:
        "Започваш с 10 000 виртуални точки в личния си баланс.",

      step2Title: "Избери събитие",
      step2Text:
        "Избери спортна, метеорологична или дългосрочна прогноза.",

      step3Title: "Направи прогноза",
      step3Text:
        "Избери резултат и реши колко точки искаш да използваш.",

      step4Title: "Получи резултата",
      step4Text:
        "След потвърждаване на официалния резултат правилните прогнози получават точки.",
    },

    categories: {
      eyebrow: "Категории",
      title: "Различни видове прогнози",
      description:
        "Следи предстоящите събития и прави прогнози преди пазарът да бъде затворен.",
      football: "Футбол",
      tennis: "Тенис",
      basketball: "Баскетбол",
      weather: "Време",
      formula1: "Формула 1",
      longTerm: "Дългосрочни",
    },

    longTerm: {
      eyebrow: "Дългосрочни прогнози",
      title: "Прогнозирай сезонните победители",
      description:
        "Прави дългосрочни прогнози като кой ще спечели Premier League, Champions League или друго голямо състезание.",
      example: "Примерна прогноза",
      question: "Кой ще спечели Premier League?",
      minimum: "Минимум: 1 000 точки",
    },

    performance: {
      eyebrow: "Лично представяне",
      title: "Следи своята точност",
      description:
        "Твоето табло събира прогнозите, точността, точките, класирането и историята ти на едно място.",
      accuracy: "Точност",
      ranking: "Класиране",
    },

    cta: {
      eyebrow: "Готов ли си да започнеш?",
      title: "Създай акаунт и започни да прогнозираш",
      description:
        "Започни с 10 000 виртуални точки и изгради своята статистика в различни категории.",
      button: "Създай безплатен акаунт",
    },

    footer: {
      points: "Само виртуални точки",
    },
  },
};

export type Language = keyof typeof translations;