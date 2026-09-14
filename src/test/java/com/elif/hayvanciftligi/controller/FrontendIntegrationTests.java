package com.elif.hayvanciftligi.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FrontendIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void servesFarmGameAtRootAddress() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("index.html"));

        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("class=\"simulation-shell\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("id=\"open-create-dialog\"")))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("id=\"time-scale\""))))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("healthStatus"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("ageInMonths"))));
    }

    @Test
    void servesFrontendAssets() throws Exception {
        mockMvc.perform(get("/styles.css"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/app.js"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/farm3d.js"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("buildCropField")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("addVoxelScarecrow")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("addVoxelTractor")))
                .andExpect(content().string(org.hamcrest.Matchers.not(
                        org.hamcrest.Matchers.containsString("Human_Walk_Anim"))));

        mockMvc.perform(get("/vendor/three/three.module.js"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/vendor/three/three.core.js"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/vendor/three/addons/controls/OrbitControls.js"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/assets/voxel-farm/FBX/Animals/TVS_VoxelFarm_Goat.fbx"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/assets/voxel-farm/Animations/Animals/Chicken_Walk_Anim.fbx"))
                .andExpect(status().isOk());

    }
}
