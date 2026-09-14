package com.elif.hayvanciftligi.dto;

import com.elif.hayvanciftligi.domain.AnimalType;

/** Bir hayvan türünü, kapasitesini ve mevcut sayısını özetler. */
public record AnimalTypeSummaryResponse(
        AnimalType type,
        String displayName,
        long count,
        int maxCapacity) {
}
