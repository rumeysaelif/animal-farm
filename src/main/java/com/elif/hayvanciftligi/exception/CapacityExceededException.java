package com.elif.hayvanciftligi.exception;

import com.elif.hayvanciftligi.domain.AnimalType;

public class CapacityExceededException extends RuntimeException {

    public CapacityExceededException(AnimalType type) {
        super(type.getDisplayName() + " bölgesi dolu. En fazla "
                + type.getMaxCapacity() + " hayvan eklenebilir.");
    }
}
