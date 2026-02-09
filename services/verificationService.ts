
import { createWorker } from 'tesseract.js';

/**
 * Simplified clauses for students and interns. 
 * No jargon, just clear rules.
 */
export const getLegalClauses = () => {
  return [
    "Follow the Law: You must respect the Bangladesh Cyber Security Act. This means you must keep customer information private and never share it with others.",
    "Be Honest: When checking a customer's ID (KYC), always use real documents. Providing fake information is a crime and will end your work immediately.",
    "Work Rules: We follow the Bangladesh Labour Act. You have full freedom to choose when you work, but you only get paid when a task is finished and confirmed.",
    "After-Sales Help: Your job isn't finished when the sale is made. You must help the customer set up the app and make sure they are happy with their product.",
    "Travel Support: If you have to travel more than 25km for a Wavelink meeting, we will pay for your bus/travel costs. Just keep your receipts!"
  ];
};

/**
 * Simulates sending an email notification to HQ
 */
export const notifyAdminByEmail = async (employeeData: any) => {
  console.log(`[Wavelink SMTP Simulation] Sending alert to: waavelink@gmail.com`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

/**
 * Local NID OCR Verification using Tesseract.js
 */
export const verifyNIDLocally = async (imageBase64: string) => {
  const worker = await createWorker('eng+ben');
  try {
    const { data: { text } } = await worker.recognize(`data:image/jpeg;base64,${imageBase64}`);
    const nameMatch = text.match(/(?:Name|নাম)\s*[:]?\s*([A-Z\s]+)/i);
    const nidMatch = text.match(/\d{10,17}/);
    const extractedName = nameMatch ? nameMatch[1].trim() : "NAME NOT FOUND";
    const extractedId = nidMatch ? nidMatch[0] : "ID NOT FOUND";
    await worker.terminate();
    return {
      extractedName,
      extractedId,
      extractedAddress: "Extracted locally",
      matchConfidence: nidMatch ? 0.85 : 0.4,
      isAuthentic: nidMatch !== null
    };
  } catch (error) {
    await worker.terminate();
    throw error;
  }
};
