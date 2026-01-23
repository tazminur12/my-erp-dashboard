import React from 'react';
import { Mail, Phone, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">BIN Rashid Group ERP</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed transition-colors duration-200">
              আমরা হলাম বিস্তৃত ব্যবসায়িক সমাধানের শীর্ষস্থানীয় প্রদানকারী, 
              উদ্ভাবনী প্রযুক্তি এবং বিশেষজ্ঞ নির্দেশনার মাধ্যমে সংস্থাগুলিকে 
              অপারেশন সহজ করতে এবং টেকসই বৃদ্ধি অর্জনে সাহায্য করি।
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">যোগাযোগের তথ্য</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">info@mycompany.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">+১ (৫৫৫) ১২৩-৪৫৬৭</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">আমাদের অনুসরণ করুন</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 bg-blue-400 dark:bg-blue-400 text-white rounded-lg hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 bg-blue-700 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
