package com.unigov.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(
            @Value("${CLOUDINARY_CLOUD_NAME}") String cloudName,
            @Value("${CLOUDINARY_API_KEY}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    /**
     * Uploads a file to Cloudinary and returns the secure URL.
     */
    public String storeFile(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "folder", "unigov"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    /**
     * Optional: Delete a file from Cloudinary using its public ID.
     */
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file from Cloudinary", ex);
        }
    }
}
