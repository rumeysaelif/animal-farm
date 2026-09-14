package com.elif.hayvanciftligi.domain;

import java.time.Instant;
import java.util.UUID;

public final class Goat extends Animal {

    public Goat(UUID id, String name, Gender gender, Instant createdAt) {
        super(id, name, gender, createdAt);
    }

    @Override
    public AnimalType getType() {
        return AnimalType.GOAT;
    }
}
