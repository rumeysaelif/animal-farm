package com.elif.hayvanciftligi.dto;

import com.elif.hayvanciftligi.domain.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateAnimalRequest(
        @NotBlank(message = "Hayvan adı boş bırakılamaz.")
        @Size(max = 60, message = "Hayvan adı en fazla 60 karakter olabilir.") String name,
        @NotNull(message = "Cinsiyet zorunludur.") Gender gender) {
}
