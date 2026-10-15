# SegmentedTabs

A controlled switch with 2 to 5 unique options. The default `segmented` variant keeps equal-width options and a shared indicator:

```tsx
<SegmentedTabs options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
    value={value} onChange={setValue} ariaLabel="Preview" />
```

Options may be disabled. Clicks, Left/Right arrows, Home and End emit the next enabled value; the parent decides when to update `value`. Keyboard focus skips disabled options. An unknown value selects nothing and hides the indicator; the first enabled option remains keyboard reachable. Duplicate values and unsupported option counts throw a clear configuration error.

The component does not filter data, fetch lists, paginate, or navigate. Colors use `--app-segmented-tabs-*` tokens and geometry uses modifier classes, with no inline styles. Demo: `/showcase/components/primitives`.

Use `variant="pills"` for separate pill buttons. Labels keep their full width without wrapping or truncation, and long translations overflow into a native horizontal scroller with a hidden scrollbar. Active pills reuse `button-skin()`; inactive pills use the existing card and content-text tokens. There is no surrounding segmented background or indicator.

```tsx
<SegmentedTabs
    variant="pills"
    options={statuses.map((status) => ({
        value: status.value,
        label: t(status.label),
        id: `reservation-tab-${status.value}`,
        panelId: 'reservation-panel',
    }))}
    value={status}
    onChange={setStatus}
    ariaLabel={t('预约状态')}
/>
<section
    id="reservation-panel"
    role="tabpanel"
    aria-labelledby={`reservation-tab-${status}`}
>
    {content}
</section>
```

`id` and `panelId` are optional option fields, forwarded to the button's `id` and `aria-controls`. The page owns the corresponding panel. Pills scroll only horizontally when the selected value or options change, including translated labels. Keyboard navigation uses focus with scrolling prevented and then reveals the focused pill horizontally; it does not scroll the page vertically. The default variant does not run this scrolling behavior.
