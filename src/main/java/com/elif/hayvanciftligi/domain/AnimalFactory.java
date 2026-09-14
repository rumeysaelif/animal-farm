package com.elif.hayvanciftligi.domain;

import java.time.Instant;
import java.util.UUID;

public final class AnimalFactory {

    private AnimalFactory() {
    }

    public static Animal create(AnimalType type, UUID id, String name, Gender gender, Instant createdAt) {
        return switch (type) {
            case GOAT -> new Goat(id, name, gender, createdAt);
            case SHEEP -> new Sheep(id, name, gender, createdAt);
            case CHICKEN -> new Chicken(id, name, gender, createdAt);
        };
    }
}
