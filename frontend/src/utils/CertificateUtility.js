import { jsPDF } from "jspdf";

export const generateCertificate = (userName, eventTitle, eventDate) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- BACKGROUND & BORDER ---
    // Outer border
    doc.setDrawColor(79, 70, 229); // Ignite Indigo
    doc.setLineWidth(2);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // --- LOGO / BRANDING ---
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("IGNITE", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Certificate of Participation", pageWidth / 2, 40, { align: "center" });

    // --- MAIN CONTENT ---
    doc.setTextColor(31, 41, 55); // Dark gray
    doc.setFontSize(18);
    doc.text("This is to certify that", pageWidth / 2, 65, { align: "center" });

    doc.setFontSize(36);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(userName, pageWidth / 2, 85, { align: "center" });

    // VERIFIED Status Badge
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129); // Success Green
    doc.text("VERIFIED Participant", pageWidth / 2, 95, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    doc.text("has successfully participated in the event", pageWidth / 2, 112, { align: "center" });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(`"${eventTitle}"`, pageWidth / 2, 132, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Held on ${new Date(eventDate).toLocaleDateString()}`, pageWidth / 2, 147, { align: "center" });

    // --- FOOTER / SIGNATURE ---
    doc.setDrawColor(209, 213, 219);
    doc.line(pageWidth / 2 - 40, 175, pageWidth / 2 + 40, 175);
    doc.setFontSize(10);
    doc.text("Authorized Coordinator", pageWidth / 2, 180, { align: "center" });
    doc.text("Ignite Platform Team", pageWidth / 2, 185, { align: "center" });

    // Save the PDF
    doc.save(`${userName.replace(/\s+/g, "_")}_Ignite_Certificate.pdf`);
};
