// Category Management Utilities

/**
 * Load categories from localStorage
 * @returns {Array} Array of category objects
 */
export const loadCategories = () => {
  try {
    const savedCategories = localStorage.getItem('transactionCategories');
    if (savedCategories) {
      return JSON.parse(savedCategories);
    } else {
      // Return default categories if none exist
      return getDefaultCategories();
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

/**
 * Save categories to localStorage
 * @param {Array} categories - Array of category objects
 */
export const saveCategories = (categories) => {
  try {
    localStorage.setItem('transactionCategories', JSON.stringify(categories));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('categoryUpdated'));
  } catch (error) {
    console.error('Error saving categories:', error);
  }
};

/**
 * Get default categories
 * @returns {Array} Default category array
 */
export const getDefaultCategories = () => {
  return [
    {
      id: 'travel-tourism',
      name: 'ভ্রমণ ও পর্যটন',
      icon: '✈️',
      description: 'ভ্রমণ এবং পর্যটন সংক্রান্ত সব সেবা',
      subCategories: [
        { id: 'hajj', name: 'হাজ্জ', icon: '🕋', description: 'হাজ্জ প্যাকেজ এবং সেবা' },
        { id: 'umrah', name: 'উমরাহ', icon: '🕌', description: 'উমরাহ প্যাকেজ এবং সেবা' },
        { id: 'air-ticket', name: 'এয়ার টিকেট', icon: '✈️', description: 'বিমান টিকেট এবং ভ্রমণ' },
        { id: 'visa', name: 'ভিসা সার্ভিস', icon: '📋', description: 'ভিসা প্রক্রিয়াকরণ এবং সহায়তা' },
        { id: 'hotel', name: 'হোটেল বুকিং', icon: '🏨', description: 'হোটেল রিজার্ভেশন' },
        { id: 'insurance', name: 'ইনসুরেন্স', icon: '🛡️', description: 'ভ্রমণ এবং স্বাস্থ্য বীমা' }
      ]
    },
    {
      id: 'financial-services',
      name: 'আর্থিক সেবা',
      icon: '💰',
      description: 'আর্থিক লেনদেন এবং ব্যাংকিং সেবা',
      subCategories: [
        { id: 'loan-giving', name: 'লোন দেওয়া', icon: '💰', description: 'অন্যের কাছে ঋণ প্রদান' },
        { id: 'loan-receiving', name: 'লোন নেওয়া', icon: '💸', description: 'অন্যের কাছ থেকে ঋণ গ্রহণ' },
        { id: 'money-exchange', name: 'মানি এক্সচেঞ্জ', icon: '💱', description: 'মুদ্রা বিনিময় সেবা' },
        { id: 'investment', name: 'বিনিয়োগ', icon: '📈', description: 'বিভিন্ন বিনিয়োগ কার্যক্রম' },
        { id: 'savings', name: 'সঞ্চয়', icon: '🏦', description: 'ব্যাংক সঞ্চয় এবং জমা' }
      ]
    }
  ];
};

/**
 * Find a category by ID
 * @param {string} categoryId - Category ID to search for
 * @returns {Object|null} Category object or null if not found
 */
export const findCategoryById = (categoryId) => {
  const categories = loadCategories();
  return categories.find(category => category.id === categoryId) || null;
};

/**
 * Find a sub-category by ID
 * @param {string} categoryId - Parent category ID
 * @param {string} subCategoryId - Sub-category ID to search for
 * @returns {Object|null} Sub-category object or null if not found
 */
export const findSubCategoryById = (categoryId, subCategoryId) => {
  const category = findCategoryById(categoryId);
  if (category && category.subCategories) {
    return category.subCategories.find(sub => sub.id === subCategoryId) || null;
  }
  return null;
};

/**
 * Get all sub-categories from all categories
 * @returns {Array} Array of all sub-categories with their parent category info
 */
export const getAllSubCategories = () => {
  const categories = loadCategories();
  const allSubCategories = [];
  
  categories.forEach(category => {
    if (category.subCategories) {
      category.subCategories.forEach(subCategory => {
        allSubCategories.push({
          ...subCategory,
          parentCategory: {
            id: category.id,
            name: category.name,
            icon: category.icon
          }
        });
      });
    }
  });
  
  return allSubCategories;
};

/**
 * Initialize default categories if none exist
 */
export const initializeDefaultCategories = () => {
  const existingCategories = localStorage.getItem('transactionCategories');
  if (!existingCategories) {
    const defaultCategories = getDefaultCategories();
    saveCategories(defaultCategories);
  }
};
