[![npm version](https://img.shields.io/npm/v/@itrocks/links?logo=npm)](https://www.npmjs.org/package/@itrocks/links)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/links)](https://www.npmjs.org/package/@itrocks/links)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/links?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/links)
[![issues](https://img.shields.io/github/issues/itrocks-ts/links)](https://github.com/itrocks-ts/links/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# links

Multiple linked objects input and transformers

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/links
```

## Usage

`@itrocks/links` provides a small front‑end helper `links()` that turns a
list of text inputs into a dynamic “multiple links” field. It automatically:

- keeps at least one empty row at the bottom of the list,
- cleans up extra empty rows when the user leaves them blank,
- updates placeholders so that the “add new” row is clearly visible.

You typically use it on a list (`<ul>`) that contains one `<li>` template
with two inputs:

- a hidden input that stores an internal identifier (for example, the
  database ID of the linked object),
- a visible text input where the user types or selects the label of the
  linked object.

The package `@itrocks/autocomplete` is often used together with
`@itrocks/links` to provide autocomplete suggestions for the visible
input, but it is not required.

### Minimal example

```html
<ul class="links">
  <li>
    <input type="hidden" id="contacts.0.id" name="contacts.0.id" value="">
    <input type="text"   name="contacts.0.label" class="empty" placeholder="+">
  </li>
</ul>

<script type="module">
  import { links } from '@itrocks/links'

  const list = document.querySelector('ul.links')!
  const input = list.querySelector('input[type=text]')!

  // Enable dynamic multiple-links behavior on the first visible input
  links(input)
</script>
```

When the user types something in the first row, a new empty row is
automatically cloned and added at the bottom. If the user clears an input
and leaves it empty, that row is removed as soon as the focus leaves the
field (unless it is the currently active one).

### Complete example with autocomplete and form submission

The following example shows how `@itrocks/links` can be combined with an
autocomplete widget to let the user select multiple related objects (for
example: contacts linked to a company).

```html
<form method="post" action="/company/123/links">
  <ul class="links" id="company-contacts">
    <li>
      <input type="hidden" name="contacts.0.id" value="">
      <input type="text"   name="contacts.0.label" class="empty" placeholder="+">
    </li>
  </ul>

  <button type="submit">Save</button>
</form>

<script type="module">
  import { links } from '@itrocks/links'
  import { autocomplete } from '@itrocks/autocomplete'

  const list  = document.getElementById('company-contacts') as HTMLUListElement
  const input = list.querySelector('input[type=text]') as HTMLInputElement

  // Enable dynamic list behavior
  links(input)

  // Attach autocomplete behavior to every visible text input
  function attachAutocompleteToAllInputs() {
    list
      .querySelectorAll<HTMLInputElement>('input:not([type=hidden])')
      .forEach(visibleInput => {
        autocomplete(visibleInput, {
          // ... your autocomplete configuration here ...
        })
      })
  }

  // Run once on initial template
  attachAutocompleteToAllInputs()

  // Observe list changes to attach autocomplete on newly created rows
  const observer = new MutationObserver(() => attachAutocompleteToAllInputs())
  observer.observe(list, { childList: true, subtree: true })
</script>
```

On the server side, you will receive one `contacts.N.id` and one
`contacts.N.label` pair for each populated row, where `N` is an index
starting from 0. Empty rows are removed by the client script before the
form is submitted.

## API

### `function links(input: HTMLInputElement): void`

Enables dynamic multiple‑links behavior on a list of inputs.

The function expects `input` to be a visible text input contained in a
`<ul>` element. All visible inputs in that list are managed together as a
set of linked values:

- when a visible input becomes non‑empty, a new empty row is cloned from
  the last `<li>` and appended to the list,
- the new row’s hidden and visible inputs are reset (no value, no
  `data-last-value`),
- the placeholder `+` is applied to empty inputs so users can quickly
  identify where to add a new entry,
- when an input is empty and not focused, its parent `<li>` is removed
  (except the template row).

#### Parameters

- `input` – the visible `HTMLInputElement` you want to enhance. It must
  be contained inside an `<li>` which itself is inside the `<ul>` that
  represents the multi‑link field. The `<li>` should also contain a
  hidden input that stores the underlying ID of the linked object.

#### Behavior details

- The logic is triggered on both `input` and `change` events.
- Only non‑hidden inputs inside the same `<ul>` are considered part of
  the multi‑link field.
- The last row is used as a template for new rows (including any extra
  markup such as suggestion lists). Elements inside the cloned row with
  class `.suggestions` are removed to avoid reusing outdated suggestions.
- Hidden and visible input names/IDs are trimmed after the last `.`
  (dot). This keeps the server‑side naming predictable (`contacts.0.id`,
  `contacts.1.id`, …) when additional tooling re‑indexes rows.

You usually call `links()` once on the first visible input of the list;
all other inputs in the same container are handled automatically.

## Typical use cases

- Let a user attach multiple related objects (contacts, tags, categories,
  users, etc.) to a main record in a simple HTML form.
- Combine with `@itrocks/autocomplete` to provide type‑ahead search for
  each linked object while `@itrocks/links` manages list creation and
  cleanup.
- Implement “add another link” behavior without writing custom JavaScript
  for each form: reuse the same list structure and call `links()` on its
  first visible input.
- Centralize UX for managing multiple linked items (consistent
  placeholders, automatic empty‑row handling) across several forms in
  your application.
