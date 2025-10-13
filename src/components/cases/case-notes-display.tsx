'use client';

interface CaseNotesDisplayProps {
  notes: string;
}

export function CaseNotesDisplay({ notes }: CaseNotesDisplayProps) {
  // Simple markdown parser for **bold** text
  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      // Check if this part is wrapped in **
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold text-foreground">
            {boldText}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Split by lines and render each line
  const lines = notes.split('\n');

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }
        return (
          <p key={index} className="leading-relaxed text-muted-foreground">
            {renderMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}
