interface ProblemCardProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export function ProblemCard({
  title,
  description,
  imageSrc,
  imageAlt,
}: ProblemCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="h-44 w-full object-cover object-center"
      />

      <div className="p-6 sm:p-7">
        <h3 className="text-lg font-semibold leading-7 text-neutral-900 dark:text-neutral-50">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p>
      </div>
    </article>
  );
}
