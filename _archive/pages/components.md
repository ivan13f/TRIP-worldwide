---
title: Components
---

```js
import { normalizeTripRows, globalAverageByYear } from "./lib/data.js";
import { lineGlobal } from "./lib/charts/lineGlobal.js";
```
```js
const raw = await FileAttachment("./data/trans_rights_worldwide.csv").csv({ typed: true });
const data = normalizeTripRows(raw);

({
  rows: data.length,
  sample: data[0],
  years: Array.from(new Set(data.map(d => d.year))).slice(0, 10)
})
```
```js
lineGlobal({ series: globalAverageByYear(data), width: 900, height: 260 })
```
