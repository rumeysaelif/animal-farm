package com.elif.hayvanciftligi.controller;

import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.dto.AnimalResponse;
import com.elif.hayvanciftligi.dto.AnimalTypeSummaryResponse;
import com.elif.hayvanciftligi.dto.CreateAnimalRequest;
import com.elif.hayvanciftligi.dto.UpdateAnimalRequest;
import com.elif.hayvanciftligi.service.AnimalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/** Hayvan yönetim işlemlerini REST API olarak dışarı açar. */
@RestController
@RequestMapping("/api")
@Tag(name = "Hayvanlar", description = "Çiftlikteki hayvanları yönetmek için uç noktalar")
public class AnimalController {

    private final AnimalService animalService;

    public AnimalController(AnimalService animalService) {
        this.animalService = animalService;
    }

    @GetMapping("/animal-types")
    @Operation(summary = "Hayvan türlerini ve tür başına hayvan sayılarını listeler")
    public List<AnimalTypeSummaryResponse> getAnimalTypeSummaries() {
        return animalService.getTypeSummaries();
    }

    @GetMapping("/animal-types/{type}/animals")
    @Operation(summary = "Seçilen türe ait hayvanların detaylarını listeler")
    public List<AnimalResponse> getAnimalsByType(@PathVariable String type) {
        return animalService.findAllByType(AnimalType.from(type));
    }

    @GetMapping("/animals")
    @Operation(summary = "Bütün hayvanları listeler")
    public List<AnimalResponse> getAllAnimals() {
        return animalService.findAll();
    }

    @GetMapping("/animals/{id}")
    @Operation(summary = "Kimliği verilen hayvanın detayını getirir")
    public AnimalResponse getAnimal(@PathVariable UUID id) {
        return animalService.findById(id);
    }

    @PostMapping("/animals")
    @Operation(summary = "Çiftliğe yeni hayvan ekler")
    public ResponseEntity<AnimalResponse> createAnimal(@Valid @RequestBody CreateAnimalRequest request) {
        AnimalResponse created = animalService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/animals/{id}")
    @Operation(summary = "Kimliği verilen hayvanın bilgilerini günceller")
    public AnimalResponse updateAnimal(@PathVariable UUID id,
                                       @Valid @RequestBody UpdateAnimalRequest request) {
        return animalService.update(id, request);
    }

    @DeleteMapping("/animals/{id}")
    @Operation(summary = "Kimliği verilen hayvanı siler")
    public ResponseEntity<Void> deleteAnimal(@PathVariable UUID id) {
        animalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
