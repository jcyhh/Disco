# Time helpers

`calculateCountdownParts({ targetTime, now })` returns nonnegative, padded day/hour/minute/second strings. Dates are converted to timestamps, then subtracted; no timezone wall-clock reconstruction occurs. Numeric values are epoch milliseconds. Invalid or expired input returns all zeroes. Supply ISO timestamps with explicit offsets when input must be independent of the user's browser timezone.
