package com.unigov.entity;

public enum Promotion {
    PREMIERE_ANNEE,
    DEUXIEME_ANNEE,
    TROISIEME_ANNEE;

    public String getDisplayName() {
        switch (this) {
            case PREMIERE_ANNEE: return "1ère année";
            case DEUXIEME_ANNEE: return "2ème année";
            case TROISIEME_ANNEE: return "3ème année";
            default: return name();
        }
    }
}
