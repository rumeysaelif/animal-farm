package com.elif.hayvanciftligi.exception;

import java.util.UUID;

public class AnimalNotFoundException extends RuntimeException {

    public AnimalNotFoundException(UUID id) {
        super("Hayvan bulunamadı: " + id);
    }
}
