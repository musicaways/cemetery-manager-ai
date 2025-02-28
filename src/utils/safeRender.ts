
/**
 * Utility per il rendering sicuro di contenuti potenzialmente problematici
 */

/**
 * Converte in modo sicuro qualsiasi tipo di dato in una stringa renderizzabile
 * @param value Valore da convertire in stringa
 * @returns Stringa sicura per il rendering
 */
export const toSafeString = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.error('Errore nella serializzazione del valore:', e);
      return '[Oggetto non serializzabile]';
    }
  }
  
  return String(value);
};

/**
 * Valida se un oggetto è sicuro per essere renderizzato come proprietà di un componente
 * @param props Oggetto delle proprietà
 * @returns Proprietà sanitizzate
 */
export const sanitizeProps = <T extends Record<string, any>>(props: T): T => {
  const result = { ...props };
  
  // Controlla tutte le proprietà
  Object.keys(result).forEach(key => {
    const value = result[key];
    
    // Proprietà problematiche specifiche
    if (key === 'content' || key === 'message' || key === 'text') {
      result[key] = toSafeString(value);
    }
    
    // Sanitizza ricorsivamente oggetti annidati, escludendo le funzioni e altri tipi speciali
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeProps(value);
    }
    
    // Sanitizza gli array
    if (Array.isArray(value)) {
      result[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeProps(item) 
          : item
      );
    }
  });
  
  return result;
};

/**
 * Valida se un valore può essere renderizzato direttamente come figlio React
 * @param value Valore da controllare
 * @returns true se il valore è sicuro per il rendering
 */
export const isValidReactChild = (value: any): boolean => {
  // null e undefined sono validi per React (vengono ignorati)
  if (value === null || value === undefined) {
    return true;
  }
  
  // Stringhe e numeri sono validi
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  
  // Gli array sono validi se tutti gli elementi sono validi
  if (Array.isArray(value)) {
    return value.every(isValidReactChild);
  }
  
  // Gli oggetti React sono validi, ma non altri oggetti generici
  if (typeof value === 'object') {
    // React elements hanno $$typeof
    return !!(value && (value as any).$$typeof);
  }
  
  return false;
};
