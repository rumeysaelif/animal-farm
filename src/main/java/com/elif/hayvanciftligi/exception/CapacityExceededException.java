package com.elif.hayvanciftligi.exception;

import com.elif.hayvanciftligi.domain.AnimalType;

/** Bir hayvan türünün kapasitesi aşıldığında fırlatılır. */
public class CapacityExceededException extends RuntimeException {

    public CapacityExceededException(AnimalType type) {
        super(type.getDisplayName() + " bölgesi dolu. En fazla "
                + type.getMaxCapacity() + " hayvan eklenebilir.");
    }
}
