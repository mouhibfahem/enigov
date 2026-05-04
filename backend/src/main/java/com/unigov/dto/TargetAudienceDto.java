package com.unigov.dto;

import java.util.List;

public class TargetAudienceDto {
    private boolean targetAll = true;
    private List<String> filieres;
    private List<String> promotions;

    public boolean isTargetAll() { return targetAll; }
    public void setTargetAll(boolean targetAll) { this.targetAll = targetAll; }
    public List<String> getFilieres() { return filieres; }
    public void setFilieres(List<String> filieres) { this.filieres = filieres; }
    public List<String> getPromotions() { return promotions; }
    public void setPromotions(List<String> promotions) { this.promotions = promotions; }
}
