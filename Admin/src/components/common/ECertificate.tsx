import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ECertificate({
  writerName = "Writer Name",
  competitionName = "Competition Name",
  editorName = "Editor Name",
  participantName = "Participant Name",
  logoUrl = "https://admin.panchmeshali.com/logo.png",
  position="1"
}) {
  const certRef = useRef(null);

  const downloadCertificate = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${participantName}_certificate.pdf`);
  };

  return (
    <div className="w-full flex flex-col items-center mb-8 px-2">
      {/* Responsive wrapper */}
      <div className="w-full max-w-full overflow-x-auto">
        {/* The certificate itself stays at A4 ratio */}
        <div
          ref={certRef}
          className="
            relative 
            bg-white 
            border-8 
            border-yellow-500 
            rounded-2xl 
            shadow-2xl 
            p-4 sm:p-8 
            flex flex-col justify-center 
            mx-auto
          "
          style={{ width: 842, height: 595 }} // A4 landscape in px
        >
          {/* Top Section */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl sm:text-4xl font-bold text-gray-800 uppercase">
              Certificate of Participation
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 italic">
              This certifies that
            </p>
            <img
              src={logoUrl}
              alt="Logo"
              crossOrigin="anonymous"
              className="h-16 w-16 sm:h-24 sm:w-24 object-contain mt-2"
            />
          </div>

          {/* Participant */}
          <div className="text-center mt-4 sm:mt-6">
            <h2 className="text-2xl sm:text-5xl font-extrabold text-blue-700">
              {participantName}
            </h2>
            <p className="text-gray-700 text-base sm:text-xl mt-2 sm:mt-4">
              has successfully participated in the
            </p>
            <h3 className="text-lg sm:text-3xl font-semibold text-gray-800">
              {competitionName}
            </h3>
          </div>

          {/* Signatures */}
          <div className="flex flex-col sm:flex-row justify-around mt-6 sm:mt-10 gap-6 sm:gap-0">
            <div className="text-center">
              <p className="text-gray-800 font-medium mt-2 mb-2 sm:mt-2">{writerName}</p>
              <p id="certifies123" className="border-b-2 border-gray-400 w-32 sm:w-48 mx-auto" />
              <p className="text-gray-500 text-xs sm:text-sm">Writer</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-medium mt-2 mb-2 sm:mt-2">{position}</p>
              <p id="certifies123" className="border-b-2 border-gray-400 w-32 sm:w-48 mx-auto" />
              <p className="text-gray-500 text-xs sm:text-sm">Position in the competition</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-medium mt-2 mb-2 sm:mt-2">{editorName}</p>
              <p id="certifies" className="border-b-2 border-gray-400 w-32 sm:w-48 mx-auto" />
              <p className="text-gray-500 text-xs sm:text-sm">Editor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadCertificate}
        className="mt-6 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base"
      >
        Download Certificate
      </button>
    </div>
  );
}
