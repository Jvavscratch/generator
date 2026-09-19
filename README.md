# @jvavscratch/generator

Every code generator in jvavscratch, plus the optional optimiser.

Generators are split by what they produce:

| Location | Count | Produces |
| --- | --- | --- |
| `src/generator/*.ts` | 13 | Statement (stack) blocks, one file per Babel statement node. |
| `src/generator/types/*.ts` | 10 | Value (reporter/input) blocks, one file per Babel expression node. |
| `src/generator/CallExpressionSub/*.ts` | 10 | Block libraries callable as `lib.fn(...)`: `motion`, `looks`, `control`, `sensing`, `sound`, `pen`, `list`, `variable`, `broadcast`, `method`. |
| `src/generator/types/CallExpressionSub/*.ts` | 9 | The value-returning form of those libraries. |

Names are the Babel node type, so `IfStatement.ts` handles `if` and
`BinaryExpression.ts` handles `a + b`.

## Importing this package has a side effect

`import '@jvavscratch/generator'` **registers all 42 implementations** into
`@jvavscratch/core`'s dispatch tables.

`core` cannot import this package — the dependency direction runs
`types ← core ← utils ← generator` — so registration is pushed from this side
instead. Nothing else needs to be called; loading the module is the whole
contract.

> Import it from its **main entry**, not a subpath. `@jvavscratch/generator/optimise`
> loads the optimiser without running the registrations, and the build will then
> generate almost nothing.

## Writing a generator

A statement generator is a CommonJS module exporting a function:

```ts
// src/generator/<NodeType>.ts
module.exports = (blockCluster, node, buildData) => {
  // must return keys in execution order
  return { keysGenerated: [...] };
};
```

It returns `{ keysGenerated, terminate?, err?, doNotParent? }`. `parseProgram`
links each returned group to the previous one, so the keys must be in execution
order; `terminate: true` ends the chain, and `err: true` drops the node silently
— prefer raising a `JvavscratchError` so the user sees why.

A value generator returns `{ isStaticValue, blockId, block }`, where
`isStaticValue` means the value was folded into a literal and needs no block
reference.

## The optimiser

`src/optimise` is an opt-in (`jvavscratch build -o`) post-pass over the finished
block dictionary. For each opcode it looks for an override derived by splitting
the opcode on `_` — `looks_sayforsecs` → `blocks/looks/sayforsecs.ts`. A missing
file means "leave it alone". Overrides return `{block}` or `{block, program}`
where `program` replaces the whole dictionary; blocks rewritten to
`jvavscratch_Unknown` are deleted at the end.

**This is an alpha feature and says so when you enable it.**

## Install

This package is not published to npm. Depend on it straight from GitHub:

```json
{ "dependencies": { "@jvavscratch/generator": "github:Jvavscratch/generator" } }
```

If you want to *use* jvavscratch rather than build against its internals, install
the CLI instead:

```bash
npm install -g github:Jvavscratch/cli
```

## Development

`src/index.ts` is **generated**. After adding or removing a generator file, run:

```bash
node scripts/gen-index.js
```

It emits the banner, the doc block and the section headers verbatim, so
re-running it reproduces the committed file.

## Documentation

<https://jvavscratch.github.io/docs/modules/generator>

## License

MPL-2.0
