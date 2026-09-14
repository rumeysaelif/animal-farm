package com.elif.hayvanciftligi.dto;

import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.domain.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Yeni hayvan ekleme isteğinde alınan alanları taşır. */
public record CreateAnimalRequest(
        @NotNull(message = "Hayvan türü zorunludur.") AnimalType type,
        @NotBlank(message = "Hayvan adı boş bırakılamaz.")
        @Size(max = 60, message = "Hayvan adı en fazla 60 karakter olabilir.") String name,
        @NotNull(message = "Cinsiyet zorunludur.") Gender gender) {
}
