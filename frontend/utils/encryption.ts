import CryptoJS from "crypto-js";

class FrontendEncryption {
  private secretKey = "my-secret-key-2024"; // In production, use environment variable
  
  encryptString(data: string): string {
    if (!data) return data;
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  }
  
  decryptString(encryptedData: string): string {
    if (!encryptedData) return encryptedData;
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  
  encryptFormData(formData: FormData): FormData {
    const encryptedFormData = new FormData();
    
    // Fields to encrypt
    const sensitiveFields = [
      'age', 'height', 'weight', 'gender', 'blood_type',
      'sleep_hours', 'had_alcohol_last_24h', 'ate_before_donation',
      'ate_fatty_food', 'recent_tattoo_or_piercing', 'has_chronic_condition',
      'condition_controlled', 'last_donation_date'
    ];
    
    for (const [key, value] of formData.entries()) {
      if (sensitiveFields.includes(key) && typeof value === 'string') {
        // Encrypt sensitive text fields
        const encrypted = this.encryptString(value);
        encryptedFormData.append(key, encrypted);
        console.log(`[🔐 FRONTEND ENCRYPT] ${key}: "${value}" -> "${encrypted.substring(0, 30)}..."`);
      } else {
        // Keep non-sensitive fields as-is (including files)
        encryptedFormData.append(key, value);
      }
    }
    
    return encryptedFormData;
  }
}

export const frontendEncryption = new FrontendEncryption();
