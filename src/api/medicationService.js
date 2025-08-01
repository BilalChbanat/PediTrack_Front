import axios from 'axios';
import medicationJson from '../data/pediatric_medications';

// Base URL for the medicament.ma API
const MEDICAMENT_API_BASE_URL = 'https://medicament.ma';

/**
 * Test function to verify the service is working
 * @returns {Promise<boolean>} True if service is working
 */
export const testMedicationService = async () => {
  try {
    console.log('Testing medication service...');
    const medications = await fetchMedications('A', 1);
    console.log(`Service test successful: ${medications.length} medications found`);
    return true;
  } catch (error) {
    console.error('Service test failed:', error);
    return false;
  }
};

/**
 * Fetch medications from medicament.ma API with correct URL structure
 * @param {string} letter - Letter to filter medications (A-Z)
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of medications
 */
export const fetchMedications = async (letter = 'A', page = 1) => {
  try {
    // Use the correct URL structure: /listing-des-medicaments/page/{page}/?lettre={letter}
    const url = `${MEDICAMENT_API_BASE_URL}/listing-des-medicaments/page/${page}/?lettre=${letter}`;
    
    console.log(`Fetching: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000 // 15 second timeout
    });

    // Parse the HTML response to extract medication data
    const html = response.data;
    const medications = parseMedicationsFromHTML(html);
    
    if (medications.length > 0) {
      console.log(`Successfully fetched ${medications.length} medications from medicament.ma for letter ${letter}, page ${page}`);
      return medications;
    } else {
      console.log(`No medications found for letter ${letter}, page ${page}`);
      return [];
    }
  } catch (error) {
    console.warn(`Failed to fetch from medicament.ma for letter ${letter}, page ${page}:`, error.message);
    return [];
  }
};

/**
 * Get total pages for a specific letter by parsing the HTML
 * @param {string} letter - Letter to check
 * @returns {Promise<number>} Total number of pages
 */
export const getTotalPagesForLetter = async (letter) => {
  try {
    const response = await axios.get(`${MEDICAMENT_API_BASE_URL}/listing-des-medicaments/page/1/?lettre=${letter}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });

    const html = response.data;
    
    // Look for pagination information in the HTML
    // The page shows "596 résultats trouvés pour « A »" and has pagination
    const resultsMatch = html.match(/(\d+)\s+résultats?\s+trouvés?\s+pour/);
    if (resultsMatch) {
      const totalResults = parseInt(resultsMatch[1]);
      // Assuming ~20 medications per page
      const estimatedPages = Math.ceil(totalResults / 20);
      console.log(`Letter ${letter}: ${totalResults} results, estimated ${estimatedPages} pages`);
      return estimatedPages;
    }
    
    // Fallback: try to find pagination links
    const paginationRegex = /<a[^>]*href="[^"]*page\/(\d+)\/[^"]*lettre=[^"]*"[^>]*>(\d+)<\/a>/g;
    let maxPage = 1;
    let match;
    
    while ((match = paginationRegex.exec(html)) !== null) {
      const pageNum = parseInt(match[2]);
      if (pageNum > maxPage) {
        maxPage = pageNum;
      }
    }
    
    console.log(`Letter ${letter}: Found ${maxPage} pages from pagination`);
    return maxPage;
    
  } catch (error) {
    console.error(`Error getting total pages for letter ${letter}:`, error.message);
    return 1; // Default to 1 page if we can't determine
  }
};

/**
 * Fetch all medications for a specific letter with pagination
 * @param {string} letter - Letter to fetch
 * @returns {Promise<Array>} Array of medications for this letter
 */
export const fetchAllMedicationsForLetter = async (letter) => {
  const letterMedications = [];
  
  try {
    // Get total pages for this letter
    const totalPages = await getTotalPagesForLetter(letter);
    console.log(`Fetching all pages for letter ${letter} (${totalPages} pages)`);
    
    // Fetch all pages
    for (let page = 1; page <= totalPages; page++) {
      console.log(`Fetching letter ${letter}, page ${page}/${totalPages}`);
      
      const pageMedications = await fetchMedications(letter, page);
      letterMedications.push(...pageMedications);
      
      // Add delay between pages to be respectful
      if (page < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`Total medications for letter ${letter}: ${letterMedications.length}`);
    return letterMedications;
    
  } catch (error) {
    console.error(`Error fetching all medications for letter ${letter}:`, error.message);
    return [];
  }
};

/**
 * Filter local medications by first letter
 * @param {string} letter - Letter to filter by
 * @returns {Array} Filtered medications
 */
const filterLocalMedicationsByLetter = (letter) => {
  if (!letter || letter.length !== 1) return medicationJson;
  
  return medicationJson.filter(med => 
    med.SPECIALITE && 
    med.SPECIALITE.toUpperCase().startsWith(letter.toUpperCase())
  );
};

/**
 * Parse medications from HTML response
 * @param {string} html - HTML content from medicament.ma
 * @returns {Array} Array of parsed medications
 */
const parseMedicationsFromHTML = (html) => {
  const medications = [];
  
  try {
    // Updated regex to match the actual HTML structure from medicament.ma
    // Looking for table rows with medication links
    const medicationRegex = /<tr[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>.*?<\/tr>/gs;
    let match;
    
    while ((match = medicationRegex.exec(html)) !== null) {
      const [, url, text] = match;
      const medication = parseMedicationText(text.trim(), url);
      if (medication) {
        medications.push(medication);
      }
    }
    
    // Alternative regex for different HTML structure
    const altRegex = /<td[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>.*?<\/td>/gs;
    while ((match = altRegex.exec(html)) !== null) {
      const [, url, text] = match;
      const medication = parseMedicationText(text.trim(), url);
      if (medication && !medications.some(m => m.SPECIALITE === medication.SPECIALITE)) {
        medications.push(medication);
      }
    }
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
  }
  
  return medications;
};

/**
 * Parse medication text to extract structured data
 * @param {string} text - Medication text from medicament.ma
 * @param {string} url - Medication URL
 * @returns {Object|null} Parsed medication object or null
 */
const parseMedicationText = (text, url) => {
  try {
    // Example text format: "ALGIPAN, Baume  Tube de 40 g - PPV: 13.80 dhs"
    let specialite = text;
    let dosage = '';
    let forme = '';
    let presentation = '';
    let ppv = '';
    let dci = '';

    // Extract dosage patterns
    const dosageMatch = text.match(/(\d+(?:\.\d+)?)\s*(MG|µG|G|ML|MG\/ML|MG\/DOSE|µG\/DOSE|G\/ML|G\/DOSE|UI|MEQ|MMOL|%|MG\/G|MG\/KG)/i);
    if (dosageMatch) {
      dosage = `${dosageMatch[1]} ${dosageMatch[2]}`;
      specialite = text.replace(dosageMatch[0], '').trim();
    }

    // Extract price
    const priceMatch = text.match(/PPV:\s*([\d,]+\.?\d*)\s*dhs/i);
    if (priceMatch) {
      ppv = priceMatch[1];
    }

    // Extract form
    const formMatch = text.match(/(Comprimé|Gélule|Sirop|Aérosol|Injection|Crème|Pommade|Suppositoire|Collyre|Gouttes|Suspension|Solution|Poudre|Capsule|Pastille|Granulé|Emulsion|Gel|Patch|Inhalateur|Nébuliseur|Spray|Baume|Tube|Flacon|Ampoule|Sachet|Boîte|Blister|Stick|Dose|Unidose|Multidose)/i);
    if (formMatch) {
      forme = formMatch[1];
    }

    // Extract presentation
    const presentationMatch = text.match(/(Tube de \d+ g|Flacon de \d+ ml|Boîte de \d+|Ampoule de \d+|Sachet de \d+|Blister de \d+|Stick de \d+|Dose de \d+|Unidose|Multidose|1 Flacon)/i);
    if (presentationMatch) {
      presentation = presentationMatch[1];
    }

    // Extract DCI (active substance) - this would need to be enhanced
    const dciMatch = text.match(/(IBUPROFENE|PARACETAMOL|AMOXICILLINE|SALBUTAMOL|AZITHROMYCINE|LORATADINE|OMEPRAZOLE|PREDNISONE|CETIRIZINE|DEXTROMETHORPHANE|ACIDE ASCORBIQUE|SULFATE FERREUX|CARBONATE DE CALCIUM|ACIDE CLAVULANIQUE|DESLORATADINE|FENTANYL|QUINAPRIL|ACETYLSALICYLIC ACID|ABIRATERONE|ACIDE ALENDRONIQUE|ACIDE ZOLEDRONIQUE|ACICLOVIR|PEMETREXED|FEXOFENADINE|AZELASTINE|OLOPATADINE)/i);
    if (dciMatch) {
      dci = dciMatch[1];
    }

    return {
      SPECIALITE: specialite || text,
      DOSAGE: dosage,
      FORME: forme,
      PRESENTATION: presentation,
      PPV: ppv,
      DCI: dci,
      CLASSE_THERAPEUTIQUE: getTherapeuticClass(dci, forme),
      EPI: getManufacturer(text),
      CODE: generateCode(specialite),
      TVA: '0%',
      STATUT_AMM: 'AMM ENREGISTREE',
      STATUT_COMMERCIALISATION: 'Commercialisé',
      url: url,
      source: 'medicament.ma'
    };

  } catch (error) {
    console.error('Error parsing medication text:', error);
    return null;
  }
};

/**
 * Get therapeutic class based on DCI and form
 */
const getTherapeuticClass = (dci, forme) => {
  if (!dci) return 'AUTRE';
  
  const dciUpper = dci.toUpperCase();
  if (dciUpper.includes('IBUPROFENE') || dciUpper.includes('PARACETAMOL')) return 'ANALGESIQUE';
  if (dciUpper.includes('AMOXICILLINE') || dciUpper.includes('AZITHROMYCINE')) return 'ANTIBIOTIQUE';
  if (dciUpper.includes('SALBUTAMOL')) return 'BRONCHODILATATEUR';
  if (dciUpper.includes('LORATADINE') || dciUpper.includes('CETIRIZINE') || dciUpper.includes('DESLORATADINE') || dciUpper.includes('FEXOFENADINE')) return 'ANTIHISTAMINIQUE';
  if (dciUpper.includes('OMEPRAZOLE')) return 'ANTISECRETOIRE GASTRIQUE';
  if (dciUpper.includes('PREDNISONE')) return 'CORTICOIDE';
  if (dciUpper.includes('DEXTROMETHORPHANE')) return 'ANTITUSSIF';
  if (dciUpper.includes('ACIDE ASCORBIQUE')) return 'VITAMINE';
  if (dciUpper.includes('SULFATE FERREUX') || dciUpper.includes('CARBONATE DE CALCIUM')) return 'OLIGO-ELEMENT';
  if (dciUpper.includes('PEMETREXED') || dciUpper.includes('ABIRATERONE')) return 'ANTICANCEREUX';
  if (dciUpper.includes('AZELASTINE') || dciUpper.includes('OLOPATADINE')) return 'ANTIHISTAMINIQUE OCULAIRE';
  
  return 'AUTRE';
};

/**
 * Get manufacturer from text
 */
const getManufacturer = (text) => {
  const manufacturers = ['PHARMA 5', 'GSK', 'PFIZER', 'SANOFI', 'BAYER', 'MERCK', 'JANSSEN', 'KYOWA KIRIN', 'NORMON', 'COOPER', 'MYLAN', 'PROMOPHARM', 'ARWA MEDIC', 'GENERIC TECH', 'GILBERT', 'LILLY', 'ASTELLAS'];
  
  for (const manufacturer of manufacturers) {
    if (text.toUpperCase().includes(manufacturer.toUpperCase())) {
      return manufacturer;
    }
  }
  return 'PHARMA 5';
};

/**
 * Generate unique code for medication
 */
const generateCode = (specialite) => {
  const timestamp = Date.now().toString().slice(-6);
  const specialiteCode = specialite.substring(0, 3).toUpperCase();
  return `${specialiteCode}${timestamp}`;
};

/**
 * Fetch all medications by iterating through all letters with proper pagination
 * @returns {Promise<Array>} Array of all medications
 */
export const fetchAllMedications = async () => {
  const allMedications = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  try {
    for (const letter of letters) {
      console.log(`\n=== Processing letter ${letter} ===`);
      
      const letterMedications = await fetchAllMedicationsForLetter(letter);
      allMedications.push(...letterMedications);
      
      console.log(`Total medications so far: ${allMedications.length}`);
      
      // Add delay between letters to be respectful
      if (letter !== 'Z') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`\n=== Scraping Complete ===`);
    console.log(`Total medications fetched: ${allMedications.length}`);
    return allMedications;
  } catch (error) {
    console.error('Error fetching all medications:', error);
    // Fallback to local data
    console.log('Using local medication data as fallback');
    return medicationJson;
  }
};

/**
 * Search medications by name or DCI
 * @param {string} searchTerm - Search term
 * @param {Array} medications - Array of medications to search in
 * @returns {Array} Filtered medications
 */
export const searchMedications = (searchTerm, medications) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const term = searchTerm.toLowerCase();
  return medications.filter(med => 
    med.SPECIALITE?.toLowerCase().includes(term) ||
    med.DCI?.toLowerCase().includes(term) ||
    med.SUBSTANCE_ACTIVE?.toLowerCase().includes(term)
  ).slice(0, 20); // Limit results for performance
};

/**
 * Get medication by ID or URL
 * @param {string} medicationId - Medication ID or URL
 * @returns {Promise<Object>} Medication details
 */
export const getMedicationDetails = async (medicationId) => {
  try {
    const response = await axios.get(`${MEDICAMENT_API_BASE_URL}/medicament/${medicationId}`);
    // Parse individual medication page for detailed information
    // This would require additional HTML parsing logic
    return response.data;
  } catch (error) {
    console.error('Error fetching medication details:', error);
    throw error;
  }
};

/**
 * Get medications with caching
 * @returns {Promise<Array>} Array of medications
 */
export const getMedicationsWithCache = async () => {
  // Check if we have cached data
  const cachedData = localStorage.getItem('medications_cache');
  const cacheTimestamp = localStorage.getItem('medications_cache_timestamp');
  
  // Cache is valid for 24 hours
  const cacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 24 * 60 * 60 * 1000;
  
  if (cachedData && cacheValid) {
    console.log('Using cached medication data');
    return JSON.parse(cachedData);
  }
  
  try {
    console.log('Fetching fresh medication data with proper pagination');
    const medications = await fetchAllMedications();
    
    // Cache the data
    localStorage.setItem('medications_cache', JSON.stringify(medications));
    localStorage.setItem('medications_cache_timestamp', Date.now().toString());
    
    return medications;
  } catch (error) {
    console.error('Error fetching medications:', error);
    // Return local data as final fallback
    return medicationJson;
  }
}; 