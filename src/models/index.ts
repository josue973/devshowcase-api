// 1. Entidade Perfil do Desenvolvedor
export interface Profile {
    id: string;
    name: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
}

// 2. Entidade Tecnologia (Ex: React, Node, etc)
export interface Technology {
    id: string;
    name: string;
}

// 3. Entidade Projeto
export interface Project {
    id: string;
    title: string;
    description: string;
    repositoryUrl: string;
    profileId: string; // Relacionamento: Vincula o projeto a um perfil
}

// 4. Entidade Feedback / Avaliação
export interface Feedback {
    id: string;
    comment: string;
    projectId: string; // Relacionamento: Vincula o feedback a um projeto
}
