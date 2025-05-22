# Playwright Testimise Juhend

Sellest dokumendist leiad infot, kuidas kasutada Playwright teste FluxFinance projektis.

## Testide Käivitamine

Kõikide testide käivitamiseks kasuta järgmist käsku:

```bash
npm test
```

Või otse Playwright CLI kaudu:

```bash
npx playwright test
```

## Testiraportite Vaatamine

Pärast testide käivitamist saad vaadata HTML-formaadis testiraportit:

```bash
npx playwright show-report
```

## Testide Kirjutamine

Kõik testifailid asuvad `tests` kaustas ja järgivad `.spec.ts` failinime formaati.

### TDD Metoodika

Projekt kasutab Test-Driven Development (TDD) metoodikat, mis tähendab:

1. Esmalt kirjuta testid
2. Käivita testid (need ebaõnnestuvad, kuna funktsionaalsus pole veel implementeeritud)
3. Implementeeri vajalik funktsionaalsus
4. Käivita testid uuesti (nüüd peaksid need õnnestuma)
5. Refaktoori koodi vastavalt vajadusele


## Peamised Testklassid

Projekt sisaldab järgmiseid peamisi testklasse:

1. `purchase-invoice.spec.ts` - Ostuarvete funktsionaalsuse testimiseks
2. `signin.spec.ts` - Autoriseerimise funktsionaalsuse testimiseks

## Näidistest

```typescript
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  // Navigeeri lehele
  await page.goto('http://localhost:3000/');
  
  // Kontrolli, kas element on olemas
  await expect(page.locator('.main-menu')).toBeVisible();
  
  // Klõpsa elemendil
  await page.click('#some-button');
  
  // Kontrolli, kas lehekülg vastab ootustele
  await expect(page).toHaveURL('/expected-path');
});
```
