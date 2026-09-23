import { jsPDF } from "jspdf";
import { DatasetState, EvaluationMetrics, RecommendationResult, UserStats, Book } from "../types";

export interface ReportData {
  dataset: DatasetState;
  metrics: EvaluationMetrics | null;
  selectedUser?: UserStats | null;
  selectedBook?: Book | null;
  recommendations?: RecommendationResult[];
  insights: string[];
}

export async function generatePDFReport(data: ReportData): Promise<boolean> {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        // Header on secondary pages
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(130, 140, 150);
        doc.text("Book Recommendation System • Analysis & Evaluation Report", margin, y);
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, y, { align: "right" });
        y += 8;
        doc.setDrawColor(230, 235, 240);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      }
    };

    // ==========================================
    // 1. COVER / HEADER
    // ==========================================
    // Top banner color block
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, y, contentWidth, 34, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("Book Recommendation System", margin + 6, y + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text("Recommendation & User Preference Analysis Report", margin + 6, y + 20);
    doc.setFontSize(8);
    doc.text(
      `Generated: ${new Date().toLocaleString()}  |  Engine: Item & User Collaborative Filtering`,
      margin + 6,
      y + 27
    );

    y += 42;

    // ==========================================
    // 2. DATASET SUMMARY
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Dataset Summary & Overview", margin, y);
    y += 6;

    // Stat grid
    const statBoxWidth = (contentWidth - 9) / 4;
    const stats = [
      { label: "Total Books", value: data.dataset.totalBooks.toLocaleString() },
      { label: "Total Users", value: data.dataset.totalUsers.toLocaleString() },
      { label: "Total Ratings", value: data.dataset.totalRatings.toLocaleString() },
      { label: "Average Rating", value: `${data.dataset.averageDatasetRating} ★` },
    ];

    stats.forEach((s, idx) => {
      const bx = margin + idx * (statBoxWidth + 3);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(bx, y, statBoxWidth, 18, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(s.label, bx + 3, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(s.value, bx + 3, y + 14);
    });

    y += 24;

    // Secondary row stats
    const subStats = [
      { label: "Avg Ratings / User", value: String(data.dataset.avgRatingsPerUser) },
      { label: "Avg Ratings / Book", value: String(data.dataset.avgRatingsPerBook) },
      { label: "Genre Categories", value: String(data.dataset.genres.length) },
      {
        label: "Most Rated Book",
        value: data.dataset.mostRatedBook ? data.dataset.mostRatedBook.title.slice(0, 18) : "N/A",
      },
    ];

    subStats.forEach((s, idx) => {
      const bx = margin + idx * (statBoxWidth + 3);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(bx, y, statBoxWidth, 18, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(s.label, bx + 3, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(s.value, bx + 3, y + 14);
    });

    y += 26;

    // ==========================================
    // 3. DYNAMIC INSIGHTS
    // ==========================================
    checkPageBreak(35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Dynamic Recommendation Insights", margin, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 38, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    let insightY = y + 6;
    data.insights.slice(0, 5).forEach((ins) => {
      const wrapped = doc.splitTextToSize(`•  ${ins}`, contentWidth - 8);
      doc.text(wrapped, margin + 4, insightY);
      insightY += wrapped.length * 4.2;
    });

    y += 44;

    // ==========================================
    // 4. RECOMMENDATION PERFORMANCE EVALUATION
    // ==========================================
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Offline Evaluation & Performance Comparison", margin, y);
    y += 6;

    if (data.metrics) {
      const m = data.metrics;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Leave-One-Out offline evaluation conducted on ${m.eligibleUsersCount} eligible test users (K = 5, 10, 20):`,
        margin,
        y
      );
      y += 5;

      // Draw Table Header
      const colWidths = [45, 40, 40, 45];
      const headers = ["Metric", "Item-Based CF", "User-Based CF", "Superior Approach"];
      let curX = margin;

      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      headers.forEach((h, i) => {
        doc.text(h, curX + 2, y + 5);
        curX += colWidths[i];
      });
      y += 7;

      const evalRows = [
        ["Precision@5", m.itemBased.precision5.toFixed(3), m.userBased.precision5.toFixed(3)],
        ["Recall@5", m.itemBased.recall5.toFixed(3), m.userBased.recall5.toFixed(3)],
        ["Hit Rate@5", `${m.itemBased.hitRate5}%`, `${m.userBased.hitRate5}%`],
        ["Precision@10", m.itemBased.precision10.toFixed(3), m.userBased.precision10.toFixed(3)],
        ["Recall@10", m.itemBased.recall10.toFixed(3), m.userBased.recall10.toFixed(3)],
        ["Hit Rate@10", `${m.itemBased.hitRate10}%`, `${m.userBased.hitRate10}%`],
        ["Precision@20", m.itemBased.precision20.toFixed(3), m.userBased.precision20.toFixed(3)],
        ["Recall@20", m.itemBased.recall20.toFixed(3), m.userBased.recall20.toFixed(3)],
        ["Hit Rate@20", `${m.itemBased.hitRate20}%`, `${m.userBased.hitRate20}%`],
        ["Catalog Coverage", `${m.itemBased.catalogCoverage}%`, `${m.userBased.catalogCoverage}%`],
      ];

      evalRows.forEach((row, rIdx) => {
        curX = margin;
        if (rIdx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, 5.5, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);

        // Col 0: Metric
        doc.text(row[0], curX + 2, y + 4);
        curX += colWidths[0];

        // Col 1: Item-based
        doc.text(row[1], curX + 2, y + 4);
        curX += colWidths[1];

        // Col 2: User-based
        doc.text(row[2], curX + 2, y + 4);
        curX += colWidths[2];

        // Col 3: Winner
        const v1 = parseFloat(row[1]);
        const v2 = parseFloat(row[2]);
        const winner = v1 >= v2 ? "Item-Based CF" : "User-Based CF";
        doc.setFont("helvetica", "bold");
        doc.setTextColor(v1 >= v2 ? 16 : 79, v1 >= v2 ? 149 : 70, v1 >= v2 ? 106 : 229);
        doc.text(winner, curX + 2, y + 4);

        y += 5.5;
      });

      y += 8;
    }

    // ==========================================
    // 5. RECOMMENDATION RESULTS (IF ACTIVE)
    // ==========================================
    if (data.recommendations && data.recommendations.length > 0) {
      checkPageBreak(50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const userTitle = data.selectedUser ? `User ${data.selectedUser.user_id}` : "Target User";
      doc.text(`4. Personalized Recommendations for ${userTitle}`, margin, y);
      y += 6;

      if (data.selectedUser) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `User History: ${data.selectedUser.rating_count} ratings logged  |  Average: ${data.selectedUser.average_rating}★  |  Primary Affinity: ${data.selectedUser.favorite_genre}`,
          margin,
          y
        );
        y += 6;
      }

      // Top recommendations table
      const recHeaders = ["Rank", "Book Title", "Author", "Genre", "Score", "Reasoning"];
      const recWidths = [12, 50, 35, 28, 16, 33];
      let rx = margin;

      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      recHeaders.forEach((rh, i) => {
        doc.text(rh, rx + 1, y + 4.2);
        rx += recWidths[i];
      });
      y += 6;

      data.recommendations.slice(0, 8).forEach((rec, idx) => {
        checkPageBreak(8);
        rx = margin;
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, 6.5, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);

        // Rank
        doc.text(String(idx + 1), rx + 1, y + 4.5);
        rx += recWidths[0];

        // Title
        doc.setFont("helvetica", "bold");
        doc.text(rec.book.title.slice(0, 28), rx + 1, y + 4.5);
        rx += recWidths[1];

        // Author
        doc.setFont("helvetica", "normal");
        doc.text(rec.book.author.slice(0, 20), rx + 1, y + 4.5);
        rx += recWidths[2];

        // Genre
        doc.text(rec.book.genre.slice(0, 16), rx + 1, y + 4.5);
        rx += recWidths[3];

        // Score
        doc.setFont("helvetica", "bold");
        doc.setTextColor(37, 99, 235);
        doc.text(`${rec.normalizedScore.toFixed(2)}`, rx + 1, y + 4.5);
        doc.setTextColor(51, 65, 85);
        rx += recWidths[4];

        // Reasoning
        doc.setFont("helvetica", "normal");
        const shortReason = rec.supportingBook
          ? `Sim to ${rec.supportingBook.title.slice(0, 12)} (${(rec.supportingBook.similarity * 100).toFixed(0)}%)`
          : rec.isColdStartFallback
          ? "Popularity fallback"
          : "Peer similarity";
        doc.text(shortReason, rx + 1, y + 4.5);

        y += 6.5;
      });

      y += 8;
    }

    // Save and download PDF
    doc.save("book-recommendation-report.pdf");
    return true;
  } catch (err) {
    console.error("PDF generation error:", err);
    return false;
  }
}
