package com.unigov.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${enigov.app.frontendUrl}")
    private String frontendUrl;

    @Value("${enigov.app.fromEmail}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String fullName, String token) {
        String subject = "EniGov — Vérifiez votre adresse email";
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;

        // Fallback: Log the link to the console in case SMTP fails
        System.out.println("=================================================");
        System.out.println("LIEN DE VÉRIFICATION POUR " + fullName + " :");
        System.out.println(verifyUrl);
        System.out.println("=================================================");

        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #1e293b; font-size: 24px; margin: 0;">🎓 EniGov</h1>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Plateforme de gouvernance étudiante</p>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 8px;">Bienvenue, %s !</h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                            Merci de vous être inscrit(e) sur EniGov. Pour activer votre compte, cliquez sur le bouton ci-dessous :
                        </p>
                        <div style="text-align: center; margin: 24px 0;">
                            <a href="%s" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                                Vérifier mon email
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                            Ce lien expire dans 24 heures.
                        </p>
                    </div>
                </div>
                """.formatted(fullName, verifyUrl);

        sendHtmlEmail(to, subject, html);
    }

    public void sendPasswordResetEmail(String to, String fullName, String token) {
        String subject = "EniGov — Réinitialisation du mot de passe";
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String html = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #1e293b; font-size: 24px; margin: 0;">🎓 EniGov</h1>
                        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Plateforme de gouvernance étudiante</p>
                    </div>
                    <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 8px;">Bonjour, %s</h2>
                        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :
                        </p>
                        <div style="text-align: center; margin: 24px 0;">
                            <a href="%s" style="display: inline-block; background: #ef4444; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                                Réinitialiser le mot de passe
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                            Ce lien expire dans 15 minutes. Si vous n'avez pas fait cette demande, ignorez cet email.
                        </p>
                    </div>
                </div>
                """.formatted(fullName, resetUrl);

        sendHtmlEmail(to, subject, html);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        System.out.println("[MAIL] Attempting send: to=" + to + " from=" + fromEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("[MAIL] Send SUCCESS to=" + to);
        } catch (Exception e) {
            System.err.println("[MAIL] Send FAILED to=" + to + " : " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'envoi de l'email : " + e.getMessage(), e);
        }
    }
}
