package com.elif.hayvanciftligi.domain;

import java.util.Locale;

/** Desteklenen sabit hayvan türlerini ve kapasitelerini tutar. */
public enum AnimalType {
    GOAT("Keçi", 6),
    SHEEP("Koyun", 6),
    CHICKEN("Tavuk", 8);

    private final String displayName;
    private final int maxCapacity;

    AnimalType(String displayName, int maxCapacity) {
        this.displayName = displayName;
        this.maxCapacity = maxCapacity;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public static AnimalType from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Hayvan türü boş bırakılamaz.");
        }

        return switch (value.trim().toUpperCase(Locale.ROOT)) {
            case "GOAT", "KECI", "KEÇI", "KEÇİ" -> GOAT;
            case "SHEEP", "KOYUN" -> SHEEP;
            case "CHICKEN", "TAVUK" -> CHICKEN;
            default -> throw new IllegalArgumentException(
                    "Geçersiz hayvan türü: " + value + ". İzin verilen değerler: GOAT, SHEEP, CHICKEN.");
        };
    }
}
