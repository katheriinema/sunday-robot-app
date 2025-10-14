// Utility to fetch more content from Project Gutenberg
// This is a basic implementation - you can expand this to fetch full books

export async function fetchGutenbergBook(gutenbergId: string) {
  try {
    // Project Gutenberg text files are available at:
    // https://www.gutenberg.org/files/{id}/{id}-0.txt
    const response = await fetch(`https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }
    
    const text = await response.text();
    
    // Clean up the text (remove Gutenberg headers/footers)
    const lines = text.split('\n');
    const startIndex = lines.findIndex(line => 
      line.includes('*** START OF THE PROJECT GUTENBERG EBOOK') ||
      line.includes('*** START OF THIS PROJECT GUTENBERG EBOOK')
    );
    const endIndex = lines.findIndex(line => 
      line.includes('*** END OF THE PROJECT GUTENBERG EBOOK') ||
      line.includes('*** END OF THIS PROJECT GUTENBERG EBOOK')
    );
    
    const content = lines.slice(startIndex + 1, endIndex).join('\n');
    
    // Split into pages (roughly 200 words per page)
    const words = content.split(/\s+/);
    const pages = [];
    const wordsPerPage = 200;
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageWords = words.slice(i, i + wordsPerPage);
      pages.push({
        id: Math.floor(i / wordsPerPage) + 1,
        text: pageWords.join(' ')
      });
    }
    
    return pages;
  } catch (error) {
    console.error('Error fetching Gutenberg book:', error);
    return null;
  }
}

// Alternative: Use Internet Archive API for some books
export async function fetchInternetArchiveBook(identifier: string) {
  try {
    const response = await fetch(`https://archive.org/metadata/${identifier}`);
    const data = await response.json();
    
    // This is more complex and would need specific implementation
    // based on the book's structure in Internet Archive
    return data;
  } catch (error) {
    console.error('Error fetching Internet Archive book:', error);
    return null;
  }
}
