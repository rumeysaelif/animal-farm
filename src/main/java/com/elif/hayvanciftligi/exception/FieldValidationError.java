package com.elif.hayvanciftligi.exception;

/** Geçersiz bir istek alanını ve hata mesajını taşır. */
public record FieldValidationError(String field, String message) {
}
