
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
export const sanitizeProps = <T extends Record<string, any>>(props: T): Record<string, any> => {
  // Crea un nuovo oggetto invece di modificare direttamente il parametro
  const result: Record<string, any> = {};
  
  // Controlla tutte le proprietà
  Object.keys(props).forEach(key => {
    const value = props[key];
    
    // Proprietà problematiche specifiche
    if (key === 'content' || key === 'message' || key === 'text') {
      result[key] = toSafeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Sanitizza ricorsivamente oggetti annidati
      result[key] = sanitizeProps(value);
    } else if (Array.isArray(value)) {
      // Sanitizza gli array
      result[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeProps(item) 
          : item
      );
    } else {
      // Copia il valore originale per proprietà non problematiche
      result[key] = value;
    }
  });
  
  return result as T;
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
