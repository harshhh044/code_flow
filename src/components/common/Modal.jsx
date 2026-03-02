import React, { useEffect, useRef } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} overflow-hidden animate-[modalSlide_0.3s_ease] ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            {title && <h3 className="text-xl font-bold text-gray-800">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-10 h-10 text-gray-500 transition-all duration-300 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 hover:rotate-90"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 px-8 py-4 border-t border-gray-100 bg-gray-50">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlide {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// Specialized modals from your HTML
export const SupportModal = ({ isOpen, onClose, children }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    className="overflow-hidden"
  >
    <div className="relative p-6 mb-6 -mx-8 -mt-6 text-white bg-gradient-to-br from-blue-900 to-teal-600">
      <div className="flex items-center gap-3 mb-1">
        <i className="text-2xl fas fa-headset"></i>
        <h3 className="text-2xl font-bold">Technical Support</h3>
      </div>
      <p className="text-sm text-white/80">Report issues or request assistance</p>
      <button
        onClick={onClose}
        className="absolute flex items-center justify-center w-10 h-10 transition-all rounded-full top-4 right-4 bg-white/20 hover:bg-white/30 hover:rotate-90"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
    {children}
  </Modal>
);

export const ReviewModal = ({ isOpen, onClose, onSubmit, children }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Review Your Grievance"
    size="lg"
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Edit
        </Button>
        <Button variant="primary" onClick={onSubmit} icon="fa-paper-plane">
          Submit Grievance
        </Button>
      </>
    }
  >
    {children}
  </Modal>
);

export const AnonymousSuccessModal = ({ isOpen, onClose, code }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    // Show toast or feedback
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing without action
      size="md"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 text-4xl text-white rounded-full shadow-lg bg-gradient-to-br from-violet-600 to-purple-700 shadow-violet-500/30">
          <i className="fas fa-user-secret"></i>
        </div>
        
        <h2 className="mb-2 text-2xl font-bold text-violet-700">Anonymous Complaint Submitted</h2>
        <p className="mb-6 text-gray-500">Your identity is completely protected. Save this tracking code securely:</p>
        
        <div className="relative p-6 mb-4 overflow-hidden font-mono text-2xl font-bold tracking-widest text-white border-2 border-dashed bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-white/30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
          {code}
        </div>
        
        <Button 
          variant="anonymous" 
          onClick={copyToClipboard}
          className="w-full mb-4"
          icon="fa-copy"
        >
          Copy Code to Clipboard
        </Button>
        
        <div className="p-4 mb-4 text-left border bg-amber-50 border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <i className="mr-2 fas fa-lightbulb"></i>
            <strong>Tip:</strong> Screenshot this page or save the code in your notes. You will need it to check status updates.
          </p>
        </div>
        
        <p className="mb-4 text-sm font-semibold text-red-600 animate-pulse">
          <i className="mr-2 fas fa-exclamation-triangle"></i>
          If you lose this code, it CANNOT be recovered!
        </p>
        
        <Button variant="outline" onClick={onClose} className="w-full">
          I have saved the code safely
        </Button>
      </div>

      <style>{`
        @keyframes shimmer {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </Modal>
  );
};

export default Modal;