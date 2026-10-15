# ConfirmPopup

A controlled confirmation dialog built on `Popup`. Pass `show`, `message`, `onClose`, and `onConfirm`. Optional `title` and `confirmText` override the translated common defaults. `submitting` disables the confirm button and close control; the parent owns async actions and their result. The overlay does not dismiss the dialog.

`contentTheme` defaults to `default`; use `gradient-card` only when the project theme calls for it. The component has no wallet, API, navigation, or business terms. See `/showcase/components/primitives`.
