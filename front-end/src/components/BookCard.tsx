import type { CatalogBook } from "@/lib/catalog";
import AddToReadingListButton from "./AddToReadingListButton";

type BookCardProps = {
  book: CatalogBook;
  reason?: string;
};

export default function BookCard({
  book,
  reason,
}: BookCardProps) {
  return (
    <article className="book-card">
      <div className="book-card__tags">
        {book.readingLevel && (
          <span className="book-card__tag">
            Niveau {book.readingLevel}
          </span>
        )}

        {book.materialType && (
          <span className="book-card__tag">
            {book.materialType}
          </span>
        )}
      </div>

      <h2>{book.title}</h2>

      {book.author && (
        <p className="book-card__author">
          Door {book.author}
        </p>
      )}

      <p className="book-card__description">
        {book.description?.trim() ||
          "Geen beschrijving beschikbaar."}
      </p>

      {book.topics?.length > 0 && (
        <p className="book-card__topics">
          <strong>Onderwerpen:</strong>{" "}
          {book.topics.join(", ")}
        </p>
      )}

      {reason && (
        <section className="book-card__reason">
          <h3>Waarom past dit bij jou?</h3>
          <p>{reason}</p>
        </section>
      )}

      <AddToReadingListButton bookId={book.id} />
    </article>
  );
}
