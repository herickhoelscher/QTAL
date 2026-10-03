import { describe, expect, it } from "vitest";
import { dequeue, enqueue, move, rankChanges } from "../featured";

describe("enqueue", () => {
  it("entra no fim", () => {
    expect(enqueue(["a", "b"], "c", 6)).toEqual({ ok: true, queue: ["a", "b", "c"] });
  });

  it("quem ja esta na fila nao muda de lugar", () => {
    expect(enqueue(["a", "b"], "a", 6)).toEqual({ ok: true, queue: ["a", "b"] });
  });

  it("recusa quando a fila esta cheia", () => {
    expect(enqueue(["a", "b", "c", "d", "e", "f"], "g", 6)).toEqual({ ok: false, reason: "full" });
  });
});

describe("dequeue e move", () => {
  it("sair faz os de tras subirem", () => {
    expect(dequeue(["a", "b", "c"], "a")).toEqual(["b", "c"]);
  });

  it("sobe e desce trocando com o vizinho", () => {
    expect(move(["a", "b", "c"], "c", -1)).toEqual(["a", "c", "b"]);
    expect(move(["a", "b", "c"], "a", 1)).toEqual(["b", "a", "c"]);
  });

  it("nas pontas nada muda", () => {
    expect(move(["a", "b"], "a", -1)).toEqual(["a", "b"]);
    expect(move(["a", "b"], "b", 1)).toEqual(["a", "b"]);
    expect(move(["a", "b"], "x", 1)).toEqual(["a", "b"]);
  });
});

describe("rankChanges", () => {
  const before = [
    { id: "a", rank: 1 },
    { id: "b", rank: 2 },
    { id: "c", rank: 3 },
  ];

  it("grava so o que mudou", () => {
    expect(rankChanges(before, ["a", "c", "b"])).toEqual([
      { id: "c", rank: 2 },
      { id: "b", rank: 3 },
    ]);
  });

  it("quem saiu volta a null e os de tras sobem", () => {
    expect(rankChanges(before, ["b", "c"])).toEqual([
      { id: "b", rank: 1 },
      { id: "c", rank: 2 },
      { id: "a", rank: null },
    ]);
  });

  it("quem entrou ganha a posicao do fim", () => {
    expect(rankChanges(before, ["a", "b", "c", "d"])).toEqual([{ id: "d", rank: 4 }]);
  });
});
