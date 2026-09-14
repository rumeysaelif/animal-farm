package com.elif.hayvanciftligi.domain;

import java.time.Instant;
import java.util.UUID;

/** Koyun türündeki hayvanları temsil eder. */
public final class Sheep extends Animal {

    public Sheep(UUID id, String name, Gender gender, Instant createdAt) {
        super(id, name, gender, createdAt);
    }

    @Override
    public AnimalType getType() {
        return AnimalType.SHEEP;
    }
}
