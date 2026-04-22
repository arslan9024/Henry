import React from 'react';

const RealEstateQuotation = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 print:bg-white print:py-0">
      {/* Print Button - Hidden during print */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-red-700 text-white px-6 py-2 rounded shadow-md hover:bg-red-800 transition"
        >
          Print to PDF
        </button>
      </div>

      {/* A4 Page Container */}
      <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-[15mm] shadow-2xl print:shadow-none print:m-0 print:w-full">
        
        {/* Header */}
        <div className="text-center border-b-4 border-red-700 pb-4 mb-6">
          <img src="/logo.png" alt="White Caves Logo" className="max-w-[260px] mx-auto mb-2" />
          <h1 className="text-2xl font-bold tracking-widest text-gray-800">QUOTATION</h1>
          <p className="text-xs text-gray-500 uppercase">DED License No.: 1388443</p>
        </div>

        {/* Thank You Note */}
        <div className="bg-red-50 border-l-4 border-red-700 p-4 mb-6 text-sm leading-relaxed">
          Thank you for choosing <strong>White Caves Real Estate L.L.C</strong>. We are pleased to provide the lease quotation for <strong>Unit 449, Avencia, Damac Hills 2</strong>.
        </div>

        {/* 1. Property Details */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-red-700 border-b border-gray-200 pb-1 mb-2 uppercase">1. Property Specifications</h2>
          <div className="space-y-1 text-sm">
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Property:</span><span>Damac Hills 2 – Avencia Cluster, Unit 449</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Description:</span><span>4 Bedroom Townhouse (Corner Unit)</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Size (Plot/BUA):</span><span>1,505.23 / 1,776.26 Sq. Ft.</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Parking:</span><span>Two (2) Allocated Spaces</span></div>
          </div>
        </section>

        {/* 2. Lease Terms */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-red-700 border-b border-gray-200 pb-1 mb-2 uppercase">2. Lease Terms</h2>
          <div className="space-y-1 text-sm">
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Contract Period:</span><span>06 May 2026 to 05 May 2027</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Annual Rent:</span><span>AED 85,000/- (Payable in 1 Cheque)</span></div>
          </div>
        </section>

        {/* 3. Payment Schedule Table */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-red-700 border-b border-gray-200 pb-1 mb-2 uppercase">3. Payment Schedule</h2>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-50 text-red-700">
                <th className="border border-gray-300 p-2 text-left">Due Date</th>
                <th className="border border-gray-300 p-2 text-left">Amount (AED)</th>
                <th className="border border-gray-300 p-2 text-left">Beneficiary / Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">___________</td><td className="border border-gray-300 p-2">4,250</td><td className="border border-gray-300 p-2 text-gray-800 font-medium">MUHAMMAD NAEEM MUHAMMAD H K KHAN (Deposit)</td></tr>
              <tr><td className="border border-gray-300 p-2">___________</td><td className="border border-gray-300 p-2">4,250</td><td className="border border-gray-300 p-2">White Caves Real Estate L.L.C (Agency Fee)</td></tr>
              <tr><td className="border border-gray-300 p-2">___________</td><td className="border border-gray-300 p-2">265</td><td className="border border-gray-300 p-2">White Caves Real Estate L.L.C (Ejari Fee)</td></tr>
              <tr className="font-bold"><td className="border border-gray-300 p-2">06 May 2026</td><td className="border border-gray-300 p-2">85,000</td><td className="border border-gray-300 p-2">MUHAMMAD NAEEM MUHAMMAD H K KHAN (Annual Rent)</td></tr>
            </tbody>
          </table>
        </section>

        {/* 4. Bank Details */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-red-700 border-b border-gray-200 pb-1 mb-2 uppercase">4. Landlord Bank Details (Official)</h2>
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md text-sm space-y-1">
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Beneficiary:</span><span className="font-bold">MUHAMMAD NAEEM MUHAMMAD H K KHAN</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">IBAN:</span><span className="font-mono tracking-wider">AE030359356491705358002</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">Bank Name:</span><span>First Abu Dhabi Bank PJSC (FAB)</span></div>
            <div className="flex"><span className="w-44 font-semibold text-gray-700">SWIFT Code:</span><span>NBADAEAA</span></div>
          </div>
        </section>

        {/* Signatures Area */}
        <div className="flex justify-between items-end mt-12">
          {/* Company Signature & Stamp */}
          <div className="w-5/12 relative">
            <p className="text-xs font-bold mb-8">For White Caves Real Estate L.L.C</p>
            
            {/* STAMP: Positioned absolutely behind/beside signature */}
            <img 
              src="/stamp.png" 
              alt="Company Stamp" 
              className="absolute w-32 h-auto opacity-90 z-0 left-28 bottom-12 rotate-[-10deg]"
            />
            
            {/* SIGNATURE: Positioned on top */}
            <img 
              src="/signature.png" 
              alt="Arslan Malik Signature" 
              className="w-40 h-auto relative z-10 mb-[-15px]" 
            />
            
            <div className="border-t-2 border-gray-800 pt-1">
              <p className="text-sm font-bold uppercase">Arslan Malik</p>
              <p className="text-xs text-gray-500">Managing Director</p>
            </div>
          </div>

          {/* Tenant Side */}
          <div className="w-5/12 text-right">
            <p className="text-xs font-bold mb-32">Tenant Acknowledgment</p>
            <div className="border-t-2 border-gray-800 pt-1">
              <p className="text-sm">Signature & Date</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
          This document is generated for quotation purposes. Subject to mutual signing of the unified lease contract.
        </div>
      </div>
    </div>
  );
};

export default RealEstateQuotation;
