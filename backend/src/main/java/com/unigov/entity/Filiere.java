package com.unigov.entity;

public enum Filiere {
    INFO,
    INFOTRO,
    MECA,
    GSIL;

    public String getDisplayName() {
        switch (this) {
            case INFO: return "Informatique";
            case INFOTRO: return "Infotronique";
            case MECA: return "Mécatronique";
            case GSIL: return "GSIL";
            default: return name();
        }
    }
}
