package com.elif.hayvanciftligi.exception;

import java.time.Instant;
import java.util.List;

/** API hata cevaplarının ortak yapısını tanımlar. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldValidationError> fieldErrors) {
}
