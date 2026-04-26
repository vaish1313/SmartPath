const axios = require('axios');
const FormData = require('form-data');

/**
 * Extract text from image using OCR.space API
 * @param {string} base64Image - Base64 encoded image string (with or without data:image prefix)
 * @returns {Promise<string>} - Extracted text from the image
 */
async function extractTextFromImage(base64Image) {
  try {
    // Ensure base64 has the data URI prefix
    const base64WithPrefix = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    const formData = new FormData();
    formData.append('base64Image', base64WithPrefix);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 for better accuracy
    formData.append('filetype', 'JPG'); // Default to JPG

    const response = await axios.post(
      'https://api.ocr.space/parse/image',
      formData,
      {
        headers: {
          'apikey': process.env.OCR_API_KEY || process.env.GOOGLE_VISION_API_KEY || '',
          ...formData.getHeaders()
        }
      }
    );

    const data = response.data;

    if (data.IsErroredOnProcessing || data.OCRExitCode !== 1) {
      const errorMsg = Array.isArray(data.ErrorMessage) 
        ? data.ErrorMessage.join(', ') 
        : data.ErrorMessage || 'OCR processing failed';
      console.error('OCR.space API error:', errorMsg);
      throw new Error(errorMsg);
    }

    const text = data.ParsedResults?.[0]?.ParsedText || '';
    return text;
  } catch (error) {
    console.error('OCR API error:', error.response?.data || error.message);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse prescription text and extract structured data
 * @param {string} rawText - Raw text extracted from prescription
 * @returns {object} - Structured prescription data
 */
function parsePrescriptionText(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    return {
      doctorName: null,
      hospitalOrClinic: null,
      patientName: null,
      date: null,
      diagnosis: null,
      suggestedTests: [],
      medications: [],
      additionalNotes: null,
      confidence: 'failed'
    };
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const upper = rawText.toUpperCase();

  // Known lab test keywords (Indian context)
  const TEST_KEYWORDS = [
    'CBC', 'COMPLETE BLOOD COUNT', 'HAEMOGLOBIN', 'HEMOGLOBIN', 'HB',
    'LFT', 'LIVER FUNCTION', 'KFT', 'KIDNEY FUNCTION', 'RFT', 'RENAL',
    'BLOOD SUGAR', 'FASTING', 'PPBS', 'HBA1C', 'GLUCOSE',
    'THYROID', 'TSH', 'T3', 'T4', 'FT3', 'FT4',
    'LIPID', 'CHOLESTEROL', 'TRIGLYCERIDE', 'HDL', 'LDL',
    'URINE', 'URINE R/M', 'URINE ROUTINE', 'URINE CULTURE',
    'CREATININE', 'UREA', 'URIC ACID', 'BUN',
    'ECG', 'X-RAY', 'XRAY', 'USG', 'ULTRASOUND', 'SONOGRAPHY',
    'VITAMIN D', 'VITAMIN B12', 'CALCIUM', 'PHOSPHORUS',
    'SERUM', 'PLASMA', 'ESR', 'CRP', 'WIDAL', 'DENGUE', 'MALARIA',
    'HIV', 'HBsAg', 'VDRL', 'TPHA', 'CULTURE', 'SENSITIVITY',
    'PSA', 'CEA', 'AFP', 'FERRITIN', 'IRON', 'TIBC',
    'BILIRUBIN', 'SGOT', 'SGPT', 'ALT', 'AST', 'ALP',
    'ALBUMIN', 'PROTEIN', 'GLOBULIN', 'GGT',
    'SODIUM', 'POTASSIUM', 'CHLORIDE', 'BICARBONATE',
    'MAGNESIUM', 'ZINC', 'COPPER',
    'PT', 'INR', 'APTT', 'BLEEDING TIME', 'CLOTTING TIME',
    'STOOL', 'OCCULT BLOOD', 'OVA', 'CYST',
    'SPUTUM', 'AFB', 'GRAM STAIN',
    'BLOOD GROUP', 'RH TYPE', 'CROSS MATCH',
    'PREGNANCY TEST', 'BETA HCG', 'PROLACTIN',
    'TESTOSTERONE', 'ESTROGEN', 'PROGESTERONE',
    'CORTISOL', 'ACTH', 'FSH', 'LH',
    'CT SCAN', 'MRI', 'PET SCAN', 'MAMMOGRAPHY',
    'ECHO', 'TMT', 'HOLTER', 'EEG', 'EMG', 'NCV'
  ];

  // Extract suggested tests
  const suggestedTests = [];
  const foundKeywords = new Set();

  TEST_KEYWORDS.forEach(keyword => {
    if (upper.includes(keyword)) {
      // Avoid duplicates (e.g., "CBC" and "COMPLETE BLOOD COUNT")
      const alreadyAdded = Array.from(foundKeywords).some(existing => 
        existing.includes(keyword) || keyword.includes(existing)
      );
      
      if (!alreadyAdded) {
        foundKeywords.add(keyword);
        suggestedTests.push({ 
          testName: keyword.charAt(0) + keyword.slice(1).toLowerCase(), 
          notes: null 
        });
      }
    }
  });

  // Extract doctor name (look for "Dr." or "Dr " prefix)
  let doctorName = null;
  const drMatch = rawText.match(/Dr\.?\s+([A-Z][a-zA-Z\s\.]{2,40})/);
  if (drMatch) {
    doctorName = 'Dr. ' + drMatch[1].trim();
  }

  // Extract hospital/clinic name (look for common patterns)
  let hospitalOrClinic = null;
  const hospitalPatterns = [
    /(?:Hospital|Clinic|Centre|Center|Diagnostic|Medical|Healthcare|Nursing Home)[:\s]+([A-Z][a-zA-Z\s&]{3,50})/i,
    /([A-Z][a-zA-Z\s&]{3,50})\s+(?:Hospital|Clinic|Centre|Center|Diagnostic)/i
  ];
  for (const pattern of hospitalPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      hospitalOrClinic = match[0].trim();
      break;
    }
  }

  // Extract patient name (look for "Name:" or "Patient:" prefix)
  let patientName = null;
  const nameMatch = rawText.match(/(?:Name|Patient|Patient Name)[:\s]+([A-Z][a-zA-Z\s]{2,40})/i);
  if (nameMatch) {
    patientName = nameMatch[1].trim();
  }

  // Extract date (common Indian formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)
  let date = null;
  const dateMatch = rawText.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
  if (dateMatch) {
    date = dateMatch[1];
  }

  // Extract diagnosis (look for Dx:, Diagnosis:, C/O:, k/c/o)
  let diagnosis = null;
  const dxPatterns = [
    /(?:Dx|Diagnosis)[:\s]+([^\n]{3,80})/i,
    /(?:C\/O|c\/o)[:\s]+([^\n]{3,80})/i,
    /(?:K\/C\/O|k\/c\/o)[:\s]+([^\n]{3,80})/i,
    /(?:Chief Complaint|CC)[:\s]+([^\n]{3,80})/i
  ];
  for (const pattern of dxPatterns) {
    const match = rawText.match(pattern);
    if (match) {
      diagnosis = match[1].trim();
      break;
    }
  }

  // Extract medications (look for Rx:, Medicines:, etc.)
  const medications = [];
  const rxMatch = rawText.match(/(?:Rx|Medicines?|Drugs?)[:\s]+([\s\S]{10,500})/i);
  if (rxMatch) {
    const medText = rxMatch[1];
    const medLines = medText.split('\n').slice(0, 10); // Limit to first 10 lines
    
    medLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 3 && !TEST_KEYWORDS.some(kw => trimmed.toUpperCase().includes(kw))) {
        // Simple medication parsing
        const parts = trimmed.split(/[-–—]/);
        medications.push({
          name: parts[0]?.trim() || trimmed,
          dosage: parts[1]?.trim() || null,
          frequency: parts[2]?.trim() || null,
          duration: parts[3]?.trim() || null
        });
      }
    });
  }

  // Confidence scoring
  let confidence = 'low';
  if (suggestedTests.length > 0 && doctorName) {
    confidence = 'high';
  } else if (suggestedTests.length > 0 || doctorName) {
    confidence = 'medium';
  } else if (rawText.length > 20 && (medications.length > 0 || diagnosis)) {
    confidence = 'low';
  } else {
    confidence = 'failed';
  }

  return {
    doctorName,
    hospitalOrClinic,
    patientName,
    date,
    diagnosis,
    suggestedTests,
    medications,
    additionalNotes: null,
    confidence
  };
}

module.exports = { extractTextFromImage, parsePrescriptionText };
