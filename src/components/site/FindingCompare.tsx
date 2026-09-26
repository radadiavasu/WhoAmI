import type { FindingCompare } from "@/content/findings";

type Props = {
  compare: FindingCompare;
};

export function FindingCompare({ compare }: Props) {
  return (
    <section className="finding-compare" aria-labelledby="finding-compare-title">
      <h2 id="finding-compare-title">
        {compare.usualLabel} vs {compare.theirsLabel}
      </h2>
      {compare.lead ? <p>{compare.lead}</p> : null}
      <div className="finding-compare-scroll">
        <table>
          <caption className="sr-only">
            {compare.usualLabel} compared with {compare.theirsLabel}
          </caption>
          <thead>
            <tr>
              <th scope="col">Question</th>
              <th scope="col">{compare.usualLabel}</th>
              <th scope="col">{compare.theirsLabel}</th>
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.topic}>
                <th scope="row">{row.topic}</th>
                <td>{row.usual}</td>
                <td>{row.theirs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
