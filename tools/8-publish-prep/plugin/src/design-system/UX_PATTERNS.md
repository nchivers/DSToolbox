# UX Patterns

Rules for how components should be composed and how interactions should behave. These patterns override default assumptions about UI behavior. Follow them in every plugin built with this design system.

---

## Forms: No disabled buttons

**Never disable a submit/action button because a form is incomplete.** Instead, keep the button enabled and show descriptive error messages on the invalid inputs when the user attempts to submit.

### Why

- Disabled buttons provide no explanation of what's wrong.
- Users cannot click a disabled button to discover what they need to fix.
- Inline error messages guide the user to the exact field that needs attention.

### Pattern

```tsx
const handleSubmit = () => {
  let hasError = false;

  if (!name.trim()) {
    setNameError('Name is required');
    hasError = true;
  }

  if (!email.trim()) {
    setEmailError('Email is required');
    hasError = true;
  }

  if (hasError) return;

  // Only send the message when all fields are valid
  parent.postMessage({ pluginMessage: { type: 'submit', data: { name, email } } }, '*');
};
```

```tsx
<InputText
  label="Name"
  value={name}
  error={!!nameError}
  errorMessage={nameError}
  onChange={(e) => { setName(e.target.value); setNameError(''); }}
/>

<InputText
  label="Email"
  value={email}
  error={!!emailError}
  errorMessage={emailError}
  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
/>

<Button label="Submit" onClick={handleSubmit} />
```

### Do / Don't

| Do | Don't |
|----|-------|
| Keep the button enabled at all times. | Don't set `disabled` based on form completeness. |
| Validate on submit and show `error` + `errorMessage` on each invalid field. | Don't show all errors immediately on mount — validate when the user acts. |
| Clear a field's error when the user starts typing in it. | Don't leave stale errors visible after the user corrects the input. |
| Use `errorMessage` to explain what's needed ("Enter a valid email"). | Don't use vague messages ("Invalid input"). |
| Handle errors entirely in the UI — only send messages to the sandbox when validation passes. | Don't send messages to the sandbox to report validation errors — errors are a UI-only concern. |
