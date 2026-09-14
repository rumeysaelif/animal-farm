package com.elif.hayvanciftligi.repository;

import com.elif.hayvanciftligi.domain.Animal;
import com.elif.hayvanciftligi.domain.AnimalType;
import org.springframework.stereotype.Repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryAnimalRepository implements AnimalRepository {

    private final Map<UUID, Animal> animals = new ConcurrentHashMap<>();

    @Override
    public Animal save(Animal animal) {
        animals.put(animal.getId(), animal);
        return animal;
    }

    @Override
    public Optional<Animal> findById(UUID id) {
        return Optional.ofNullable(animals.get(id));
    }

    @Override
    public List<Animal> findAll() {
        return animals.values().stream()
                .sorted(Comparator.comparing(Animal::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Override
    public List<Animal> findAllByType(AnimalType type) {
        return animals.values().stream()
                .filter(animal -> animal.getType() == type)
                .sorted(Comparator.comparing(Animal::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        animals.remove(id);
    }

    @Override
    public void deleteAll() {
        animals.clear();
    }
}
