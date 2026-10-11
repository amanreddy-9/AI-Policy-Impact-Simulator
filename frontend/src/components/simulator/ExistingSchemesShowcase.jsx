import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VIKSIT_SECTORS, VIKSIT_SCHEMES } from '../../data/viksitBharatSchemesData';
import { SCHEME_TRANSLATIONS } from '../../data/schemeTranslations';
import { ROADMAP_YEARS, getSchemeRoadmap } from '../../data/viksitRoadmapMetricsData';

// ── Multi-Lingual Text Dictionary for Viksit Bharat Showcase (EN, HI, TA, TE) ──
const UI_TRANSLATIONS = {
  en: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    govtOfIndia: "Government of India • भारत सरकार",
    nitiSubhead: "NITI Aayog & Ministry Directives • 25 Flagship Schemes Directory",
    viksitBharatPill: "🇮🇳 Viksit Bharat 2047",
    totalOutlaySuffix: "Lakh Cr Total Annual Outlay",
    mottoRibbon: "PEOPLE • PROGRESS • PROSPERITY",
    eyebrow: "EMPOWERING EVERY CITIZEN",
    heroTitlePrefix: "Schemes for a ",
    heroTitleHighlight: "Viksit Bharat",
    heroDescription: "Explore and verify Government of India flagship welfare schemes across 5 pillars. Each scheme provides statutory financial outlays, Center-State financing ratios, beneficiary saturation numbers, and official gazette citations.",
    searchPlaceholder: "Search for schemes, benefits, ministries, or eligibility...",
    popularSearchesLabel: "Popular Searches:",
    exploreSectorsEyebrow: "EXPLORE SECTORS",
    exploreSectorsHeading: "Discover Schemes that Build a Brighter Tomorrow",
    exploreSectorsSubheading: "From farmers and students to entrepreneurs and senior citizens, explore schemes across 5 core sectors.",
    showingSchemesText: (count) => `Showing ${count} of 25 Schemes`,
    allSectorsTab: "All 5 Sectors (25 Schemes)",
    annualOutlayLabel: "ANNUAL OUTLAY",
    beneficiariesLabel: "BENEFICIARIES",
    estLabel: "Est.",
    viewDetailsAction: "🔍 View Details & Citations",
    noSchemesFound: (q) => `No schemes found matching "${q}"`,
    noSchemesHelp: 'Try searching by common terms like "PM Kisan", "Water", "Ayushman", "Solar", or "Scholarship".',
    clearFiltersBtn: "Clear Filters & View All Schemes",
    // Modal Text
    modalGovtTag: "GOVERNMENT OF INDIA",
    nodalMinistryHeading: "NODAL MINISTRY & IMPLEMENTING AGENCY",
    officialPortalBtn: "Official Portal",
    investmentHeading: "Government Investment, Outlays & Financing Ratios",
    annualBudgetOutlay: "ANNUAL BUDGET OUTLAY",
    unionBudgetRef: "Union Budget 2024-25",
    cumulativeInvestment: "CUMULATIVE INVESTMENT",
    cumulativeDisbursedRef: "Total Disbursed to Date",
    centerStateShare: "CENTER : STATE SHARE",
    beneficiariesReach: "BENEFICIARIES REACH",
    disbursementArchitecture: "Disbursement Architecture",
    entitlementsHeading: "Key Citizen Entitlements & Direct Provisions",
    eligibilityHeading: "Target Demographics & Eligibility Criteria",
    targetCohortLabel: "Target Cohort",
    eligibilityRulesLabel: "Eligibility Rules",
    citationsHeading: "Authoritative Sources & Citations",
    officialCitationLabel: "Official Citation",
    verifiedPortalBadge: "Verified via National Unified Policy Repository & Portals",
    closeModalBtn: "Close Scheme Details",
    selectLangLabel: "Language / भाषा / மொழி / భాష:",
    roadmapTitle: "Viksit Bharat @ 2047: Saturation & Expenditure Trajectory",
    roadmapSubtitle: "Interactive multi-decade saturation engine modeled on official Cabinet sanctions, NITI Aayog milestones & Budget 2024–25",
    overallSatLabel: "Overall Saturation",
    projectedGdpLabel: "Projected GDP",
    totalBudgetLabel: "Union Budget Outlay",
    outlayGrowthLabel: "Outlay Increment",
    saturationLevelLabel: "Saturation Level",
    unitEntitlementLabel: "Unit Entitlement",
    fiscalSplitLabel: "Center : State Fiscal Split",
    proofActionBtn: "📜 Saturation & Outlay Proof (Source)"
  },
  hi: {
    fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Poppins', sans-serif",
    govtOfIndia: "भारत सरकार • Government of India",
    nitiSubhead: "नीति आयोग एवं मंत्रालय निर्देशिका • 25 प्रमुख राष्ट्रीय योजनाएं",
    viksitBharatPill: "🇮🇳 विकसित भारत 2047",
    totalOutlaySuffix: "लाख करोड़ कुल वार्षिक परिव्यय",
    mottoRibbon: "नागरिक • प्रगति • समृद्धि",
    eyebrow: "प्रत्येक नागरिक का सशक्तिकरण",
    heroTitlePrefix: "योजनाएं एक ",
    heroTitleHighlight: "विकसित भारत के लिए",
    heroDescription: "5 प्रमुख स्तंभों में भारत सरकार की प्रमुख कल्याणकारी योजनाओं का अन्वेषण और सत्यापन करें। प्रत्येक योजना वैधानिक वित्तीय परिव्यय, केंद्र-राज्य वित्तपोषण अनुपात, लाभार्थी संतृप्ति संख्या और आधिकारिक राजपत्र उद्धरण प्रदान करती है।",
    searchPlaceholder: "योजनाओं, लाभों, मंत्रालयों या पात्रता के लिए खोजें...",
    popularSearchesLabel: "लोकप्रिय खोजें:",
    exploreSectorsEyebrow: "क्षेत्रों का अन्वेषण करें",
    exploreSectorsHeading: "उज्ज्वल कल का निर्माण करने वाली योजनाओं की खोज करें",
    exploreSectorsSubheading: "किसानों और छात्रों से लेकर उद्यमियों और वरिष्ठ नागरिकों तक, 5 प्रमुख क्षेत्रों में योजनाओं का अन्वेषण करें।",
    showingSchemesText: (count) => `25 में से ${count} योजनाएं प्रदर्शित`,
    allSectorsTab: "सभी 5 क्षेत्र (25 योजनाएं)",
    annualOutlayLabel: "वार्षिक परिव्यय",
    beneficiariesLabel: "लाभार्थी",
    estLabel: "स्थापना",
    viewDetailsAction: "🔍 विवरण एवं उद्धरण देखें",
    noSchemesFound: (q) => `"${q}" से मेल खाने वाली कोई योजना नहीं मिली`,
    noSchemesHelp: '"पीएम किसान", "जल", "आयुष्मान", "सौर" या "छात्रवृत्ति" जैसे सामान्य शब्दों से खोजें।',
    clearFiltersBtn: "फ़िल्टर हटाएं और सभी योजनाएं देखें",
    // Modal Text
    modalGovtTag: "भारत सरकार",
    nodalMinistryHeading: "नोडल मंत्रालय एवं कार्यान्वयन एजेंसी",
    officialPortalBtn: "अधिकारिक पोर्टल",
    investmentHeading: "सरकारी निवेश, परिव्यय एवं वित्तपोषण अनुपात",
    annualBudgetOutlay: "वार्षिक बजट परिव्यय",
    unionBudgetRef: "केंद्रीय बजट 2024-25",
    cumulativeInvestment: "संचयी निवेश",
    cumulativeDisbursedRef: "अब तक कुल संवितरित",
    centerStateShare: "केंद्र : राज्य अनुपात",
    beneficiariesReach: "लाभार्थी पहुंच",
    disbursementArchitecture: "संवितరణ संरचना",
    entitlementsHeading: "प्रमुख नागरिक अधिकार एवं प्रत्यक्ष प्रावधान",
    eligibilityHeading: "लक्षित जनसांख्यिकी एवं पात्रता मानदंड",
    targetCohortLabel: "लक्षित समूह",
    eligibilityRulesLabel: "पात्रता नियम",
    citationsHeading: "प्रामाणिक स्रोत एवं उद्धरण",
    officialCitationLabel: "आधिकारिक उद्धरण",
    verifiedPortalBadge: "राष्ट्रीय एकीकृत नीति कोष एवं सरकारी पोर्टलों द्वारा सत्यापित",
    closeModalBtn: "योजना विवरण बंद करें",
    selectLangLabel: "Language / भाषा / மொழி / భాష:",
    roadmapTitle: "विकसित भारत @ 2047: संतृप्ति एवं व्यय प्रक्षेपवक्र",
    roadmapSubtitle: "आधिकारिक कैबिनेट स्वीकृतियों, नीति आयोग मील के पत्थरों और बजट 2024-25 पर आधारित संवादात्मक बहु-दशकीय संतृप्ति इंजन",
    overallSatLabel: "समग्र राष्ट्रीय संतृप्ति",
    projectedGdpLabel: "अनुमानित सकल घरेलू उत्पाद (GDP)",
    totalBudgetLabel: "केंद्रीय बजट परिव्यय",
    outlayGrowthLabel: "परिव्यय वृद्धि",
    saturationLevelLabel: "संतृप्ति स्तर",
    unitEntitlementLabel: "प्रति-इकाई अधिकार",
    fiscalSplitLabel: "केंद्र : राज्य वित्तीय अनुपात",
    proofActionBtn: "📜 संतृप्ति एवं परिव्यय प्रमाण (स्रोत)"
  },
  ta: {
    fontFamily: "'Noto Sans Tamil', 'Latha', 'Mukta Malar', sans-serif",
    govtOfIndia: "இந்திய அரசு • Government of India",
    nitiSubhead: "நிதி ஆயோக் & அமைச்சக வழிகாட்டுதல்கள் • 25 முதன்மைத் திட்டங்கள்",
    viksitBharatPill: "🇮🇳 விக்சித் பாரதம் 2047",
    totalOutlaySuffix: "லட்சம் கோடி மொத்த ஆண்டு ஒதுக்கீடு",
    mottoRibbon: "மக்கள் • முன்னேற்றம் • செழிப்பு",
    eyebrow: "ஒவ்வொரு குடிமகனுக்கும் அதிகாரம்",
    heroTitlePrefix: "திட்டங்கள் ஒரு ",
    heroTitleHighlight: "விக்சித் பாரதத்திற்காக",
    heroDescription: "5 முதன்மைத் தூண்களில் இந்திய அரசின் முதன்மை நலத்திட்டங்களை ஆராய்ந்து சரிபார்க்கவும். ஒவ்வொரு திட்டமும் நிதி ஒதுக்கீடுகள், மத்திய-மாநில நிதிப் பகிர்வு விகிதங்கள், பயனாளிகளின் எண்ணிக்கை மற்றும் அதிகாரப்பூர்வ மேற்கோள்களை வழங்குகிறது.",
    searchPlaceholder: "திட்டங்கள், நன்மைகள், அமைச்சகங்கள் அல்லது தகுதியைத் தேடுங்கள்...",
    popularSearchesLabel: "பிரபலமான தேடல்கள்:",
    exploreSectorsEyebrow: "துறைகளை ஆராயுங்கள்",
    exploreSectorsHeading: "பிரகாசமான நாளையை உருவாக்கும் திட்டங்களைக் கண்டறியுங்கள்",
    exploreSectorsSubheading: "விவசாயிகள் மற்றும் மாணவர்கள் முதல் தொழில்முனைவோர் மற்றும் முதியவர்கள் வரை, 5 துறைகளில் திட்டங்களை ஆராயுங்கள்.",
    showingSchemesText: (count) => `25 திட்டங்களில் ${count} காட்டப்படுகின்றன`,
    allSectorsTab: "அனைத்து 5 துறைகள் (25 திட்டங்கள்)",
    annualOutlayLabel: "ஆண்டு ஒதுக்கீடு",
    beneficiariesLabel: "பயனாளிகள்",
    estLabel: "தொடக்கம்",
    viewDetailsAction: "🔍 விவரங்கள் & மேற்கோள்கள் பார்க்க",
    noSchemesFound: (q) => `"${q}" உடன் பொருந்தும் திட்டங்கள் எதுவும் கிடைக்கவில்லை`,
    noSchemesHelp: '"பிஎம் கிசான்", "நீர்", "ஆயுஷ்மான்", "சூரிய சக்தி" அல்லது "உதவித்தொகை" போன்ற சொற்களால் தேடவும்.',
    clearFiltersBtn: "வடிகட்டிகளை நீக்கி அனைத்து திட்டங்களையும் காண்க",
    // Modal Text
    modalGovtTag: "இந்திய அரசு",
    nodalMinistryHeading: "நோடல் அமைச்சகம் & செயல்படுத்தும் முகமை",
    officialPortalBtn: "அதிகாரப்பூர்வ தளம்",
    investmentHeading: "அரசு முதலீடு, ஒதுக்கீடுகள் & நிதி விகிதங்கள்",
    annualBudgetOutlay: "ஆண்டு பட்ஜெட் ஒதுக்கீடு",
    unionBudgetRef: "மத்திய பட்ஜெட் 2024-25",
    cumulativeInvestment: "மொத்த முதலீடு",
    cumulativeDisbursedRef: "இதுவரை வழங்கப்பட்ட மொத்தத் தொகை",
    centerStateShare: "மத்திய : மாநிலப் பகிர்வு",
    beneficiariesReach: "பயனாளிகள் வரம்பு",
    disbursementArchitecture: "வழங்கல் கட்டமைப்பு",
    entitlementsHeading: "முக்கிய குடிமக்கள் உரிமைகள் & நேரடி விதிகள்",
    eligibilityHeading: "இலக்கு மக்கள் & தகுதி வரம்புகள்",
    targetCohortLabel: "இலக்குக் குழு",
    eligibilityRulesLabel: "தகுதி விதிகள்",
    citationsHeading: "அதிகாரப்பூர்வ ஆதாரங்கள் & மேற்கோள்கள்",
    officialCitationLabel: "அதிகாரப்பூர்வ மேற்கோள்",
    verifiedPortalBadge: "தேசிய கொள்கை களஞ்சியம் & போர்ட்டல்கள் மூலம் சரிபார்க்கப்பட்டது",
    closeModalBtn: "திட்ட விவரங்களை மூடு",
    selectLangLabel: "Language / भाषा / மொழி / భాష:",
    roadmapTitle: "விக்சித் பாரத் @ 2047: முழுமை மற்றும் செலவினப் பாதை",
    roadmapSubtitle: "அதிகாரப்பூர்வ மத்திய அமைச்சரவை முடிவுகள், நிதி ஆயோக் மைல்கற்கள் மற்றும் பட்ஜெட் 2024-25 அடிப்படையிலான ஊடாடும் தளம்",
    overallSatLabel: "ஒட்டுமொத்த தேசிய முழுமை",
    projectedGdpLabel: "எதிர்பார்க்கப்படும் GDP",
    totalBudgetLabel: "மத்திய பட்ஜெட் ஒதுக்கீடு",
    outlayGrowthLabel: "ஒதுக்கீடு வளர்ச்சி",
    saturationLevelLabel: "முழுமை நிலை",
    unitEntitlementLabel: "அலகு உரிமை",
    fiscalSplitLabel: "மத்திய : மாநில நிதிப் பகிர்வு",
    proofActionBtn: "📜 முழுமை & ஒதுக்கீடு ஆதாரம் (மூலம்)"
  },
  te: {
    fontFamily: "'Noto Sans Telugu', 'Gautami', 'Telugu Sangam MN', 'Vani', sans-serif",
    govtOfIndia: "భారత ప్రభుత్వం • Government of India",
    nitiSubhead: "నీతి ఆయోగ్ & మంత్రిత్వ శాఖల డైరెక్టరీ • 25 ప్రధాన జాతీయ పథకాలు",
    viksitBharatPill: "🇮🇳 వికసిత్ భారత్ 2047",
    totalOutlaySuffix: "లక్షల కోట్ల మొత్తం వార్షిక వ్యయం",
    mottoRibbon: "ప్రజలు • ప్రగతి • సమృద్ధి",
    eyebrow: "ప్రతి పౌరుడి సాధికారత",
    heroTitlePrefix: "పథకాలు ఒక ",
    heroTitleHighlight: "వికసిత్ భారత్ కోసం",
    heroDescription: "5 ప్రధాన స్తంభాలలో భారత ప్రభుత్వ ప్రధాన సంక్షేమ పథకాలను అన్వేషించండి మరియు ధృవీకరించండి. ప్రతి పథకం చట్టబద్ధమైన ఆర్థిక కేటాయింపులు, కేంద్ర-రాష్ట్ర ఆర్థిక నిష్పత్తులు, లబ్ధిదారుల సంఖ్య మరియు అధికారిక గెజిట్ ఆధారాలను అందిస్తుంది.",
    searchPlaceholder: "పథకాలు, ప్రయోజనాలు, మంత్రిత్వ శాఖలు లేదా అర్హతల కోసం వెతకండి...",
    popularSearchesLabel: "ప్రజాదరణ పొందిన శోధనలు:",
    exploreSectorsEyebrow: "రంగాలను అన్వేషించండి",
    exploreSectorsHeading: "ఉజ్వల భవిష్యత్తును నిర్మించే పథకాలను కనుగొనండి",
    exploreSectorsSubheading: "రైతులు మరియు విద్యార్థుల నుండి వ్యవస్థాపకులు మరియు సీనియర్ సిటిజన్ల వరకు, 5 ప్రధాన రంగాల పథకాలను అన్వేషించండి.",
    showingSchemesText: (count) => `25 పథకాలలో ${count} ప్రదర్శించబడుతున్నాయి`,
    allSectorsTab: "అన్ని 5 రంగాలు (25 పథకాలు)",
    annualOutlayLabel: "వార్షిక కేటాయింపు",
    beneficiariesLabel: "లబ్ధిదారులు",
    estLabel: "ప్రారంభం",
    viewDetailsAction: "🔍 వివరాలు & ఆధారాలను చూడండి",
    noSchemesFound: (q) => `"${q}" తో సరిపోలే పథకాలు ఏవీ కనుగొనబడలేదు`,
    noSchemesHelp: '"పీఎం కిసాన్", "నీరు", "ఆయుష్మాన్", "సౌర విద్యుత్" లేదా "స్కాలర్‌షిప్" వంటి పదాలతో శోధించండి.',
    clearFiltersBtn: "ఫిల్టర్లను తొలగించి అన్ని పథకాలను చూడండి",
    // Modal Text
    modalGovtTag: "భారత ప్రభుత్వం",
    nodalMinistryHeading: "నోడల్ మంత్రిత్వ శాఖ & అమలు విభాగం",
    officialPortalBtn: "అధికారిక పోర్టల్",
    investmentHeading: "ప్రభుత్వ పెట్టుబడి, కేటాయింపులు & ఆర్థిక నిష్పత్తులు",
    annualBudgetOutlay: "వార్షిక బడ్జెట్ వ్యయం",
    unionBudgetRef: "కేంద్ర బడ్జెట్ 2024-25",
    cumulativeInvestment: "మొత్తం పెట్టుబడి",
    cumulativeDisbursedRef: "ఇప్పటి వరకు పంపిణీ చేసిన మొత్తం",
    centerStateShare: "కేంద్రం : రాష్ట్రం వాటా",
    beneficiariesReach: "లబ్ధిదారుల పరిధి",
    disbursementArchitecture: "పంపిణీ వ్యవస్థ",
    entitlementsHeading: "ప్రధాన పౌర ప్రయోజనాలు & ప్రత్యక్ష కేటాయింపులు",
    eligibilityHeading: "లక్ష్య జనాభా & అర్హత ప్రమాణాలు",
    targetCohortLabel: "లక్ష్య వర్గం",
    eligibilityRulesLabel: "అర్హత నిబంధనలు",
    citationsHeading: "అధికారిక మూలాలు & ఆధారాలు",
    officialCitationLabel: "అధికారిక ఆధారం",
    verifiedPortalBadge: "జాతీయ సమగ్ర విధాన రిపోజిటరీ & ప్రభుత్వ పోర్టల్స్ ద్వారా ధృవీకరించబడింది",
    closeModalBtn: "పథకం వివరాలను మూసివేయండి",
    selectLangLabel: "Language / भाषा / மொழி / భాష:",
    roadmapTitle: "వికసిత్ భారత్ @ 2047: సంపూర్ణత మరియు వ్యయ పథం",
    roadmapSubtitle: "అధికారిక క్యాబినెట్ ఆమోదాలు, నీతి ఆయోగ్ మైలురాళ్ళు మరియు బడ్జెట్ 2024-25 ఆధారంగా రూపొందించిన ఇంటరాక్టివ్ సంతృప్త ఇంజిన్",
    overallSatLabel: "మొత్తం జాతీయ సంపూర్ణత",
    projectedGdpLabel: "అంచనా వేసిన జీడీపీ (GDP)",
    totalBudgetLabel: "కేంద్ర బడ్జెట్ వ్యయం",
    outlayGrowthLabel: "కేటాయింపుల పెరుగుదల",
    saturationLevelLabel: "సంపూర్ణత స్థాయి",
    unitEntitlementLabel: "యూనిట్ అర్హత",
    fiscalSplitLabel: "కేంద్రం : రాష్ట్రం ఆర్థిక నిష్పత్తి",
    proofActionBtn: "📜 సంపూర్ణత & కేటాయింపుల ఆధారం (మూలం)"
  }
};

// ── KaTeX Mathematical Formula Renderer with Visual Formatted Fallback ──
function MathFormulaRenderer({ formula, isDark }) {
  const containerRef = React.useRef(null);
  const [renderedWithKatex, setRenderedWithKatex] = useState(false);

  const cleanLatex = (formula || '').replace(/^\$\$|\$\$$/g, '').trim();

  React.useEffect(() => {
    let intervalId = null;
    let attempts = 0;

    const tryRender = () => {
      if (containerRef.current && window.katex && cleanLatex) {
        try {
          containerRef.current.innerHTML = '';
          window.katex.render(cleanLatex, containerRef.current, {
            throwOnError: false,
            displayMode: true,
            strict: false
          });
          setRenderedWithKatex(true);
          return true;
        } catch (e) {
          console.warn('KaTeX render fallback:', e);
        }
      }
      return false;
    };

    if (!tryRender()) {
      intervalId = setInterval(() => {
        attempts++;
        if (tryRender() || attempts > 20) {
          clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cleanLatex]);

  // Clean mathematical fallback parser when KaTeX script hasn't loaded or throws
  const renderFallback = () => {
    if (!cleanLatex) return null;

    // Detect fraction: \frac{num}{denom}
    const fracRegex = /\\frac\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]+(?:\{[^{}]*\}[^{}]*)*)\}/;
    const match = cleanLatex.match(fracRegex);

    const cleanTokens = (str) => {
      return (str || '')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\times/g, ' × ')
        .replace(/\\cdot/g, ' · ')
        .replace(/\\implies/g, ' ⟹ ')
        .replace(/\\approx/g, ' ≈ ')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\sum/g, '∑')
        .replace(/\\lim_\{([^}]+)\}/g, 'lim ($1)')
        .replace(/\\quad/g, '   ')
        .replace(/\\left\(|\\right\)/g, '')
        .replace(/\\%/g, '%')
        .replace(/\\/g, '');
    };

    if (match) {
      const idx = cleanLatex.indexOf(match[0]);
      const prefix = cleanTokens(cleanLatex.substring(0, idx));
      const num = cleanTokens(match[1]);
      const denom = cleanTokens(match[2]);
      const suffix = cleanTokens(cleanLatex.substring(idx + match[0].length));

      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '16px', fontWeight: 700 }}>
          {prefix && <span>{prefix}</span>}
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', padding: '0 6px' }}>
            <div style={{ borderBottom: `2px solid ${isDark ? '#38bdf8' : '#0284c7'}`, paddingBottom: '2px', textAlign: 'center', minWidth: '80px', color: isDark ? '#ffffff' : '#0f172a' }}>
              {num}
            </div>
            <div style={{ paddingTop: '2px', textAlign: 'center', minWidth: '80px', color: isDark ? '#ffffff' : '#0f172a' }}>
              {denom}
            </div>
          </div>
          {suffix && <span>{suffix}</span>}
        </div>
      );
    }

    const cleaned = cleanTokens(cleanLatex);
    return <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.4px' }}>{cleaned}</span>;
  };

  return (
    <div style={{
      backgroundColor: isDark ? '#081120' : '#f8fafc',
      border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
      borderRadius: '10px',
      padding: '16px 20px',
      color: isDark ? '#38bdf8' : '#0369a1',
      marginBottom: '14px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60px',
      overflowX: 'auto',
      textAlign: 'center'
    }}>
      <div ref={containerRef} style={{ width: '100%', display: renderedWithKatex ? 'block' : 'none' }} />
      {!renderedWithKatex && renderFallback()}
    </div>
  );
}

// ── Formatted Variable Symbol Component (parses subscripts like S_{2035}) ──
function FormattedSymbol({ symbol, isDark }) {
  if (!symbol) return null;
  const clean = symbol
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\%/g, '%')
    .replace(/\\/g, '');

  const subMatch = clean.match(/^([A-Za-z0-9_]+)_\{?([A-Za-z0-9]+)\}?(.*)$/);
  if (subMatch) {
    const main = subMatch[1];
    const sub = subMatch[2];
    const rest = subMatch[3];
    return (
      <code style={{
        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
        padding: '3px 8px',
        borderRadius: '6px',
        color: isDark ? '#f59e0b' : '#b45309',
        fontWeight: 800,
        fontSize: '11.5px',
        display: 'inline-flex',
        alignItems: 'baseline'
      }}>
        <span>{main}</span>
        <sub style={{ fontSize: '9px', fontWeight: 900, marginLeft: '1px' }}>{sub}</sub>
        {rest && <span style={{ marginLeft: '4px' }}>{rest}</span>}
      </code>
    );
  }

  return (
    <code style={{
      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
      padding: '3px 8px',
      borderRadius: '6px',
      color: isDark ? '#f59e0b' : '#b45309',
      fontWeight: 800,
      fontSize: '11.5px'
    }}>
      {clean}
    </code>
  );
}

export default function ExistingSchemesShowcase() {
  const { theme, language, setLanguage } = useApp();
  const isDark = theme === 'dark';

  // Local active language state (defaults to context language or 'en', supporting en, hi, ta, te)
  const [activeLang, setActiveLang] = useState(language === 'te' ? 'te' : (language === 'ta' ? 'ta' : (language === 'hi' ? 'hi' : 'en')));

  // Keep activeLang in sync whenever global language changes
  React.useEffect(() => {
    if (language) {
      setActiveLang(language);
    }
  }, [language]);

  const handleLanguageChange = (langCode) => {
    setActiveLang(langCode);
    if (setLanguage) {
      setLanguage(langCode);
    }
  };

  const tUI = UI_TRANSLATIONS[activeLang] || UI_TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [activeModalScheme, setActiveModalScheme] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [selectedRoadmapYear, setSelectedRoadmapYear] = useState('2024');
  const [selectedRoadmapProof, setSelectedRoadmapProof] = useState(null);
  const [selectedMacroProof, setSelectedMacroProof] = useState(null);
  const [activeMacroMetricAudit, setActiveMacroMetricAudit] = useState('gdp');
  const [hoveredMacroTrioKey, setHoveredMacroTrioKey] = useState(null);
  const [hoveredHeaderMacroKey, setHoveredHeaderMacroKey] = useState(null);

  const popularSearches = [
    { label: 'PM Kisan', q: 'PM-KISAN' },
    { label: 'Ayushman Bharat', q: 'Ayushman Bharat' },
    { label: 'PM Awas Yojana', q: 'PM Awas Yojana' },
    { label: 'Jal Jeevan Mission', q: 'Jal Jeevan Mission' },
    { label: 'PM Mudra', q: 'PM MUDRA' }
  ];

  // Helper for localized scheme fields across all 4 languages
  const getSchemeName = (scheme) => {
    const tr = SCHEME_TRANSLATIONS[scheme.id]?.[activeLang];
    if (tr?.name) return tr.name;
    if (activeLang === 'te' && scheme.name_te) return scheme.name_te;
    if (activeLang === 'ta' && scheme.name_ta) return scheme.name_ta;
    if (activeLang === 'hi' && scheme.name_hi) return scheme.name_hi;
    return scheme.name;
  };

  const getSchemeFullName = (scheme) => {
    const tr = SCHEME_TRANSLATIONS[scheme.id]?.[activeLang];
    if (tr?.fullName) return tr.fullName;
    if (activeLang === 'te' && scheme.fullName_te) return scheme.fullName_te;
    if (activeLang === 'ta' && scheme.fullName_ta) return scheme.fullName_ta;
    if (activeLang === 'hi' && scheme.fullName_hi) return scheme.fullName_hi;
    return scheme.fullName;
  };

  const getSchemeMinistry = (scheme) => {
    const tr = SCHEME_TRANSLATIONS[scheme.id]?.[activeLang];
    if (tr?.ministry) return tr.ministry;
    return scheme.ministry;
  };

  const getSchemeShortDesc = (scheme) => {
    const tr = SCHEME_TRANSLATIONS[scheme.id]?.[activeLang];
    if (tr?.shortDesc) return tr.shortDesc;
    if (activeLang === 'te' && scheme.shortDesc_te) return scheme.shortDesc_te;
    if (activeLang === 'ta' && scheme.shortDesc_ta) return scheme.shortDesc_ta;
    if (activeLang === 'hi' && scheme.shortDesc_hi) return scheme.shortDesc_hi;
    return scheme.shortDesc;
  };

  const getSchemeBeneficiaries = (scheme) => {
    const tr = SCHEME_TRANSLATIONS[scheme.id]?.[activeLang];
    if (tr?.beneficiariesCount) return tr.beneficiariesCount;
    return scheme.beneficiariesCount;
  };

  const getSectorName = (sector) => {
    if (activeLang === 'te' && sector.name_te) return sector.name_te;
    if (activeLang === 'ta' && sector.name_ta) return sector.name_ta;
    if (activeLang === 'hi' && sector.name_hi) return sector.name_hi;
    return sector.name;
  };

  const getSectorBadge = (sector) => {
    if (activeLang === 'te' && sector.badge_te) return sector.badge_te;
    if (activeLang === 'ta' && sector.badge_ta) return sector.badge_ta;
    if (activeLang === 'hi' && sector.badge_hi) return sector.badge_hi;
    return sector.badge;
  };

  // Filter schemes based on search query and selected sector
  const filteredSchemes = useMemo(() => {
    return VIKSIT_SCHEMES.filter(scheme => {
      const matchesSector = selectedSector === 'all' || scheme.sectorId === selectedSector;
      if (!matchesSector) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        scheme.name.toLowerCase().includes(q) ||
        scheme.fullName.toLowerCase().includes(q) ||
        (scheme.fullName_hi && scheme.fullName_hi.includes(q)) ||
        (scheme.fullName_te && scheme.fullName_te.includes(q)) ||
        (scheme.fullName_ta && scheme.fullName_ta.includes(q)) ||
        scheme.ministry.toLowerCase().includes(q) ||
        scheme.shortDesc.toLowerCase().includes(q) ||
        scheme.targetGroup.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedSector]);

  // Quick statistics
  const totalAnnualOutlay = useMemo(() => {
    return VIKSIT_SCHEMES.reduce((acc, s) => acc + (s.annualOutlayCr || 0), 0);
  }, []);

  return (
    <div style={{
      fontFamily: tUI.fontFamily,
      transition: 'font-family 0.2s ease'
    }}>
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER (WITH INDIA GATE BACKGROUND & GOVT OF INDIA LOGO)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '32px',
        border: isDark ? '1px solid #1e2e4a' : '1px solid #fed7aa',
        // Background: In dark mode uses dark hero gradient + India Gate;
        // In light mode uses lightmodebg.png + india_gate_hero.jpg with warm sunset overlay
        background: isDark
          ? `linear-gradient(135deg, rgba(8, 16, 32, 0.94) 0%, rgba(13, 24, 46, 0.95) 50%, rgba(20, 16, 35, 0.96) 100%), url("/images/india_gate_hero.jpg") center center / cover no-repeat`
          : `linear-gradient(135deg, rgba(255, 250, 245, 0.86) 0%, rgba(255, 247, 237, 0.88) 45%, rgba(254, 243, 199, 0.85) 100%), url("/images/lightmodebg.png") center 35% / cover no-repeat, url("/images/india_gate_hero.jpg") center center / cover no-repeat`,
        boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 36px rgba(234, 88, 12, 0.10)',
        padding: '34px 34px 40px'
      }}>
        {/* Subtle Ashoka Chakra & Decorative Tricolor Aura */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(234, 88, 12, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* ── Top Emblem, Language/Font Switcher & Govt Metadata Bar ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(234, 88, 12, 0.18)',
          paddingBottom: '18px',
          marginBottom: '26px'
        }}>
          {/* Government of India Official Logo (Matching Main Page) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '12px',
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.85)',
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
              border: isDark ? '1px solid #334155' : '1px solid #fed7aa'
            }}>
              <img
                src="/images/govt_logo.png"
                alt="Government of India Logo"
                onError={(e) => { e.currentTarget.src = "/images/emblem.png"; }}
                style={{
                  height: '52px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: isDark ? 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))' : 'none'
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: isDark ? '#ffffff' : '#0c2340', letterSpacing: '0.4px' }}>
                {tUI.govtOfIndia}
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: isDark ? '#fbbf24' : '#9a3412', marginTop: '1px' }}>
                {tUI.nitiSubhead}
              </div>
            </div>
          </div>

          {/* Right Header Controls: Interactive Language & Font Switcher Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Language & Font Selector Buttons (English, Hindi, Tamil, Telugu) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isDark ? '#0b1324' : '#ffffff',
              borderRadius: '24px',
              padding: '3px',
              border: isDark ? '1px solid #243552' : '1px solid #fdba74',
              boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(234, 88, 12, 0.12)'
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 900,
                color: isDark ? '#94a3b8' : '#78350f',
                padding: '0 8px',
                textTransform: 'uppercase'
              }}>
                🌐 FONT / భాష
              </span>

              {/* EN */}
              <button
                onClick={() => handleLanguageChange('en')}
                style={{
                  backgroundColor: activeLang === 'en' ? '#ea580c' : 'transparent',
                  color: activeLang === 'en' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  border: 'none',
                  borderRadius: '18px',
                  padding: '5px 11px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.15s ease'
                }}
              >
                English
              </button>

              {/* HI */}
              <button
                onClick={() => handleLanguageChange('hi')}
                style={{
                  backgroundColor: activeLang === 'hi' ? '#ea580c' : 'transparent',
                  color: activeLang === 'hi' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  border: 'none',
                  borderRadius: '18px',
                  padding: '5px 11px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Devanagari', sans-serif",
                  transition: 'all 0.15s ease'
                }}
              >
                हिन्दी
              </button>

              {/* TA */}
              <button
                onClick={() => handleLanguageChange('ta')}
                style={{
                  backgroundColor: activeLang === 'ta' ? '#ea580c' : 'transparent',
                  color: activeLang === 'ta' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  border: 'none',
                  borderRadius: '18px',
                  padding: '5px 11px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Tamil', sans-serif",
                  transition: 'all 0.15s ease'
                }}
              >
                தமிழ்
              </button>

              {/* TE */}
              <button
                onClick={() => handleLanguageChange('te')}
                style={{
                  backgroundColor: activeLang === 'te' ? '#ea580c' : 'transparent',
                  color: activeLang === 'te' ? '#ffffff' : (isDark ? '#cbd5e1' : '#475569'),
                  border: 'none',
                  borderRadius: '18px',
                  padding: '5px 11px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans Telugu', sans-serif",
                  transition: 'all 0.15s ease'
                }}
              >
                తెలుగు
              </button>
            </div>

            {/* Outlay Pill */}
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              color: isDark ? '#38bdf8' : '#c2410c',
              border: isDark ? '1px solid #38bdf840' : '1px solid #fed7aa',
              whiteSpace: 'nowrap'
            }}>
              ₹{(totalAnnualOutlay / 100000).toFixed(2)} {tUI.totalOutlaySuffix}
            </span>
          </div>
        </div>

        {/* Hero Central Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
          {/* Vertical Tricolor Accent Ribbon */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '16px',
            borderRight: isDark ? '1px solid #1e293b' : '1px solid #fdba74'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <div style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '2.5px',
              color: isDark ? '#94a3b8' : '#9a3412',
              marginTop: '6px'
            }}>
              {tUI.mottoRibbon}
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 900,
              color: '#ea580c',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '6px'
            }}>
              {tUI.eyebrow}
            </div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 10px',
              color: isDark ? '#ffffff' : '#0c2340'
            }}>
              {tUI.heroTitlePrefix}
              <span style={{
                color: isDark ? '#4ade80' : '#15803d',
                fontStyle: 'italic',
                borderBottom: `3px solid ${isDark ? '#4ade80' : '#15803d'}`
              }}>
                {tUI.heroTitleHighlight}
              </span>
            </h1>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: isDark ? '#cbd5e1' : '#475569',
              maxWidth: '820px',
              margin: '0 0 24px'
            }}>
              {tUI.heroDescription}
            </p>

            {/* Search Input Bar (Matching Image 2 Style) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isDark ? '#0a101f' : '#ffffff',
              borderRadius: '40px',
              border: isDark ? '1.5px solid #334155' : '1.5px solid #fed7aa',
              padding: '6px 8px 6px 20px',
              maxWidth: '720px',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 6px 20px rgba(234, 88, 12, 0.12)',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ fontSize: '18px', marginRight: '10px', color: isDark ? '#94a3b8' : '#9a3412' }}>🔍</span>
              <input
                type="text"
                placeholder={tUI.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: isDark ? '#ffffff' : '#0f172a',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: tUI.fontFamily
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '0 8px'
                  }}
                >
                  ✕
                </button>
              )}
              <button
                onClick={() => {}}
                style={{
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                ➔
              </button>
            </div>

            {/* Popular Searches Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: isDark ? '#94a3b8' : '#78350f' }}>
                {tUI.popularSearchesLabel}
              </span>
              {popularSearches.map((ps, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(ps.q)}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffedd5',
                    color: isDark ? '#e2e8f0' : '#9a3412',
                    border: isDark ? '1px solid #334155' : '1px solid #fed7aa',
                    borderRadius: '16px',
                    padding: '3px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: tUI.fontFamily,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#fdba74';
                    e.currentTarget.style.color = isDark ? '#ffffff' : '#7c2d12';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#ffedd5';
                    e.currentTarget.style.color = isDark ? '#e2e8f0' : '#9a3412';
                  }}
                >
                  {ps.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2047 VIKSIT BHARAT SATURATION MILESTONE TRACKER & TIMELINE
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        backgroundColor: isDark ? '#0b1329' : '#ffffff',
        border: isDark ? '1px solid #1e3a5f' : '1px solid #fed7aa',
        borderRadius: '20px',
        padding: '24px 26px',
        marginBottom: '32px',
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 28px rgba(234, 88, 12, 0.08)'
      }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: isDark ? '1px solid #1e293b' : '1px solid #fed7aa'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 900,
              color: '#ea580c',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '4px'
            }}>
              <span>🇮🇳</span>
              <span>VIKSIT BHARAT 2047 ROADMAP ENGINE</span>
            </div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 900,
              color: isDark ? '#ffffff' : '#0c2340',
              margin: '0 0 4px'
            }}>
              {tUI.roadmapTitle}
            </h2>
            <p style={{
              fontSize: '13px',
              color: isDark ? '#94a3b8' : '#64748b',
              margin: 0
            }}>
              {tUI.roadmapSubtitle}
            </p>
          </div>

          {/* Active Macro Summary Badges */}
          {(() => {
            const activeHorizon = ROADMAP_YEARS.find(r => r.year === selectedRoadmapYear) || ROADMAP_YEARS[0];
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {/* 1. National Composite Saturation Card */}
                <div
                  onClick={() => {
                    setActiveMacroMetricAudit('saturation');
                    setSelectedMacroProof(activeHorizon);
                  }}
                  onMouseEnter={() => setHoveredHeaderMacroKey('saturation')}
                  onMouseLeave={() => setHoveredHeaderMacroKey(null)}
                  title="Click to inspect mathematical proof & sources for National Composite Saturation"
                  style={{
                    backgroundColor: isDark ? '#111e38' : '#f0fdf4',
                    border: hoveredHeaderMacroKey === 'saturation'
                      ? '1.5px solid #10b981'
                      : (isDark ? '1px solid #10b98140' : '1px solid #86efac'),
                    borderRadius: '12px',
                    padding: '8px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredHeaderMacroKey === 'saturation' ? 'translateY(-2px) scale(1.03)' : 'scale(1)',
                    boxShadow: hoveredHeaderMacroKey === 'saturation'
                      ? '0 0 16px rgba(16, 185, 129, 0.55), 0 4px 12px rgba(0,0,0,0.15)'
                      : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>{tUI.overallSatLabel}</span>
                    <span style={{ fontSize: '8px', opacity: hoveredHeaderMacroKey === 'saturation' ? 1 : 0.6 }}>🔍</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: isDark ? '#ffffff' : '#065f46' }}>
                    {activeHorizon.overallSaturation}%
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#10b981', fontWeight: 700, marginTop: '1px' }}>
                    Click for proof ↗
                  </div>
                </div>

                {/* 2. Nominal GDP Benchmark Card */}
                <div
                  onClick={() => {
                    setActiveMacroMetricAudit('gdp');
                    setSelectedMacroProof(activeHorizon);
                  }}
                  onMouseEnter={() => setHoveredHeaderMacroKey('gdp')}
                  onMouseLeave={() => setHoveredHeaderMacroKey(null)}
                  title="Click to inspect mathematical proof & sources for Nominal GDP Benchmark ($10T in 2035)"
                  style={{
                    backgroundColor: isDark ? '#111e38' : '#f0f9ff',
                    border: hoveredHeaderMacroKey === 'gdp'
                      ? '1.5px solid #0284c7'
                      : (isDark ? '1px solid #0284c740' : '1px solid #7dd3fc'),
                    borderRadius: '12px',
                    padding: '8px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredHeaderMacroKey === 'gdp' ? 'translateY(-2px) scale(1.03)' : 'scale(1)',
                    boxShadow: hoveredHeaderMacroKey === 'gdp'
                      ? '0 0 16px rgba(2, 132, 199, 0.55), 0 4px 12px rgba(0,0,0,0.15)'
                      : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>{tUI.projectedGdpLabel}</span>
                    <span style={{ fontSize: '8px', opacity: hoveredHeaderMacroKey === 'gdp' ? 1 : 0.6 }}>🔍</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: isDark ? '#ffffff' : '#0369a1' }}>
                    {activeHorizon.nationalGdp}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#0284c7', fontWeight: 700, marginTop: '1px' }}>
                    Click for proof ↗
                  </div>
                </div>

                {/* 3. Union Budget Expenditure Card */}
                <div
                  onClick={() => {
                    setActiveMacroMetricAudit('budget');
                    setSelectedMacroProof(activeHorizon);
                  }}
                  onMouseEnter={() => setHoveredHeaderMacroKey('budget')}
                  onMouseLeave={() => setHoveredHeaderMacroKey(null)}
                  title="Click to inspect mathematical proof & sources for Union Budget Expenditure"
                  style={{
                    backgroundColor: isDark ? '#111e38' : '#fff7ed',
                    border: hoveredHeaderMacroKey === 'budget'
                      ? '1.5px solid #ea580c'
                      : (isDark ? '1px solid #ea580c40' : '1px solid #fdba74'),
                    borderRadius: '12px',
                    padding: '8px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredHeaderMacroKey === 'budget' ? 'translateY(-2px) scale(1.03)' : 'scale(1)',
                    boxShadow: hoveredHeaderMacroKey === 'budget'
                      ? '0 0 16px rgba(234, 88, 12, 0.55), 0 4px 12px rgba(0,0,0,0.15)'
                      : 'none',
                    position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>{tUI.totalBudgetLabel}</span>
                    <span style={{ fontSize: '8px', opacity: hoveredHeaderMacroKey === 'budget' ? 1 : 0.6 }}>🔍</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: isDark ? '#ffffff' : '#c2410c' }}>
                    {activeHorizon.budgetTotal}
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#ea580c', fontWeight: 700, marginTop: '1px' }}>
                    Click for proof ↗
                  </div>
                </div>

                {/* Primary National Engine Proof & Source Action Button */}
                <button
                  onClick={() => setSelectedMacroProof(activeHorizon)}
                  style={{
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(234, 88, 12, 0.55)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.4)';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>📜</span>
                  <span>Saturation & Outlay Proof (Source)</span>
                </button>
              </div>
            );
          })()}
        </div>

        {/* 4-Milestone Interactive Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '18px'
        }}>
          {ROADMAP_YEARS.map(yr => {
            const isSelected = selectedRoadmapYear === yr.year;
            const labelText = activeLang === 'hi' ? yr.label_hi : (activeLang === 'ta' ? yr.label_ta : (activeLang === 'te' ? yr.label_te : yr.label));

            return (
              <button
                key={yr.year}
                onClick={() => setSelectedRoadmapYear(yr.year)}
                style={{
                  backgroundColor: isSelected
                    ? (isDark ? '#1e2e4a' : '#fff7ed')
                    : (isDark ? '#0f172a' : '#f8fafc'),
                  border: isSelected
                    ? `2px solid ${yr.color}`
                    : (isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'),
                  borderRadius: '16px',
                  padding: '16px 14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? `0 8px 24px ${yr.color}25` : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Badge & Year */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: isSelected ? yr.color : (isDark ? '#ffffff' : '#0c2340')
                  }}>
                    {yr.year}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? yr.color : (isDark ? '#1e293b' : '#e2e8f0'),
                    color: isSelected ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
                  }}>
                    {yr.overallSaturation}% Sat.
                  </span>
                </div>

                {/* Milestone Subtitle */}
                <div style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: isDark ? '#e2e8f0' : '#1e293b',
                  marginBottom: '8px',
                  lineHeight: 1.3
                }}>
                  {labelText}
                </div>

                {/* Saturation Micro Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: `${yr.overallSaturation}%`,
                    height: '100%',
                    backgroundColor: yr.color,
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Macro Target Pills */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isDark ? '#94a3b8' : '#64748b'
                }}>
                  <span>GDP: {yr.nationalGdp}</span>
                  <span>Budget: {yr.budgetTotal}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Milestone Description Ribbon with Interactive Audit Proof Button */}
        {(() => {
          const currentHorizon = ROADMAP_YEARS.find(r => r.year === selectedRoadmapYear) || ROADMAP_YEARS[0];
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              backgroundColor: isDark ? '#111c33' : '#f0fdf4',
              border: isDark ? '1px solid #1e3a5f' : '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '12.5px',
              color: isDark ? '#cbd5e1' : '#166534',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                <div>
                  <strong>{selectedRoadmapYear} Strategy: </strong>
                  {currentHorizon.tagline}
                </div>
              </div>

              <button
                onClick={() => setSelectedMacroProof(currentHorizon)}
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                    : 'linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '12px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(2, 132, 199, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.22)';
                }}
              >
                <span style={{ fontSize: '15px' }}>📜</span>
                <span>Audit {selectedRoadmapYear} Saturation & Outlay Proof (Source)</span>
                <span>➔</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTOR SELECTION TABS (5 CORE SECTORS + ALL)
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {tUI.exploreSectorsEyebrow}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: isDark ? '#ffffff' : '#0c2340', margin: '2px 0 0' }}>
              {tUI.exploreSectorsHeading}
            </h2>
            <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', margin: '3px 0 0' }}>
              {tUI.exploreSectorsSubheading}
            </p>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#38bdf8' : '#0284c7' }}>
            {tUI.showingSchemesText(filteredSchemes.length)}
          </div>
        </div>

        {/* Sector Pill Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          <button
            onClick={() => setSelectedSector('all')}
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: selectedSector === 'all'
                ? (isDark ? '#38bdf8' : '#0c2340')
                : (isDark ? '#111c33' : '#ffffff'),
              color: selectedSector === 'all'
                ? (isDark ? '#000000' : '#ffffff')
                : (isDark ? '#cbd5e1' : '#334155'),
              border: selectedSector === 'all'
                ? 'none'
                : (isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0'),
              fontWeight: 800,
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: tUI.fontFamily,
              boxShadow: selectedSector === 'all'
                ? '0 4px 14px rgba(0,0,0,0.2)'
                : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🇮🇳</span>
            <span>{tUI.allSectorsTab}</span>
          </button>

          {VIKSIT_SECTORS.map(sec => {
            const isSelected = selectedSector === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSector(sec.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isSelected
                    ? sec.themeColor
                    : (isDark ? '#111c33' : '#ffffff'),
                  color: isSelected
                    ? '#ffffff'
                    : (isDark ? '#cbd5e1' : '#334155'),
                  border: isSelected
                    ? 'none'
                    : (isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0'),
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  fontFamily: tUI.fontFamily,
                  boxShadow: isSelected
                    ? `0 6px 18px ${sec.themeColor}40`
                    : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px' }}>{sec.icon}</span>
                  <span style={{ textAlign: 'left', lineHeight: 1.2 }}>{getSectorName(sec)}</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : (isDark ? '#1e293b' : '#f1f5f9'),
                  color: isSelected ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b')
                }}>
                  5
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCHEMES GRID: 5 SCHEMES PER SECTOR WITH HOVER-TO-RAISE & GRAPHICS
      ══════════════════════════════════════════════════════════════════════ */}
      {filteredSchemes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: isDark ? '#111c33' : '#ffffff',
          borderRadius: '16px',
          border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
            {tUI.noSchemesFound(searchQuery)}
          </h3>
          <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
            {tUI.noSchemesHelp}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSector('all'); }}
            style={{
              backgroundColor: '#ea580c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: tUI.fontFamily
            }}
          >
            {tUI.clearFiltersBtn}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredSchemes.map(scheme => {
            const sector = VIKSIT_SECTORS.find(sec => sec.id === scheme.sectorId) || VIKSIT_SECTORS[0];
            const isHovered = hoveredCardId === scheme.id;

            return (
              <div
                key={scheme.id}
                onMouseEnter={() => setHoveredCardId(scheme.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => setActiveModalScheme(scheme)}
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  border: isHovered
                    ? `1.5px solid ${sector.themeColor}`
                    : (isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0'),
                  borderRadius: '18px',
                  padding: '22px',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isHovered
                    ? (isDark ? `0 16px 32px -8px ${sector.themeColor}35` : '0 16px 32px -8px rgba(0,0,0,0.12)')
                    : (isDark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.03)'),
                  transform: isHovered ? 'translateY(-7px)' : 'translateY(0)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Sector Arched Header Accent */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  backgroundColor: sector.themeColor
                }} />

                <div>
                  {/* Sector Badge & Launch Year */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: isDark ? `${sector.themeColor}25` : sector.lightBg,
                      color: sector.themeColor,
                      padding: '3px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: 800,
                      border: `1px solid ${sector.borderCol}`
                    }}>
                      <span>{sector.icon}</span>
                      <span>{getSectorBadge(sector)}</span>
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b' }}>
                      {tUI.estLabel} {scheme.launchYear}
                    </div>
                  </div>

                  {/* Scheme Title & Ministry */}
                  <h3 style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    color: isDark ? '#ffffff' : '#0c2340',
                    margin: '0 0 4px',
                    lineHeight: 1.3
                  }}>
                    {getSchemeName(scheme)}
                  </h3>

                  <div style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: isDark ? '#38bdf8' : '#0369a1',
                    marginBottom: '10px',
                    lineHeight: 1.3
                  }}>
                    {getSchemeFullName(scheme)}
                  </div>

                  <div style={{
                    fontSize: '11px',
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>🏛️</span>
                    <span style={{ fontWeight: 600 }}>{getSchemeMinistry(scheme)}</span>
                  </div>

                  {/* Short Description */}
                  <p style={{
                    fontSize: '12.5px',
                    lineHeight: 1.55,
                    color: isDark ? '#cbd5e1' : '#475569',
                    margin: '0 0 16px'
                  }}>
                    {getSchemeShortDesc(scheme)}
                  </p>
                </div>

                {/* Quantitative Roadmap Dashboard for Selected Horizon */}
                {(() => {
                  const roadmap = getSchemeRoadmap(scheme.id, scheme.annualOutlayCr);
                  const yearMetrics = roadmap[selectedRoadmapYear] || roadmap['2024'];
                  const isBaseline = selectedRoadmapYear === '2024';

                  return (
                    <div>
                      {/* 4-Metric Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        backgroundColor: isDark ? '#070d19' : '#f8fafc',
                        padding: '11px 12px',
                        borderRadius: '12px',
                        border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
                        marginBottom: '10px'
                      }}>
                        {/* 1. Outlay for Selected Year */}
                        <div>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                            {selectedRoadmapYear} {tUI.annualOutlayLabel}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 900, color: sector.themeColor, marginTop: '2px' }}>
                            ₹{yearMetrics.outlayCr.toLocaleString('en-IN')} Cr
                          </div>
                        </div>

                        {/* 2. Outlay Growth Increment */}
                        <div>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                            {tUI.outlayGrowthLabel}
                          </div>
                          <div style={{
                            fontSize: '11.5px',
                            fontWeight: 900,
                            color: isBaseline ? (isDark ? '#94a3b8' : '#64748b') : '#10b981',
                            marginTop: '2px'
                          }}>
                            {isBaseline ? 'Baseline Ref' : `+${yearMetrics.outlayGrowthPct}% (+₹${(yearMetrics.outlayDeltaCr / 1000).toFixed(1)}k Cr)`}
                          </div>
                        </div>

                        {/* 3. Beneficiaries Reach */}
                        <div style={{ gridColumn: 'span 2', borderTop: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', paddingTop: '6px' }}>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                            {tUI.beneficiariesLabel}
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#e2e8f0' : '#1e293b', marginTop: '2px' }}>
                            {yearMetrics.beneficiaries}
                          </div>
                        </div>

                        {/* 4. Unit Entitlement / Fiscal Split */}
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: isDark ? '#94a3b8' : '#64748b', borderTop: isDark ? '1px solid #1e293b20' : '1px solid #e2e8f080', paddingTop: '4px' }}>
                          <span><strong>Split:</strong> {yearMetrics.fiscalSplit}</span>
                          <span><strong>Rate:</strong> {yearMetrics.unitCost}</span>
                        </div>
                      </div>

                      {/* Saturation Bar Indicator */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                            {tUI.saturationLevelLabel} ({selectedRoadmapYear})
                          </span>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: 900,
                            color: yearMetrics.saturationPct >= 100 ? '#10b981' : (yearMetrics.saturationPct >= 80 ? '#0284c7' : '#ea580c')
                          }}>
                            {yearMetrics.saturationPct}%
                          </span>
                        </div>
                        {/* Progress bar container */}
                        <div style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min(100, yearMetrics.saturationPct)}%`,
                            height: '100%',
                            backgroundColor: yearMetrics.saturationPct >= 100 ? '#10b981' : (yearMetrics.saturationPct >= 80 ? '#0284c7' : '#ea580c'),
                            borderRadius: '3px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>

                      {/* Dedicated Proof Button & View Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoadmapProof({
                              scheme,
                              roadmap,
                              yearMetrics,
                              year: selectedRoadmapYear,
                              proof: roadmap.proof
                            });
                          }}
                          style={{
                            background: isDark
                              ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.28) 0%, rgba(30, 58, 138, 0.38) 100%)'
                              : 'linear-gradient(135deg, #e0f2fe 0%, #f1f5f9 100%)',
                            color: isDark ? '#38bdf8' : '#0369a1',
                            border: isDark ? '1.5px solid #0284c7' : '1.5px solid #0284c7',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: isDark ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 2px 8px rgba(2, 132, 199, 0.15)',
                            transition: 'all 0.18s ease',
                            width: '100%'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-1.5px)';
                            e.currentTarget.style.boxShadow = isDark ? '0 6px 16px rgba(2, 132, 199, 0.45)' : '0 4px 14px rgba(2, 132, 199, 0.25)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 2px 8px rgba(2, 132, 199, 0.15)';
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>📜</span>
                          <span>{tUI.proofActionBtn}</span>
                        </button>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '11px',
                          fontWeight: 800,
                          color: sector.themeColor,
                          paddingTop: '2px'
                        }}>
                          <span>{tUI.viewDetailsAction}</span>
                          <span style={{
                            transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                            transition: 'transform 0.15s ease'
                          }}>
                            ➔
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SCHEME DETAILS MODAL (ALL DETAILS, INVESTMENT & CITATIONS)
      ══════════════════════════════════════════════════════════════════════ */}
      {activeModalScheme && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.82)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(6px)',
          fontFamily: tUI.fontFamily
        }}>
          <div style={{
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
            border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '820px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              paddingBottom: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#ea580c',
                    color: '#ffffff'
                  }}>
                    {tUI.modalGovtTag}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: isDark ? '#38bdf8' : '#0284c7',
                    backgroundColor: isDark ? '#0c2340' : '#e0f2fe',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {activeModalScheme.schemeType}
                  </span>
                  <span style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {tUI.estLabel} {activeModalScheme.launchYear}
                  </span>
                </div>

                <h1 style={{ fontSize: '24px', fontWeight: 900, color: isDark ? '#ffffff' : '#0c2340', margin: '0 0 4px' }}>
                  {getSchemeName(activeModalScheme)}
                </h1>
                <div style={{ fontSize: '14px', fontWeight: 700, color: isDark ? '#38bdf8' : '#0369a1' }}>
                  {getSchemeFullName(activeModalScheme)}
                </div>
              </div>

              <button
                onClick={() => setActiveModalScheme(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '22px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Sponsoring Ministry Banner */}
            <div style={{
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>
                  {tUI.nodalMinistryHeading}
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginTop: '2px' }}>
                  {getSchemeMinistry(activeModalScheme)} • {activeModalScheme.nodalAgency}
                </div>
              </div>

              {activeModalScheme.officialUrl && (
                <a
                  href={activeModalScheme.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🌐 {tUI.officialPortalBtn}</span>
                  <span>↗</span>
                </a>
              )}
            </div>

            {/* 1. Government Investment & Fiscal Outlay Section */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💰</span>
                <span>{tUI.investmentHeading}</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <div style={{
                  backgroundColor: isDark ? '#06281e' : '#ecfdf5',
                  border: isDark ? '1px solid #059669' : '1px solid #a7f3d0',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>{tUI.annualBudgetOutlay}</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#ffffff' : '#065f46', marginTop: '2px' }}>
                    ₹{activeModalScheme.annualOutlayCr.toLocaleString('en-IN')} Cr
                  </div>
                  <div style={{ fontSize: '10px', color: isDark ? '#a7f3d0' : '#047857' }}>{tUI.unionBudgetRef}</div>
                </div>

                <div style={{
                  backgroundColor: isDark ? '#111c33' : '#f0f9ff',
                  border: isDark ? '1px solid #0284c7' : '1px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>{tUI.cumulativeInvestment}</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#ffffff' : '#0369a1', marginTop: '2px' }}>
                    ₹{(activeModalScheme.cumulativeOutlayCr / 100000).toFixed(2)} Lakh Cr
                  </div>
                  <div style={{ fontSize: '10px', color: isDark ? '#bae6fd' : '#075985' }}>{tUI.cumulativeDisbursedRef}</div>
                </div>

                <div style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>{tUI.centerStateShare}</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '4px' }}>
                    {activeModalScheme.centerStateRatio}
                  </div>
                </div>

                <div style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b' }}>{tUI.beneficiariesReach}</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: isDark ? '#ffffff' : '#0f172a', marginTop: '4px' }}>
                    {getSchemeBeneficiaries(activeModalScheme)}
                  </div>
                </div>
              </div>

              {/* Funding Mechanism */}
              <div style={{
                backgroundColor: isDark ? '#070d19' : '#f8fafc',
                border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: isDark ? '#cbd5e1' : '#334155'
              }}>
                <strong>{tUI.disbursementArchitecture}: </strong> {activeModalScheme.fundingMechanism}
              </div>
            </div>

            {/* 2. Key Citizen Entitlements & Scheme Provisions */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: isDark ? '#38bdf8' : '#0284c7', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯</span>
                <span>{tUI.entitlementsHeading}</span>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                lineHeight: 1.55,
                color: isDark ? '#e2e8f0' : '#334155'
              }}>
                {activeModalScheme.keyBenefits.map((kb, kIdx) => (
                  <li key={kIdx}>{kb}</li>
                ))}
              </ul>
            </div>

            {/* 3. Target Demographics & Eligibility Criteria */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: isDark ? '#fbbf24' : '#d97706', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>👥</span>
                <span>{tUI.eligibilityHeading}</span>
              </div>
              <div style={{
                backgroundColor: isDark ? '#070d19' : '#fffbeb',
                border: isDark ? '1px solid #1e2e4a' : '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '12.5px',
                lineHeight: 1.6,
                color: isDark ? '#cbd5e1' : '#78350f'
              }}>
                <div><strong>{tUI.targetCohortLabel}:</strong> {activeModalScheme.targetGroup}</div>
                <div style={{ marginTop: '6px' }}><strong>{tUI.eligibilityRulesLabel}:</strong> {activeModalScheme.eligibility}</div>
              </div>
            </div>

            {/* 4. Authoritative Citations & Source Documentation */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 900, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏛️</span>
                <span>{tUI.citationsHeading}</span>
              </div>
              <div style={{
                backgroundColor: isDark ? '#1e1b4b20' : '#f5f3ff',
                border: isDark ? '1px solid #4338ca' : '1px solid #ddd6fe',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '12px',
                color: isDark ? '#c7d2fe' : '#4338ca',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '20px' }}>📚</span>
                <div>
                  <strong>{tUI.officialCitationLabel}: </strong> {activeModalScheme.citation}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                {tUI.verifiedPortalBadge}
              </div>
              <button
                onClick={() => setActiveModalScheme(null)}
                style={{
                  backgroundColor: isDark ? '#38bdf8' : '#0c2340',
                  color: isDark ? '#000000' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: tUI.fontFamily
                }}
              >
                {tUI.closeModalBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STATUTORY SATURATION & OUTLAY PROOF MODAL (OFFICIAL AUDIT PROOF)
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedRoadmapProof && (() => {
        const { scheme, roadmap, yearMetrics, year, proof } = selectedRoadmapProof;
        const schemeName = getSchemeName(scheme);
        const sectorThemeColor = VIKSIT_SECTORS.find(s => s.id === scheme.sectorId)?.themeColor || '#ea580c';

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px',
            backdropFilter: 'blur(8px)',
            fontFamily: tUI.fontFamily
          }}>
            <div style={{
              backgroundColor: isDark ? '#091122' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px 32px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
              position: 'relative'
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#ea580c',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    <span>🇮🇳</span>
                    <span>CABINET DECISION & STATUTORY PROOF DOSSIER</span>
                  </div>
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: isDark ? '#ffffff' : '#0c2340',
                    margin: '2px 0 6px'
                  }}>
                    {schemeName} • {year} Horizon Audit
                  </h2>
                  <div style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {getSchemeFullName(scheme)}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRoadmapProof(null)}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#cbd5e1' : '#475569',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 1. Official Authority & Cabinet Sanction */}
              <div style={{
                backgroundColor: isDark ? '#111e38' : '#f0f9ff',
                border: isDark ? '1px solid #0284c750' : '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#0284c7',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '6px'
                }}>
                  🏛️ Statutory Sanctioning Authority & Directive
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#e0f2fe' : '#0369a1', marginBottom: '8px' }}>
                  {proof.authority}
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.55, color: isDark ? '#cbd5e1' : '#334155' }}>
                  {proof.decision}
                </div>
              </div>

              {/* 2. Direct Clickable Gazette / Portal Link */}
              <div style={{
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                    Official Clickable Verification Source Link
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {proof.displayUrl || proof.url}
                  </div>
                </div>

                <a
                  href={proof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: isDark ? '#0284c7' : '#0c2340',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                  }}
                >
                  <span>🔗 Open Official Gazette / Portal</span>
                  <span>↗</span>
                </a>
              </div>

              {/* Provenance Dossier Box */}
              <div style={{
                backgroundColor: isDark ? '#0c162c' : '#f8fafc',
                border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🏛️ Theoretical Provenance & Identity
                  </div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                    color: isDark ? '#38bdf8' : '#0284c7'
                  }}>
                    {proof.category || "Statutory Scheme Outlay & Saturation Model"}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#ffffff' : '#0c2340', marginBottom: '6px' }}>
                  {proof.formulaName || `${schemeName} Saturation Expenditure Identity`}
                </div>
                <div style={{ fontSize: '11.5px', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0284c7' }}>Source Provenance: </strong>
                  {proof.sourceType || "Hybrid: Local policy_repository.db (Demand for Grants 2024–25) + Official Live Ministry Gazette"}
                </div>
                <div style={{ fontSize: '11.5px', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.5, marginTop: '4px' }}>
                  <strong style={{ color: '#0284c7' }}>Why Chosen: </strong>
                  {proof.whyChosen || "Anchors scheme expansion to statutory Cabinet approvals and NSSO/Census household eligibility universes to eliminate arbitrary estimates."}
                </div>
              </div>

              {/* 3. Mathematical Formula & Step-by-Step Arithmetic Verification */}
              <div style={{
                backgroundColor: isDark ? '#070d19' : '#fafafa',
                border: isDark ? '1px solid #1e2e4a' : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#ea580c',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  📐 Mathematical Model & Expenditure Trajectory
                </div>

                {/* Mathematical Equation Display Box */}
                <MathFormulaRenderer formula={proof.formula} isDark={isDark} />

                {/* Variable Breakdown */}
                {proof.variables && proof.variables.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Variables & Parameter Breakdown:
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {proof.variables.map((v, idx) => (
                        <div key={idx} style={{
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '8px',
                          color: isDark ? '#cbd5e1' : '#334155'
                        }}>
                          <FormattedSymbol symbol={v.symbol} isDark={isDark} />
                          <span>{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Calculation */}
                {proof.calculation && (
                  <div style={{
                    backgroundColor: isDark ? '#1e1b4b20' : '#f5f3ff',
                    border: isDark ? '1px solid #4338ca' : '1px solid #ddd6fe',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: isDark ? '#c7d2fe' : '#4338ca'
                  }}>
                    <strong>Step-by-Step Arithmetic: </strong> {proof.calculation}
                  </div>
                )}
              </div>

              {/* 4. Complete 4-Milestone Multi-Decade Progression Table */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: isDark ? '#94a3b8' : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  📊 Multi-Decade Trajectory Table (2024–2047)
                </div>

                <div style={{
                  overflowX: 'auto',
                  borderRadius: '10px',
                  border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: isDark ? '#111e38' : '#f1f5f9',
                        borderBottom: isDark ? '1px solid #1e293b' : '1px solid #cbd5e1'
                      }}>
                        <th style={{ padding: '8px 12px' }}>Horizon Year</th>
                        <th style={{ padding: '8px 12px' }}>Annual Outlay</th>
                        <th style={{ padding: '8px 12px' }}>Increment</th>
                        <th style={{ padding: '8px 12px' }}>Saturation %</th>
                        <th style={{ padding: '8px 12px' }}>Target Beneficiaries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['2024', '2029', '2035', '2047'].map(yr => {
                        const m = roadmap[yr] || {};
                        const isCurrent = yr === year;
                        return (
                          <tr key={yr} style={{
                            backgroundColor: isCurrent
                              ? (isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)')
                              : 'transparent',
                            borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                            fontWeight: isCurrent ? 800 : 500
                          }}>
                            <td style={{ padding: '8px 12px', color: isCurrent ? '#38bdf8' : (isDark ? '#f8fafc' : '#0f172a') }}>
                              {yr} {isCurrent ? '🎯' : ''}
                            </td>
                            <td style={{ padding: '8px 12px', color: sectorThemeColor }}>
                              ₹{(m.outlayCr || 0).toLocaleString('en-IN')} Cr
                            </td>
                            <td style={{ padding: '8px 12px', color: m.outlayGrowthPct > 0 ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') }}>
                              {m.outlayGrowthPct > 0 ? `+${m.outlayGrowthPct}%` : 'Baseline'}
                            </td>
                            <td style={{ padding: '8px 12px', color: (m.saturationPct || 0) >= 100 ? '#10b981' : '#0284c7' }}>
                              {m.saturationPct}%
                            </td>
                            <td style={{ padding: '8px 12px', color: isDark ? '#cbd5e1' : '#475569' }}>
                              {m.beneficiaries}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Statutory proof calibrated to Union Budget 2024–25 Statements & official Cabinet notifications.
                </div>
                <button
                  onClick={() => setSelectedRoadmapProof(null)}
                  style={{
                    backgroundColor: isDark ? '#38bdf8' : '#0c2340',
                    color: isDark ? '#000000' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: tUI.fontFamily
                  }}
                >
                  {tUI.closeModalBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          NATIONAL ROADMAP SATURATION & OUTLAY PROOF MODAL (MACRO AUDIT)
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedMacroProof && (() => {
        const horizon = selectedMacroProof;
        const proof = (horizon.proofs && horizon.proofs[activeMacroMetricAudit]) || horizon.proof;
        const labelText = activeLang === 'hi' ? horizon.label_hi : (activeLang === 'ta' ? horizon.label_ta : (activeLang === 'te' ? horizon.label_te : horizon.label));

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px',
            backdropFilter: 'blur(8px)',
            fontFamily: tUI.fontFamily
          }}>
            <div style={{
              backgroundColor: isDark ? '#091122' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '880px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '30px 32px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.65)',
              position: 'relative'
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#ea580c',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px'
                  }}>
                    <span>🇮🇳</span>
                    <span>NATIONAL ECONOMIC AUDIT & PROVENANCE PIPELINE</span>
                  </div>
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: 900,
                    color: isDark ? '#ffffff' : '#0c2340',
                    margin: '2px 0 6px'
                  }}>
                    Viksit Bharat {horizon.year} Macro Saturation & Expenditure Proof
                  </h2>
                  <div style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    {labelText} • {horizon.tagline}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMacroProof(null)}
                  style={{
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    color: isDark ? '#cbd5e1' : '#475569',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Macro Indicators Trio with Hover Glow Animation & Click-to-Audit Selection */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
              }}>
                {/* 1. National Composite Saturation Card */}
                <div
                  onClick={() => setActiveMacroMetricAudit('saturation')}
                  onMouseEnter={() => setHoveredMacroTrioKey('saturation')}
                  onMouseLeave={() => setHoveredMacroTrioKey(null)}
                  style={{
                    backgroundColor: activeMacroMetricAudit === 'saturation'
                      ? (isDark ? '#06281e' : '#ecfdf5')
                      : (isDark ? '#111e38' : '#f0fdf4'),
                    border: activeMacroMetricAudit === 'saturation'
                      ? '2px solid #10b981'
                      : (hoveredMacroTrioKey === 'saturation'
                          ? '2px solid #34d399'
                          : (isDark ? '1px solid #10b98140' : '1px solid #86efac')),
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: (hoveredMacroTrioKey === 'saturation' || activeMacroMetricAudit === 'saturation') ? 'translateY(-3px)' : 'none',
                    boxShadow: hoveredMacroTrioKey === 'saturation'
                      ? '0 0 24px rgba(16, 185, 129, 0.6), 0 8px 20px rgba(0,0,0,0.25)'
                      : (activeMacroMetricAudit === 'saturation'
                          ? '0 0 16px rgba(16, 185, 129, 0.35)'
                          : 'none'),
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                      🎯 Composite Saturation
                    </div>
                    {activeMacroMetricAudit === 'saturation' ? (
                      <span style={{ fontSize: '9px', fontWeight: 900, backgroundColor: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '10px' }}>
                        AUDITING
                      </span>
                    ) : (
                      <span style={{ fontSize: '9.5px', color: '#10b981', fontWeight: 700 }}>
                        Click to Audit ↗
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#ffffff' : '#065f46', marginTop: '3px' }}>
                    {horizon.overallSaturation}%
                  </div>
                  <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    Weighted across 25 flagship welfare schemes
                  </div>
                </div>

                {/* 2. Union Budget Expenditure Card */}
                <div
                  onClick={() => setActiveMacroMetricAudit('budget')}
                  onMouseEnter={() => setHoveredMacroTrioKey('budget')}
                  onMouseLeave={() => setHoveredMacroTrioKey(null)}
                  style={{
                    backgroundColor: activeMacroMetricAudit === 'budget'
                      ? (isDark ? '#082542' : '#f0f9ff')
                      : (isDark ? '#111e38' : '#f0f9ff'),
                    border: activeMacroMetricAudit === 'budget'
                      ? '2px solid #0284c7'
                      : (hoveredMacroTrioKey === 'budget'
                          ? '2px solid #38bdf8'
                          : (isDark ? '1px solid #0284c740' : '1px solid #7dd3fc')),
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: (hoveredMacroTrioKey === 'budget' || activeMacroMetricAudit === 'budget') ? 'translateY(-3px)' : 'none',
                    boxShadow: hoveredMacroTrioKey === 'budget'
                      ? '0 0 24px rgba(2, 132, 199, 0.6), 0 8px 20px rgba(0,0,0,0.25)'
                      : (activeMacroMetricAudit === 'budget'
                          ? '0 0 16px rgba(2, 132, 199, 0.35)'
                          : 'none'),
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                      💰 Union Expenditure
                    </div>
                    {activeMacroMetricAudit === 'budget' ? (
                      <span style={{ fontSize: '9px', fontWeight: 900, backgroundColor: '#0284c7', color: '#ffffff', padding: '2px 8px', borderRadius: '10px' }}>
                        AUDITING
                      </span>
                    ) : (
                      <span style={{ fontSize: '9.5px', color: '#0284c7', fontWeight: 700 }}>
                        Click to Audit ↗
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#ffffff' : '#0369a1', marginTop: '3px' }}>
                    {horizon.budgetTotal}
                  </div>
                  <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    Total statutory Central outlays
                  </div>
                </div>

                {/* 3. Nominal GDP Benchmark Card ($10T in 2035) */}
                <div
                  onClick={() => setActiveMacroMetricAudit('gdp')}
                  onMouseEnter={() => setHoveredMacroTrioKey('gdp')}
                  onMouseLeave={() => setHoveredMacroTrioKey(null)}
                  style={{
                    backgroundColor: activeMacroMetricAudit === 'gdp'
                      ? (isDark ? '#301605' : '#fff7ed')
                      : (isDark ? '#111e38' : '#fff7ed'),
                    border: activeMacroMetricAudit === 'gdp'
                      ? '2px solid #ea580c'
                      : (hoveredMacroTrioKey === 'gdp'
                          ? '2px solid #fb923c'
                          : (isDark ? '1px solid #ea580c40' : '1px solid #fdba74')),
                    borderRadius: '14px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: (hoveredMacroTrioKey === 'gdp' || activeMacroMetricAudit === 'gdp') ? 'translateY(-3px)' : 'none',
                    boxShadow: hoveredMacroTrioKey === 'gdp'
                      ? '0 0 26px rgba(234, 88, 12, 0.65), 0 8px 20px rgba(0,0,0,0.25)'
                      : (activeMacroMetricAudit === 'gdp'
                          ? '0 0 18px rgba(234, 88, 12, 0.4)'
                          : 'none'),
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                      📈 Nominal GDP Benchmark
                    </div>
                    {activeMacroMetricAudit === 'gdp' ? (
                      <span style={{ fontSize: '9px', fontWeight: 900, backgroundColor: '#ea580c', color: '#ffffff', padding: '2px 8px', borderRadius: '10px' }}>
                        AUDITING
                      </span>
                    ) : (
                      <span style={{ fontSize: '9.5px', color: '#ea580c', fontWeight: 700 }}>
                        Click to Audit ↗
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: isDark ? '#ffffff' : '#c2410c', marginTop: '3px' }}>
                    {horizon.nationalGdp}
                  </div>
                  <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                    MoSPI, NITI Aayog & RBI trajectory
                  </div>
                </div>
              </div>

              {/* Active Audit Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: isDark ? '#081120' : '#f1f5f9',
                border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: isDark ? '#ffffff' : '#0c2340', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🔍</span>
                  <span>
                    Currently Auditing Metric Proof:{' '}
                    <strong style={{ color: activeMacroMetricAudit === 'gdp' ? '#ea580c' : (activeMacroMetricAudit === 'budget' ? '#0284c7' : '#10b981') }}>
                      {activeMacroMetricAudit === 'gdp'
                        ? `Nominal GDP Milestone (${horizon.nationalGdp}) — Compounding Derivation`
                        : (activeMacroMetricAudit === 'budget'
                            ? `Union Budget Statutory Outlay (${horizon.budgetTotal}) — Public Finance Identity`
                            : `National Composite Saturation (${horizon.overallSaturation}%) — Flagship Cohort Matrix`)}
                    </strong>
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>
                  Click any card above to inspect its math
                </div>
              </div>

              {/* Provenance & Theoretical Explanation (Evidence Pipeline Design) */}
              <div style={{
                backgroundColor: isDark ? '#0c162c' : '#f8fafc',
                border: isDark ? '1px solid #1e3a5f' : '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    🏛️ Theoretical Provenance & Mathematical Identity
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                    color: isDark ? '#38bdf8' : '#0284c7',
                    border: '1px solid #0284c740'
                  }}>
                    {proof.category}
                  </span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: 900, color: isDark ? '#ffffff' : '#0c2340', marginBottom: '10px' }}>
                  {proof.formulaName}
                </div>

                {/* Source Type & Source Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '8px',
                  backgroundColor: isDark ? '#080e1c' : '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isDark ? '1px solid #1e2e4a' : '1px solid #e2e8f0',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#334155' }}>
                    <strong style={{ color: '#0284c7' }}>Source Type: </strong> {proof.sourceType}
                  </div>
                  <div style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#334155' }}>
                    <strong style={{ color: '#0284c7' }}>Exact Statutory Details: </strong> {proof.sourceDetails}
                  </div>
                </div>

                {/* Why Chosen & Derivation Logic */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Why This Model Was Chosen:
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.55, color: isDark ? '#e2e8f0' : '#334155' }}>
                    {proof.whyChosen}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Mathematical Derivation Logic:
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.55, color: isDark ? '#e2e8f0' : '#334155' }}>
                    {proof.derivationLogic}
                  </div>
                </div>
              </div>

              {/* Governing KaTeX Formula & Variables Box */}
              <div style={{
                backgroundColor: isDark ? '#070d19' : '#fafafa',
                border: isDark ? '1px solid #1e2e4a' : '1px solid #e5e7eb',
                borderRadius: '14px',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  📐 Governing Mathematical Formulation
                </div>

                {/* Mathematical Equation Display Box */}
                <MathFormulaRenderer formula={proof.formula} isDark={isDark} />

                {/* Variable Breakdown */}
                {proof.variables && proof.variables.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Parameter & Variable Breakdown:
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {proof.variables.map((v, idx) => (
                        <div key={idx} style={{
                          fontSize: '12.5px',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '10px',
                          color: isDark ? '#cbd5e1' : '#334155'
                        }}>
                          <FormattedSymbol symbol={v.symbol} isDark={isDark} />
                          <span>{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step-by-Step Numerical Calculation */}
                {proof.calculation && (
                  <div style={{
                    backgroundColor: isDark ? '#1e1b4b20' : '#f5f3ff',
                    border: isDark ? '1px solid #4338ca' : '1px solid #ddd6fe',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '12.5px',
                    lineHeight: 1.55,
                    color: isDark ? '#c7d2fe' : '#4338ca'
                  }}>
                    <strong>Step-by-Step Arithmetic Verification: </strong> {proof.calculation}
                  </div>
                )}
              </div>

              {/* Direct Clickable Verification Source Link Bar */}
              <div style={{
                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase' }}>
                    Official Verification Portal Citation
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                    {proof.displayUrl || proof.url}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <a
                    href={proof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: isDark ? '#0284c7' : '#0c2340',
                      color: '#ffffff',
                      padding: '9px 18px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <span>🔗 Open Official Gazette / Vision Portal</span>
                    <span>↗</span>
                  </a>

                  {activeMacroMetricAudit === 'gdp' && (
                    <>
                      <a
                        href="https://www.indiabudget.gov.in/economicsurvey"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          color: isDark ? '#38bdf8' : '#0369a1',
                          border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>📊 MoF Economic Survey</span>
                        <span>↗</span>
                      </a>
                      <a
                        href="https://rbi.org.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          color: isDark ? '#38bdf8' : '#0369a1',
                          border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🏛️ RBI Portal</span>
                        <span>↗</span>
                      </a>
                      <a
                        href="https://cebr.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          color: isDark ? '#38bdf8' : '#0369a1',
                          border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>🌍 CEBR Global League</span>
                        <span>↗</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* 5-Sector Saturation Progression Table */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ fontSize: '11px', fontWeight: 900, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  📊 5 Core Sectors Contribution to {horizon.year} Saturation ({horizon.overallSaturation}%)
                </div>

                <div style={{
                  overflowX: 'auto',
                  borderRadius: '10px',
                  border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    textAlign: 'left'
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: isDark ? '#111e38' : '#f1f5f9',
                        borderBottom: isDark ? '1px solid #1e293b' : '1px solid #cbd5e1'
                      }}>
                        <th style={{ padding: '8px 12px' }}>Sector Pillar</th>
                        <th style={{ padding: '8px 12px' }}>Lead Ministry</th>
                        <th style={{ padding: '8px 12px' }}>Schemes Count</th>
                        <th style={{ padding: '8px 12px' }}>Current Saturation</th>
                        <th style={{ padding: '8px 12px' }}>{horizon.year} Target Saturation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VIKSIT_SECTORS.map(sec => {
                        const secSchemes = VIKSIT_SCHEMES.filter(s => s.sectorId === sec.id);
                        return (
                          <tr key={sec.id} style={{
                            borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0'
                          }}>
                            <td style={{ padding: '8px 12px', color: sec.themeColor, fontWeight: 800 }}>
                              {sec.icon} {sec.name}
                            </td>
                            <td style={{ padding: '8px 12px', color: isDark ? '#cbd5e1' : '#475569' }}>
                              {sec.leadMinistry}
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 700 }}>
                              {secSchemes.length} Schemes
                            </td>
                            <td style={{ padding: '8px 12px', color: '#ea580c', fontWeight: 800 }}>
                              {sec.id === 'water-health' ? '74.2%' : (sec.id === 'agri-rural' ? '78.6%' : (sec.id === 'housing-infra' ? '71.5%' : (sec.id === 'edu-skill' ? '58.4%' : '66.8%')))}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#10b981', fontWeight: 900 }}>
                              {horizon.year === '2024' ? (sec.id === 'water-health' ? '74.2%' : (sec.id === 'agri-rural' ? '78.6%' : (sec.id === 'housing-infra' ? '71.5%' : (sec.id === 'edu-skill' ? '58.4%' : '66.8%')))) : (horizon.year === '2029' ? '88.5%' : (horizon.year === '2035' ? '96.2%' : '100.0%'))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: isDark ? '#94a3b8' : '#64748b' }}>
                  Audited via National Policy Repository & Union Budget 2024–25 Demands for Grants.
                </div>
                <button
                  onClick={() => setSelectedMacroProof(null)}
                  style={{
                    backgroundColor: isDark ? '#38bdf8' : '#0c2340',
                    color: isDark ? '#000000' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: tUI.fontFamily
                  }}
                >
                  {tUI.closeModalBtn}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
