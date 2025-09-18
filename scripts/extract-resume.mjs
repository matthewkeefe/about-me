import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';

async function main() {
  const docxPath = path.resolve('content', 'Matt_Keefe__Resume__2025.docx');
  const outDir = path.resolve('content', 'generated');
  await fs.mkdir(outDir, { recursive: true });

  try {
    const mdResult = await mammoth.convertToMarkdown({ path: docxPath }, {
      styleMap: [
        'p[style-name="Heading 1"] => h1:fresh',
        'p[style-name="Heading 2"] => h2:fresh',
        'p[style-name="Heading 3"] => h3:fresh',
        'p[style-name="Title"] => h1:fresh',
      ]
    });
    const htmlResult = await mammoth.convertToHtml({ path: docxPath });

    await fs.writeFile(path.join(outDir, 'resume.md'), mdResult.value, 'utf-8');
    await fs.writeFile(path.join(outDir, 'resume.html'), htmlResult.value, 'utf-8');

    console.log('Wrote:', path.join(outDir, 'resume.md'));
    console.log('Wrote:', path.join(outDir, 'resume.html'));
  } catch (err) {
    console.error('Failed to convert DOCX:', err);
    process.exit(1);
  }
}

main();
