
import React from 'react';
import { Barcode } from 'lucide-react';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
      <Barcode className="h-12 w-12 mb-4 text-red-500" />
      <h3 className="text-lg font-semibold mb-2">Se requiere acceso a la cámara</h3>
      <p className="text-center">{message || 'Por favor permita el acceso a la cámara para utilizar el escáner de códigos de barras.'}</p>
    </div>
  );
};

export default ErrorMessage;
