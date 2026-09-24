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
      <p>
        Same kind of big model. Different place the unused pieces live. Their
        numbers are from the project, not from my machine.
      </p>
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
