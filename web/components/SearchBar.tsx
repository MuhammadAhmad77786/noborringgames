/** Plain GET form so search works without JavaScript. */
export function SearchBar({
  defaultValue,
  placeholder = "Search crafts — try 'pumpkin', 'coloring', 'snowman'…",
  id = "hero-q",
}: {
  defaultValue?: string;
  placeholder?: string;
  id?: string;
}) {
  return (
    <form action="/search" method="get" role="search" className="searchbar">
      <label htmlFor={id} className="visually-hidden-x">
        Search crafts
      </label>
      <input id={id} name="q" type="search" defaultValue={defaultValue} placeholder={placeholder} />
      <button type="submit">Search</button>
    </form>
  );
}
