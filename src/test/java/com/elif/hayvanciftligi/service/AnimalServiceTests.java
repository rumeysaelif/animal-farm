package com.elif.hayvanciftligi.service;

import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.domain.Gender;
import com.elif.hayvanciftligi.dto.AnimalResponse;
import com.elif.hayvanciftligi.dto.CreateAnimalRequest;
import com.elif.hayvanciftligi.dto.UpdateAnimalRequest;
import com.elif.hayvanciftligi.exception.AnimalNotFoundException;
import com.elif.hayvanciftligi.exception.CapacityExceededException;
import com.elif.hayvanciftligi.repository.InMemoryAnimalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AnimalServiceTests {

    private AnimalService animalService;

    @BeforeEach
    void setUp() {
        animalService = new AnimalService(new InMemoryAnimalRepository());
    }

    @Test
    void createsAndListsAnimalByType() {
        AnimalResponse created = animalService.create(new CreateAnimalRequest(
                AnimalType.GOAT, "Boncuk", Gender.FEMALE));

        assertEquals(AnimalType.GOAT, created.type());
        assertEquals("Boncuk", created.name());
        assertEquals(1, animalService.findAllByType(AnimalType.GOAT).size());
        assertEquals(0, animalService.findAllByType(AnimalType.SHEEP).size());
    }

    @Test
    void updatesAnimalWithoutChangingItsType() {
        AnimalResponse created = animalService.create(new CreateAnimalRequest(
                AnimalType.CHICKEN, "Pamuk", Gender.FEMALE));

        AnimalResponse updated = animalService.update(created.id(), new UpdateAnimalRequest(
                "Pamuk II", Gender.MALE));

        assertEquals(AnimalType.CHICKEN, updated.type());
        assertEquals("Pamuk II", updated.name());
        assertEquals(Gender.MALE, updated.gender());
    }

    @Test
    void throwsNotFoundForUnknownAnimal() {
        assertThrows(AnimalNotFoundException.class,
                () -> animalService.findById(UUID.randomUUID()));
    }

    @Test
    void rejectsAnimalWhenItsHabitatIsFull() {
        for (int index = 0; index < AnimalType.GOAT.getMaxCapacity(); index++) {
            animalService.create(new CreateAnimalRequest(
                    AnimalType.GOAT, "Keçi " + index, Gender.FEMALE));
        }

        assertThrows(CapacityExceededException.class, () -> animalService.create(
                new CreateAnimalRequest(
                        AnimalType.GOAT, "Fazla Keçi", Gender.FEMALE)));
    }
}
