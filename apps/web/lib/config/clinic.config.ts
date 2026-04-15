// Clinic Configuration
// Update these details to match your clinic information

export const CLINIC_CONFIG = {
  // Basic Information
  name: "Prathamesh Advanced Diagnostic Center",
  shortName: "PADC",
  tagline: "Your Health, Our Priority",
  
  // Contact Information
  address: {
    street: "Near Old CBS",
    city: "Nashik",
    state: "Maharashtra",
    pincode: "422001",
    fullAddress: "Near Old CBS, Nashik — 422001"
  },
  
  contact: {
    phone: "+91 98765 43210",
    email: "hello@padc.in",
    website: "www.padc.in",
    timings: "8 AM – 11 PM"
  },
  
  // Accreditation & Registration
  accreditation: {
    nabl: true,
    iso: "ISO 15189 Certified",
    labRegNo: "MH-12345",
    displayText: "NABL Accredited · Lab Reg. No. MH-12345 · ISO 15189 Certified"
  },
  
  // Medical Staff
  doctors: {
    pathologist: {
      name: "Dr. Sandeep Mall",
      qualification: "MBBS, MD Pathologist",
      registrationNo: "MCI-12345"
    },
    // Add more doctors as needed
  },
  
  // Report Settings
  report: {
    footer: {
      disclaimer: "This is a computer generated report and is valid without a physical signature.",
      showDigitalSignature: true
    },
    branding: {
      primaryColor: "#1a3a5c", // Navy blue
      secondaryColor: "#1D9E75", // Teal
      logoUrl: "/logo.png" // Optional: Add logo path
    }
  }
};

// Helper function to get full clinic address
export const getFullAddress = () => {
  const { street, city, state, pincode } = CLINIC_CONFIG.address;
  return `${street}, ${city}, ${state} — ${pincode}`;
};

// Helper function to get contact line
export const getContactLine = () => {
  const { phone, email, timings } = CLINIC_CONFIG.contact;
  return `${phone} · ${email} · ${timings}`;
};

// Helper function to get pathologist details
export const getPathologist = () => {
  return CLINIC_CONFIG.doctors.pathologist;
};
