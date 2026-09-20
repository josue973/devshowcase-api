// 1. Entidade Perfil do Desenvolvedor
export interface Profile {
    id: string;
    name: string;
    bio: string;
    githubUrl: string;
    linkedinUrl: string;
}

// 2. Entidade Tecnologia
export interface Technology {
    id: string;
    name: string;
}

// 3. Entidade Projeto (ATUALIZADA)
export interface Project {
    id: string;
    title: string;
    description: string;
    repositoryUrl: string;
    profileId: string;
    technology: string; // Nova propriedade para filtragem
    upvotes: number;    // Nova propriedade para contar as curtidas
    averageRating: number; // Nova propriedade para a média de notas
}

// 4. Entidade Feedback / Avaliação (ATUALIZADA)
export interface Feedback {
    id: string;
    comment: string;
    rating: number;     // Nova propriedade: nota de 1 a 5
    projectId: string;
}
