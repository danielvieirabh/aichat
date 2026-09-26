package com.danzin.aichat.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;

@Configuration
public class LocalProjectScannerConfig {

    public record ProjectScanRequest(String directoryPath) {}
    public record ProjectScanResponse(String projectContent) {}

    @Bean
    @Description("Lê e analisa os arquivos de um projeto local no computador do usuário a partir de um caminho de pasta. OBRIGATÓRIO usar esta função se o usuário pedir para verificar um projeto local.")
    public Function<ProjectScanRequest, ProjectScanResponse> scanLocalProject() {
        return request -> {
            System.out.println("🚀 [SPRING BOOT] Executando leitura na pasta: " + request.directoryPath());
            Path startPath = Paths.get(request.directoryPath());

            if (!Files.exists(startPath) || !Files.isDirectory(startPath)) {
                return new ProjectScanResponse("Erro: O diretório fornecido não existe ou não é uma pasta válida.");
            }

            StringBuilder projectData = new StringBuilder();
            projectData.append("Conteúdo do projeto em: ").append(request.directoryPath()).append("\n\n");

            try (Stream<Path> paths = Files.walk(startPath)) {
                List<Path> validFiles = paths
                        .filter(Files::isRegularFile)
                        .filter(path -> {
                            String p = path.toString().toLowerCase();
                            return !p.contains(".git") && !p.contains("node_modules") &&
                                    !p.contains("target") && !p.contains("build") &&
                                    !p.endsWith(".jar") && !p.endsWith(".class");
                        })
                        .limit(30)
                        .toList();

                for (Path file : validFiles) {
                    projectData.append("--- ARQUIVO: ").append(startPath.relativize(file)).append(" ---\n");
                    try {
                        String content = Files.readString(file);
                        if (content.length() > 3000) content = content.substring(0, 3000) + "\n[TRUNCADO]";
                        projectData.append(content).append("\n\n");
                    } catch (IOException e) {
                        projectData.append("[Erro de leitura]\n\n");
                    }
                }
                return new ProjectScanResponse(projectData.toString());

            } catch (IOException e) {
                return new ProjectScanResponse("Erro ao ler diretório: " + e.getMessage());
            }
        };
    }
}