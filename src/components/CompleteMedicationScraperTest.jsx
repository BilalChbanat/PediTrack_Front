import React, { useState } from 'react';
import { Button, Typography, Card, CardBody, Progress } from '@material-tailwind/react';
import { scrapeAllMedicationsComplete, scrapeAndSaveComplete, createCompleteScraper } from '../api/medicationScraperComplete';

const CompleteMedicationScraperTest = () => {
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFetched, setTotalFetched] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startScraping = async () => {
    setIsScraping(true);
    setProgress(0);
    setTotalFetched(0);
    setCurrentLetter('');
    setCurrentPage('');
    setResult(null);
    setError(null);

    try {
      console.log('Starting comprehensive medication scraping for all 5,444 medications...');
      
      const scraper = createCompleteScraper();
      
      // Override methods to track progress
      const originalFetchAllMedicationsForLetter = scraper.fetchAllMedicationsForLetter.bind(scraper);
      scraper.fetchAllMedicationsForLetter = async (letter) => {
        setCurrentLetter(letter);
        const result = await originalFetchAllMedicationsForLetter(letter);
        setTotalFetched(prev => prev + result.length);
        setProgress(prev => prev + (100 / 26)); // 26 letters
        return result;
      };

      const originalFetchMedicationsForLetter = scraper.fetchMedicationsForLetter.bind(scraper);
      scraper.fetchMedicationsForLetter = async (letter, page) => {
        setCurrentPage(`Page ${page}`);
        return await originalFetchMedicationsForLetter(letter, page);
      };

      const medications = await scraper.fetchAllMedications();
      
      setResult({
        total: medications.length,
        medications: medications.slice(0, 10), // Show first 10 as sample
        message: `Successfully scraped ${medications.length} medications from all 5,444 available!`
      });
      
      console.log(`Scraping completed: ${medications.length} medications found`);
      
    } catch (err) {
      setError(err.message);
      console.error('Scraping failed:', err);
    } finally {
      setIsScraping(false);
      setProgress(100);
    }
  };

  const downloadAllMedications = async () => {
    try {
      setIsScraping(true);
      setError(null);
      
      console.log('Starting download of all 5,444 medications...');
      const result = await scrapeAndSaveComplete('all_medications_complete_5444.json');
      
      setResult({
        total: result.medications.length,
        message: `Downloaded ${result.medications.length} medications to all_medications_complete_5444.json`
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Download failed:', err);
    } finally {
      setIsScraping(false);
    }
  };

  const testSingleLetter = async () => {
    try {
      setIsScraping(true);
      setError(null);
      
      const scraper = createCompleteScraper();
      const medications = await scraper.fetchAllMedicationsForLetter('A');
      
      setResult({
        total: medications.length,
        medications: medications.slice(0, 10),
        message: `Test completed: Found ${medications.length} medications starting with 'A'`
      });
      
    } catch (err) {
      setError(err.message);
      console.error('Test failed:', err);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Typography variant="h3" className="mb-6 text-center">
        Complete Medication Scraper Test
      </Typography>
      
      <Typography variant="h6" className="mb-4 text-center text-gray-600">
        Comprehensive scraper for all 5,444 medications from medicament.ma
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <Button
              onClick={testSingleLetter}
              disabled={isScraping}
              color="blue"
              className="w-full"
            >
              Test Letter 'A'
            </Button>
            <Typography variant="small" className="mt-2">
              Test scraping for one letter only
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Button
              onClick={startScraping}
              disabled={isScraping}
              color="green"
              className="w-full"
            >
              {isScraping ? 'Scraping...' : 'Start Full Scrape'}
            </Button>
            <Typography variant="small" className="mt-2">
              Scrape all 5,444 medications
            </Typography>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Button
              onClick={downloadAllMedications}
              disabled={isScraping}
              color="purple"
              className="w-full"
            >
              {isScraping ? 'Downloading...' : 'Download All'}
            </Button>
            <Typography variant="small" className="mt-2">
              Scrape and download JSON file
            </Typography>
          </CardBody>
        </Card>
      </div>

      {isScraping && (
        <Card className="mb-6">
          <CardBody>
            <Typography variant="h6" className="mb-4">
              Scraping Progress
            </Typography>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <Typography variant="small">
                  Progress: {progress.toFixed(1)}%
                </Typography>
                <Typography variant="small">
                  Current: {currentLetter || 'Initializing...'} {currentPage && `- ${currentPage}`}
                </Typography>
              </div>
              <Progress value={progress} color="blue" />
            </div>
            
            <Typography variant="small" className="text-gray-600">
              Total medications fetched: {totalFetched}
            </Typography>
            
            <Typography variant="small" className="text-gray-600">
              Target: 5,444 medications
            </Typography>
          </CardBody>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200">
          <CardBody>
            <Typography variant="h6" color="red" className="mb-2">
              Error
            </Typography>
            <Typography variant="small" color="red">
              {error}
            </Typography>
          </CardBody>
        </Card>
      )}

      {result && (
        <Card className="mb-6 border-green-200">
          <CardBody>
            <Typography variant="h6" color="green" className="mb-2">
              Success!
            </Typography>
            <Typography variant="small" className="mb-4">
              {result.message}
            </Typography>
            
            {result.medications && result.medications.length > 0 && (
              <div>
                <Typography variant="small" className="font-semibold mb-2">
                  Sample medications:
                </Typography>
                <div className="max-h-60 overflow-y-auto">
                  {result.medications.map((med, index) => (
                    <div key={index} className="p-2 border-b border-gray-100">
                      <Typography variant="small" className="font-semibold">
                        {med.SPECIALITE}
                      </Typography>
                      <Typography variant="small" className="text-gray-600">
                        {med.DOSAGE} - {med.FORME} - {med.PPV} dhs
                      </Typography>
                      <Typography variant="small" className="text-blue-600">
                        {med.url}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <Typography variant="h6" className="mb-4">
            Key Improvements
          </Typography>
          <div className="space-y-2 text-sm">
            <Typography variant="small">
              • <strong>Correct URL Structure:</strong> Uses `/listing-des-medicaments/page/{page}/?lettre={letter}`
            </Typography>
            <Typography variant="small">
              • <strong>Proper Pagination:</strong> Detects total pages for each letter automatically
            </Typography>
            <Typography variant="small">
              • <strong>Complete Coverage:</strong> Targets all 5,444 medications (not just 961)
            </Typography>
            <Typography variant="small">
              • <strong>Respectful Scraping:</strong> 500ms delays between requests
            </Typography>
            <Typography variant="small">
              • <strong>Progress Tracking:</strong> Real-time progress with current letter and page
            </Typography>
            <Typography variant="small">
              • <strong>Error Handling:</strong> Robust fallback mechanisms
            </Typography>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <Typography variant="h6" className="mb-4">
            Expected Results
          </Typography>
          <div className="space-y-2 text-sm">
            <Typography variant="small">
              • <strong>Total Medications:</strong> ~5,444 (all from medicament.ma)
            </Typography>
            <Typography variant="small">
              • <strong>Scraping Time:</strong> 45-90 minutes (depending on server response)
            </Typography>
            <Typography variant="small">
              • <strong>File Size:</strong> ~5-10MB JSON file
            </Typography>
            <Typography variant="small">
              • <strong>Memory Usage:</strong> ~50-100MB during scraping
            </Typography>
            <Typography variant="small">
              • <strong>Network Requests:</strong> ~500-1000 requests (26 letters × multiple pages)
            </Typography>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CompleteMedicationScraperTest; 