package com.elif.hayvanciftligi.dto;

import com.elif.hayvanciftligi.domain.AnimalType;

public record AnimalTypeSummaryResponse(
        AnimalType type,
        String displayName,
        long count,
        int maxCapacity) {
}
