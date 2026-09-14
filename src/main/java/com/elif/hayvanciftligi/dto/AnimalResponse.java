package com.elif.hayvanciftligi.dto;

import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.domain.Gender;

import java.time.Instant;
import java.util.UUID;

public record AnimalResponse(
        UUID id,
        AnimalType type,
        String typeDisplayName,
        String name,
        Gender gender,
        Instant createdAt) {
}
