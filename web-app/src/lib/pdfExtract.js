import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractTextFromPDF(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);
  const pageTexts = await Promise.all(
    pageNums.map(async (i) => {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      return content.items.map(item => item.str).join(' ');
    })
  );
  if (onProgress) onProgress(100);
  return pageTexts.join('\n\n').trim();
}

