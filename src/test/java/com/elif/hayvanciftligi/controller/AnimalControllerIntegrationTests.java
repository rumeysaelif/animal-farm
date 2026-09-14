package com.elif.hayvanciftligi.controller;

import com.elif.hayvanciftligi.domain.AnimalType;
import com.elif.hayvanciftligi.domain.Gender;
import com.elif.hayvanciftligi.dto.AnimalResponse;
import com.elif.hayvanciftligi.dto.CreateAnimalRequest;
import com.elif.hayvanciftligi.repository.AnimalRepository;
import com.elif.hayvanciftligi.service.AnimalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AnimalControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AnimalRepository animalRepository;

    @Autowired
    private AnimalService animalService;

    @BeforeEach
    void clearRepository() {
        animalRepository.deleteAll();
    }

    @Test
    void createsAnimalAndIncludesItInTypeCount() throws Exception {
        mockMvc.perform(post("/api/animals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "GOAT",
                                  "name": "Boncuk",
                                  "gender": "FEMALE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("GOAT"))
                .andExpect(jsonPath("$.name").value("Boncuk"));

        mockMvc.perform(get("/api/animal-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("GOAT"))
                .andExpect(jsonPath("$[0].count").value(1));
    }

    @Test
    void rejectsInvalidAnimal() throws Exception {
        mockMvc.perform(post("/api/animals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "SHEEP",
                                  "name": "",
                                  "gender": "MALE"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Gönderilen bilgiler geçersiz."))
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    void getsUpdatesAndDeletesAnimal() throws Exception {
        AnimalResponse created = animalService.create(new CreateAnimalRequest(
                AnimalType.SHEEP, "Bulut", Gender.MALE));

        mockMvc.perform(get("/api/animals/{id}", created.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Bulut"));

        mockMvc.perform(put("/api/animals/{id}", created.id())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Bulut II",
                                  "gender": "FEMALE"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("SHEEP"))
                .andExpect(jsonPath("$.name").value("Bulut II"))
                .andExpect(jsonPath("$.gender").value("FEMALE"));

        mockMvc.perform(delete("/api/animals/{id}", created.id()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/animals/{id}", created.id()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
