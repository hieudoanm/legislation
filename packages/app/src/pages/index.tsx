import { COUNTRIES } from '@legislation/data/countries';
import { NextPage } from 'next';
import { useMemo, useState } from 'react';

type Legislation = {
  chamber: string;
  party: string;
  members: number;
  color: string;
};

/* ---------------- Divisors ---------------- */

const getDivisorPairs = (n: number) => {
  const pairs: [number, number][] = [];

  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      pairs.push([i, n / i]);
    }
  }

  return pairs;
};

/* ---------------- Page ---------------- */

const HomePage: NextPage = () => {
  const [country, setCountry] = useState<string>('United States');
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const [parties, setParties] = useState<Legislation[]>([
    {
      chamber: 'House of Representatives',
      party: 'Republicans',
      members: 218,
      color: '#FF0000',
    },
    {
      chamber: 'House of Representatives',
      party: 'Democrats',
      members: 214,
      color: '#0000FF',
    },
    {
      chamber: 'House of Representatives',
      party: 'Vacant',
      members: 3,
      color: '#ffffff',
    },
    { chamber: 'Senate', party: 'Republicans', members: 53, color: '#FF0000' },
    { chamber: 'Senate', party: 'Democrats', members: 47, color: '#0000FF' },
  ]);

  /* ---------------- Derived ---------------- */

  const chambers: Set<string> = useMemo(
    () => new Set(parties.map((p) => p.chamber)),
    [parties],
  );

  const membersByChambers = useMemo(
    () =>
      Array.from(chambers).map((chamber) => {
        const partiesByChamber: Legislation[] = parties.filter(
          (p) => p.chamber === chamber,
        );

        const totalMembers = partiesByChamber.reduce(
          (sum, p) => sum + p.members,
          0,
        );

        const majorityThreshold = Math.floor(totalMembers / 2);

        return {
          chamber,
          parties: partiesByChamber,
          totalMembers,
          majorityThreshold,
        };
      }),
    [parties, chambers],
  );

  /* ---------------- UI ---------------- */

  return (
    <main className="relative flex h-screen w-screen overflow-hidden">
      {/* ---------------- Modal Toggle ---------------- */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-4">
        <button type="button" className="btn" onClick={() => setIsOpen(true)}>
          Edit Data
        </button>
        <button type="button" className="btn" onClick={() => {}}>
          Capture
        </button>
      </div>

      {/* ---------------- Modal ---------------- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-base-100 max-h-[90vh] w-full max-w-[50vw] overflow-y-auto rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Legislation Editor</h2>
              <button className="btn btn-sm" onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>

            {/* Country */}
            <select
              className="select select-bordered mb-6 w-full"
              value={country}
              onChange={(e) => setCountry(e.target.value)}>
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            {/* Parties */}
            <div className="flex flex-col gap-4">
              {parties.map(({ chamber, party, members, color }, index) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <input
                    className="input input-bordered w-[20%]"
                    placeholder="Chamber"
                    value={chamber}
                    onChange={(e) => {
                      setParties((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, chamber: e.target.value } : p,
                        ),
                      );
                    }}
                  />

                  <input
                    className="input input-bordered w-[20%]"
                    placeholder="Party"
                    value={party}
                    onChange={(e) => {
                      setParties((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, party: e.target.value } : p,
                        ),
                      );
                    }}
                  />

                  <input
                    type="number"
                    className="input input-bordered w-[20%]"
                    placeholder="Members"
                    value={members}
                    onChange={(e) => {
                      setParties((prev) =>
                        prev.map((p, i) =>
                          i === index
                            ? { ...p, members: Number(e.target.value) }
                            : p,
                        ),
                      );
                    }}
                  />

                  <input
                    type="color"
                    className="input input-bordered w-[20%] p-1"
                    value={color}
                    onChange={(e) => {
                      setParties((prev) =>
                        prev.map((p, i) =>
                          i === index ? { ...p, color: e.target.value } : p,
                        ),
                      );
                    }}
                  />

                  <button
                    className="btn btn-error btn-outline w-[15%]"
                    onClick={() => {
                      setParties((prev) => prev.filter((_, i) => i !== index));
                    }}>
                    Remove
                  </button>
                </div>
              ))}

              <button
                className="btn btn-outline mt-2"
                onClick={() => {
                  setParties((prev) => [
                    ...prev,
                    { chamber: '', party: '', members: 0, color: '#ffffff' },
                  ]);
                }}>
                Add Party
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Visualization ---------------- */}
      <section className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col gap-8">
          <div className="text-center text-2xl font-bold">{country}</div>

          {membersByChambers.map(
            ({ chamber, parties, totalMembers, majorityThreshold }) => {
              const pairs = getDivisorPairs(totalMembers);
              const lastPair = pairs.at(-1) ?? [];
              const rows = lastPair?.[0] ?? 1;

              let runningIndex = 0;

              return (
                <div key={chamber} className="flex flex-col gap-4">
                  <div className="text-center text-lg font-bold">
                    {chamber} ({totalMembers})
                  </div>

                  <div
                    className="grid grid-flow-col gap-1"
                    style={{
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                    }}>
                    {parties.map(({ party, color, members }) => (
                      <div key={party} className="contents">
                        {Array.from({ length: members }).map((_, i) => {
                          const index = runningIndex++;

                          return (
                            <div
                              key={`${party}-${i}`}
                              className="relative mx-auto h-3 w-3 rounded-full"
                              style={{ backgroundColor: color }}>
                              {index === majorityThreshold && (
                                <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-50" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
