package com.elif.hayvanciftligi.config;

import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.domain.Gender;
import com.elif.hayvanciftligi.dto.CreateAnimalRequest;
import com.elif.hayvanciftligi.service.AnimalService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/** Uygulama açılırken örnek hayvan verilerini belleğe ekler. */
@Component
public class FarmDataInitializer implements CommandLineRunner {

    private final AnimalService animalService;

    public FarmDataInitializer(AnimalService animalService) {
        this.animalService = animalService;
    }

    @Override
    public void run(String... args) {
        add(AnimalType.GOAT, "Boncuk", Gender.FEMALE);
        add(AnimalType.GOAT, "Tarçın", Gender.MALE);
        add(AnimalType.SHEEP, "Bulut", Gender.FEMALE);
        add(AnimalType.SHEEP, "Pamuk", Gender.MALE);
        add(AnimalType.CHICKEN, "Fındık", Gender.FEMALE);
        add(AnimalType.CHICKEN, "Zıpır", Gender.MALE);
    }

    private void add(AnimalType type, String name, Gender gender) {
        animalService.create(new CreateAnimalRequest(type, name, gender));
    }
}
