# CountdownTimer

`<CountdownTimer targetTime="2030-01-01T00:00:00Z" />` renders a live countdown and cleans up its interval on unmount. It shows days when needed, then hours, and always minutes and seconds. Expired or invalid dates render zero.

`targetTime` accepts epoch milliseconds, a `Date`, or an ISO date with an explicit offset. A fixed `now` prop makes previews deterministic. Changing `now` updates the view; omitting it resumes the clock. An hour is an hour across daylight-saving transitions; no app timezone configuration is needed. Parse business wall-clock input with an explicit offset before passing it to the component.

Style through `className` and theme tokens. No business deadlines, page requests, or actions belong here. See `/showcase/components/primitives` in development.
