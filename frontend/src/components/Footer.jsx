function Footer() {
  return (
    <footer className="dark-gradient-bg text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-blue-100 text-sm">
            © 2025 AI-Powered Urban Growth Dashboard | Smart City Analytics | All Rights Reserved
          </p>
          <div className="flex space-x-6">
            <a href="#privacy" className="text-blue-100 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#terms" className="text-blue-100 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
            <a href="#contact" className="text-blue-100 hover:text-white transition-colors text-sm">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

// .