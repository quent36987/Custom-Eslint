# Eslint custom rules
It s just for try some custom rule and learn things :)

## Installation

```bash
npm i
npm run lint
```

## Rules

### Rule :

-   attribute-order-template : https://eslint.vuejs.org/rules/attributes-order.html
    with modification

```vue
<v-my-component
    v-if="..."
    :is="..."
    v-for="..."
    :key="..."
    v-directive="..."
    :any-bound-prop="..."
    any-unbound-prop="..."
    any-boolean-prop
    @event="..."
/>
```

-   backspace-template : 1 line between the blocks in the template

-   css-order : order in css style like this :

```css
.my-class {
    --my-variable-1: #030303;
    --response-of-life: 42;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    position: relative;
    top: 1em;
    right: 2em;
    z-index: 10;

    height: 100%;
    min-width: 50%;

    border: 2px solid var(my-variable-1);
    border-radius: 1em;

    flex: 1;
    justify-self: flex-end;
}
```

-   export-order : sort exports by alphabetical name
-   export-unique : make sure each file has only one export at the end

```ts
    // Bad
    export function foo(): void {...}

    // Good
    function foo(): void {...}

    export { foo };

```

-   multi-line-template : attributes in templates should not be longer than one line

```vue
<!-- Bad -->
<button
    @click="
        index += 1;
        $emit('foo');
    "
/>

<!-- Good -->
<button @click="onClick" />
```
