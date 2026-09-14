package com.elif.hayvanciftligi.repository;

import com.elif.hayvanciftligi.domain.Animal;
import com.elif.hayvanciftligi.domain.AnimalType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnimalRepository {

    Animal save(Animal animal);

    Optional<Animal> findById(UUID id);

    List<Animal> findAll();

    List<Animal> findAllByType(AnimalType type);

    void deleteById(UUID id);

    void deleteAll();
}
