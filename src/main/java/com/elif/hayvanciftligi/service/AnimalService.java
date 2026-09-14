package com.elif.hayvanciftligi.service;

import com.elif.hayvanciftligi.domain.Animal;
import com.elif.hayvanciftligi.domain.AnimalFactory;
import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.dto.AnimalResponse;
import com.elif.hayvanciftligi.dto.AnimalTypeSummaryResponse;
import com.elif.hayvanciftligi.dto.CreateAnimalRequest;
import com.elif.hayvanciftligi.dto.UpdateAnimalRequest;
import com.elif.hayvanciftligi.exception.AnimalNotFoundException;
import com.elif.hayvanciftligi.exception.CapacityExceededException;
import com.elif.hayvanciftligi.repository.AnimalRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class AnimalService {

    private final AnimalRepository animalRepository;

    public AnimalService(AnimalRepository animalRepository) {
        this.animalRepository = animalRepository;
    }

    public List<AnimalResponse> findAll() {
        return animalRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AnimalResponse findById(UUID id) {
        return toResponse(findAnimal(id));
    }

    public List<AnimalResponse> findAllByType(AnimalType type) {
        return animalRepository.findAllByType(type).stream().map(this::toResponse).toList();
    }

    public List<AnimalTypeSummaryResponse> getTypeSummaries() {
        return Arrays.stream(AnimalType.values())
                .map(type -> new AnimalTypeSummaryResponse(
                        type,
                        type.getDisplayName(),
                        animalRepository.findAllByType(type).size(),
                        type.getMaxCapacity()))
                .toList();
    }

    public synchronized AnimalResponse create(CreateAnimalRequest request) {
        if (animalRepository.findAllByType(request.type()).size() >= request.type().getMaxCapacity()) {
            throw new CapacityExceededException(request.type());
        }

        Animal animal = AnimalFactory.create(
                request.type(),
                UUID.randomUUID(),
                request.name().trim(),
                request.gender(),
                Instant.now());
        return toResponse(animalRepository.save(animal));
    }

    public AnimalResponse update(UUID id, UpdateAnimalRequest request) {
        Animal existing = findAnimal(id);
        Animal updated = AnimalFactory.create(
                existing.getType(),
                existing.getId(),
                request.name().trim(),
                request.gender(),
                existing.getCreatedAt());
        return toResponse(animalRepository.save(updated));
    }

    public void delete(UUID id) {
        findAnimal(id);
        animalRepository.deleteById(id);
    }

    private Animal findAnimal(UUID id) {
        return animalRepository.findById(id)
                .orElseThrow(() -> new AnimalNotFoundException(id));
    }

    private AnimalResponse toResponse(Animal animal) {
        return new AnimalResponse(
                animal.getId(),
                animal.getType(),
                animal.getType().getDisplayName(),
                animal.getName(),
                animal.getGender(),
                animal.getCreatedAt());
    }
}
