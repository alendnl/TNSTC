import { DEFAULT_ALLOWED_BUS_TYPES } from './filterBuses.js';

const STORAGE_KEYS = {
  BOOKINGS: 'tnstc_bookings',
  CONFIG: 'tnstc_config',
  LOGS: 'tnstc_logs',
  TELEGRAM: 'tnstc_telegram',
  IS_SEARCHING: 'tnstc_is_searching',
  THEME: 'tnstc_theme',
  RESULTS: 'tnstc_results'
};

export const INITIAL_BOOKINGS = [
  {
    id: 'booking-1',
    name: 'Trichy → Kilambakkam (09/11/2026)',
    active: true,
    curlCommand: `curl --url 'https://www.tnstc.in/OTRSOnline/jqreq.do?hiddenAction=SearchService' \\
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \\
  -H 'Accept-Language: en-US,en;q=0.9' \\
  -H 'Cache-Control: max-age=0' \\
  -H 'Connection: keep-alive' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -b 'JSESSIONID=D4F0B535C6C629B1431894969163AB20; _ga=GA1.1.465872678.1788969560; _ga_EED126G79N=GS2.1.s1793625134$o10$g1$t1793625186$j8$l0$h0' \\
  -H 'DNT: 1' \\
  -H 'Origin: https://www.tnstc.in' \\
  -H 'Referer: https://www.tnstc.in/OTRSOnline/jqreq.do?hiddenAction=SearchService' \\
  -H 'Sec-Fetch-Dest: document' \\
  -H 'Sec-Fetch-Mode: navigate' \\
  -H 'Sec-Fetch-Site: same-origin' \\
  -H 'Sec-Fetch-User: ?1' \\
  -H 'Upgrade-Insecure-Requests: 1' \\
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36' \\
  -H 'sec-ch-ua: "Not:A-Brand";v="8", "Chromium";v="156", "Google Chrome";v="156"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "macOS"' \\
  --data-raw 'txtdeptDateOtrip=09%2F11%2F2026&txtdeptDateRtrip=&hiddenJourneyType=O&hiddenClassName=&radOnwardServiceID=&hiddenOnwardUFromplacename=&hiddenOnwardUToplacename=&hiddenUserType=G&hiddenUserMasterID=&hiddenOnwardTimeSlab=&hiddenOnwardServiceInfo=&hiddenAction=SearchService&totalSeatsTodisplay=1&radOnewayOrReturnTrip=O&totalAdultSeatsTodisplay=1&totalChildSeatsTodisplay=0&hiddenTotalMales=&hiddenTotalFemales=&txtAdultMales=1&txtAdultFemales=0&txtChildMales=0&txtChildFemales=0&hiddenSeniorCitizenAge=&hiddenPickupPointName=&hiddenDropOffPointName=&hiddenConcessionName=&hiddenIdProofName=&hiddenCpcdID=&hiddenConcessionLookupID=&hiddenPickUpTime=&hiddenOnwardJourneyDate=09%2F11%2F2026&hiddenCurrentDate=02%2F11%2F2026&hiddenDifferentlyAbledSeatQuota=&hiddenDifferentlyAbledSeatStatus=&hiddenDifferentlyAbledSeatStatusReturn=&txtPickUpDate=&hiddenStartPlaceID=74&hiddenEndPlaceID=1392&txtStartPlaceCode=TRI&txtEndPlaceCode=KCB&hiddenStartPlaceName=TRICHY&hiddenEndPlaceName=CHENNAI-KILAMBAKKAM-KCBT&matchStartPlace=TRICHY&matchEndPlace=CHENNAI-KILAMBAKKAM-KCBT&txtJourneyDate=09%2F11%2F2026&hiddenMaxNoOfPassengers=16&hiddenMaxValidReservDate=02%2F12%2F2026&selectOnwardTimeSlab=00%3A00-23%3A59&selectStartPlace=TRI&selectEndPlace=KCB&hiddenOnwardServiceID=&hiddenClassID=&hiddenClassID=&hiddenStartPoint=&hiddenSeatNumbersTodisplay=&seatNumbersTodisplay=&seatNumbersTodisplayN=&hiddenCount=&hiddenNewLadiesSeatList=&hiddenNewPassengers=&hiddenNewAges=&hiddenNewSeatNOs=&hiddenRNewSeatNOs=&hiddenNewGenders=&hiddenNewACType=&hiddenNewOnwardPickupPointDetails=&hiddenNewOnwardDropOffPointDetails=&hiddenReturnJourneyDate=DD%2FMM%2FYYYY&hiddenNewReturnPickupPointDetails=&hiddenNewReturnDropOffPointDetails=&checkSingleLady=N&selectPickupPoint=&selectDropOffPoint=&hiddenNewMobileNO=&hiddenNewEmailID=&txtIdProofReference=&selectIdProof=&languageType=E&hiddenOnwardSelectedNewSeatNOs=&hiddenOnwardSelectedNewSeatNOsConversion=&hiddenReturnSelectedNewSeatNOs=&selectConcession=&chkAddOn=&lchkAddOn=&mtcSelectedBar=&coiSelectedBar=&hiddenOnwardSeatCount=&txtPicupPointTime=&txtReturnPicupPointTime=&hiddenPackageTrip=NO&hiddenSourceArea=&hiddenSourcePincode=&hiddenDestinationArea=&hiddenDestinationPincode='`,
    date: '09/11/2026',
    route: 'TRICHY → CHENNAI-KILAMBAKKAM-KCBT'
  },
  {
    id: 'booking-2',
    name: 'Trichy → Kilambakkam (10/11/2026)',
    active: true,
    curlCommand: `curl --url 'https://www.tnstc.in/OTRSOnline/jqreq.do?hiddenAction=SearchService' \\
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \\
  -H 'Accept-Language: en-US,en;q=0.9' \\
  -H 'Cache-Control: max-age=0' \\
  -H 'Connection: keep-alive' \\
  -H 'Content-Type: application/x-www-form-urlencoded' \\
  -b 'JSESSIONID=4F09ED61635F0E7065732E8EA0798023; _ga=GA1.1.465872678.1788969560; _ga_EED126G79N=GS2.1.s1794189812$o11$g1$t1794190750$j44$l0$h0' \\
  -H 'DNT: 1' \\
  -H 'Origin: https://www.tnstc.in' \\
  -H 'Referer: https://www.tnstc.in/OTRSOnline/jqreq.do?hiddenAction=SearchService' \\
  -H 'Sec-Fetch-Dest: document' \\
  -H 'Sec-Fetch-Mode: navigate' \\
  -H 'Sec-Fetch-Site: same-origin' \\
  -H 'Sec-Fetch-User: ?1' \\
  -H 'Upgrade-Insecure-Requests: 1' \\
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36' \\
  -H 'sec-ch-ua: "Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"' \\
  -H 'sec-ch-ua-mobile: ?0' \\
  -H 'sec-ch-ua-platform: "macOS"' \\
  --data-raw 'txtdeptDateOtrip=10%2F11%2F2026&txtdeptDateRtrip=&hiddenJourneyType=O&hiddenClassName=&radOnwardServiceID=&hiddenOnwardUFromplacename=&hiddenOnwardUToplacename=&hiddenUserType=G&hiddenUserMasterID=&hiddenOnwardTimeSlab=&hiddenOnwardServiceInfo=&hiddenAction=SearchService&totalSeatsTodisplay=1&radOnewayOrReturnTrip=O&totalAdultSeatsTodisplay=1&totalChildSeatsTodisplay=0&hiddenTotalMales=&hiddenTotalFemales=&txtAdultMales=1&txtAdultFemales=0&txtChildMales=0&txtChildFemales=0&hiddenSeniorCitizenAge=&hiddenPickupPointName=&hiddenDropOffPointName=&hiddenConcessionName=&hiddenIdProofName=&hiddenCpcdID=&hiddenConcessionLookupID=&hiddenPickUpTime=&hiddenOnwardJourneyDate=10%2F11%2F2026&hiddenCurrentDate=09%2F11%2F2026&hiddenDifferentlyAbledSeatQuota=&hiddenDifferentlyAbledSeatStatus=&hiddenDifferentlyAbledSeatStatusReturn=&txtPickUpDate=&hiddenStartPlaceID=74&hiddenEndPlaceID=1392&txtStartPlaceCode=TRI&txtEndPlaceCode=KCB&hiddenStartPlaceName=TRICHY&hiddenEndPlaceName=CHENNAI-KILAMBAKKAM-KCBT&matchStartPlace=TRICHY&matchEndPlace=CHENNAI-KILAMBAKKAM-KCBT&txtJourneyDate=10%2F11%2F2026&hiddenMaxNoOfPassengers=16&hiddenMaxValidReservDate=9%2F12%2F2026&selectOnwardTimeSlab=00%3A00-23%3A59&selectStartPlace=TRI&selectEndPlace=KCB&hiddenOnwardServiceID=&hiddenClassID=&hiddenClassID=&hiddenStartPoint=&hiddenSeatNumbersTodisplay=&seatNumbersTodisplay=&seatNumbersTodisplayN=&hiddenCount=&hiddenNewLadiesSeatList=&hiddenNewPassengers=&hiddenNewAges=&hiddenNewSeatNOs=&hiddenRNewSeatNOs=&hiddenNewGenders=&hiddenNewACType=&hiddenNewOnwardPickupPointDetails=&hiddenNewOnwardDropOffPointDetails=&hiddenReturnJourneyDate=DD%2FMM%2FYYYY&hiddenNewReturnPickupPointDetails=&hiddenNewReturnDropOffPointDetails=&checkSingleLady=N&selectPickupPoint=&selectDropOffPoint=&hiddenNewMobileNO=&hiddenNewEmailID=&txtIdProofReference=&selectIdProof=&languageType=E&hiddenOnwardSelectedNewSeatNOs=&hiddenOnwardSelectedNewSeatNOsConversion=&hiddenReturnSelectedNewSeatNOs=&selectConcession=&chkAddOn=&lchkAddOn=&mtcSelectedBar=&coiSelectedBar=&hiddenOnwardSeatCount=&txtPicupPointTime=&txtReturnPicupPointTime=&hiddenPackageTrip=NO&hiddenSourceArea=&hiddenSourcePincode=&hiddenDestinationArea=&hiddenDestinationPincode='`,
    date: '10/11/2026',
    route: 'TRICHY → CHENNAI-KILAMBAKKAM-KCBT'
  }
];

export const INITIAL_CONFIG = {
  allowedBusTypes: DEFAULT_ALLOWED_BUS_TYPES,
  startTime: '18:00',
  endTime: '23:59',
  minSeats: 1,
  enforceUltraDeluxeMin: true,
  checkInterval: 60, // seconds
  autoStartOnLoad: false
};

export const INITIAL_TELEGRAM = {
  enabled: true,
  botToken: '8563966764:AAGWksngyRor5Fj93XvYDa4whm3sxtoAZ40',
  chatId: '6392154802',
  notifyOnlyWhenFound: true
};

export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings to localStorage', e);
  }
}

export function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return raw ? { ...INITIAL_CONFIG, ...JSON.parse(raw) } : INITIAL_CONFIG;
  } catch {
    return INITIAL_CONFIG;
  }
}

export function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
  }
}

export function loadTelegram() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM);
    return raw ? { ...INITIAL_TELEGRAM, ...JSON.parse(raw) } : INITIAL_TELEGRAM;
  } catch {
    return INITIAL_TELEGRAM;
  }
}

export function saveTelegram(telegram) {
  try {
    localStorage.setItem(STORAGE_KEYS.TELEGRAM, JSON.stringify(telegram));
  } catch (e) {
    console.error('Failed to save telegram settings to localStorage', e);
  }
}

export function loadIsSearching() {
  try {
    return localStorage.getItem(STORAGE_KEYS.IS_SEARCHING) === 'true';
  } catch {
    return false;
  }
}

export function saveIsSearching(val) {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_SEARCHING, val ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to save search state', e);
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function loadSavedResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSavedResults(results) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save results', e);
  }
}

