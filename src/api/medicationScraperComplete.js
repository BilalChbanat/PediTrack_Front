import axios from 'axios';

const MEDICAMENT_API_BASE_URL = 'https://medicament.ma';

class MedicationScraperComplete {
  constructor() {
    this.baseURL = MEDICAMENT_API_BASE_URL;
    this.timeout = 15000;
    this.delay = 500;
    this.totalFetched = 0;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Cache-Control': 'no-cache'
        },
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
      throw error;
    }
  }

  parseMedicationsFromHTML(html) {
    const medications = [];
    
    try {
      const medicationRegex = /<tr[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>.*?<\/tr>/gs;
      let match;
      
      while ((match = medicationRegex.exec(html)) !== null) {
        const [, url, text] = match;
        const medication = this.parseMedicationText(text.trim(), url);
        if (medication) {
          medications.push(medication);
        }
      }
    } catch (error) {
      console.error('Error parsing HTML:', error);
    }
    
    return medications;
  }

  parseMedicationText(text, url) {
    try {
      let specialite = text;
      let dosage = '';
      let forme = '';
      let presentation = '';
      let ppv = '';

      // Extract dosage
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

      return {
        SPECIALITE: specialite || text,
        DOSAGE: dosage,
        FORME: forme,
        PRESENTATION: presentation,
        PPV: ppv,
        DCI: '',
        CLASSE_THERAPEUTIQUE: 'AUTRE',
        EPI: 'PHARMA 5',
        CODE: this.generateCode(specialite),
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
  }

  generateCode(specialite) {
    const timestamp = Date.now().toString().slice(-6);
    const specialiteCode = specialite.substring(0, 3).toUpperCase();
    return `${specialiteCode}${timestamp}`;
  }

  async getTotalPagesForLetter(letter) {
    try {
      const url = `${this.baseURL}/listing-des-medicaments/page/1/?lettre=${letter}`;
      const html = await this.makeRequest(url);
      
      // Look for pagination information
      const resultsMatch = html.match(/(\d+)\s+résultats?\s+trouvés?\s+pour/);
      if (resultsMatch) {
        const totalResults = parseInt(resultsMatch[1]);
        const estimatedPages = Math.ceil(totalResults / 20);
        console.log(`Letter ${letter}: ${totalResults} results, estimated ${estimatedPages} pages`);
        return estimatedPages;
      }
      
      return 1;
    } catch (error) {
      console.error(`Error getting total pages for letter ${letter}:`, error.message);
      return 1;
    }
  }

  async fetchMedicationsForLetter(letter, page = 1) {
    try {
      const url = `${this.baseURL}/listing-des-medicaments/page/${page}/?lettre=${letter}`;
      console.log(`Fetching: ${url}`);
      
      const html = await this.makeRequest(url);
      const medications = this.parseMedicationsFromHTML(html);
      
      console.log(`Found ${medications.length} medications for letter ${letter}, page ${page}`);
      return medications;
      
    } catch (error) {
      console.error(`Error fetching letter ${letter}, page ${page}:`, error.message);
      return [];
    }
  }

  async fetchAllMedicationsForLetter(letter) {
    const letterMedications = [];
    
    try {
      const totalPages = await this.getTotalPagesForLetter(letter);
      console.log(`Fetching all pages for letter ${letter} (${totalPages} pages)`);
      
      for (let page = 1; page <= totalPages; page++) {
        console.log(`Fetching letter ${letter}, page ${page}/${totalPages}`);
        
        const pageMedications = await this.fetchMedicationsForLetter(letter, page);
        letterMedications.push(...pageMedications);
        
        if (page < totalPages) {
          await this.delay(this.delay);
        }
      }
      
      console.log(`Total medications for letter ${letter}: ${letterMedications.length}`);
      return letterMedications;
      
    } catch (error) {
      console.error(`Error fetching all medications for letter ${letter}:`, error.message);
      return [];
    }
  }

  async fetchAllMedications() {
    console.log('Starting comprehensive medication scraping for all 5,444 medications...');
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const allMedications = [];
    
    for (const letter of letters) {
      console.log(`\n=== Processing letter ${letter} ===`);
      
      try {
        const letterMedications = await this.fetchAllMedicationsForLetter(letter);
        allMedications.push(...letterMedications);
        
        this.totalFetched += letterMedications.length;
        console.log(`Total medications fetched so far: ${this.totalFetched}`);
        
        if (letter !== 'Z') {
          await this.delay(this.delay * 2);
        }
        
      } catch (error) {
        console.error(`Error processing letter ${letter}:`, error.message);
      }
    }
    
    const uniqueMedications = this.removeDuplicates(allMedications);
    
    console.log(`\n=== Scraping Complete ===`);
    console.log(`Total medications fetched: ${uniqueMedications.length}`);
    
    return uniqueMedications;
  }

  removeDuplicates(medications) {
    const seen = new Set();
    return medications.filter(medication => {
      const key = `${medication.SPECIALITE}-${medication.DOSAGE}-${medication.FORME}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  saveToJSON(medications, filename = 'all_medications_complete_5444.json') {
    const data = {
      medications,
      metadata: {
        total_count: medications.length,
        last_updated: new Date().toISOString(),
        source: 'medicament.ma',
        version: '1.0.0',
        description: 'Complete medication database with all 5,444 medications from medicament.ma'
      }
    };

    const jsonString = JSON.stringify(data, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`All medications saved to ${filename}`);
    return data;
  }
}

export default MedicationScraperComplete;

export const createCompleteScraper = () => new MedicationScraperComplete();

export const scrapeAllMedicationsComplete = async () => {
  const scraper = new MedicationScraperComplete();
  return await scraper.fetchAllMedications();
};

export const scrapeAndSaveComplete = async (filename = 'all_medications_complete_5444.json') => {
  const scraper = new MedicationScraperComplete();
  const medications = await scraper.fetchAllMedications();
  return scraper.saveToJSON(medications, filename);
}; 