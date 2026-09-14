package com.elif.hayvanciftligi.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Tüm hayvan türlerinin ortak özelliklerini tanımlar. */
public abstract class Animal {

    private final UUID id;
    private final String name;
    private final Gender gender;
    private final Instant createdAt;

    protected Animal(UUID id, String name, Gender gender, Instant createdAt) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.gender = Objects.requireNonNull(gender);
        this.createdAt = Objects.requireNonNull(createdAt);
    }

    public abstract AnimalType getType();

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Gender getGender() {
        return gender;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
