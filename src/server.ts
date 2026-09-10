import express from 'express';
// Importação estável sem a extensão .ts no final, usando o arquivo direto
import { Profile, Technology, Project } from './models/index';

const app = express();
const PORT = 3000;

app.use(express.json());

// Nossos "bancos de dados" temporários em memória (listas vazias)
const profiles: Profile[] = [];
const technologies: Technology[] = [];
const projects: Project[] = [];

// Rota inicial de teste
app.get('/', (req, res) => {
    res.json({ mensagem: "API DevShowcase está rodando com sucesso!" });
});

/* ==========================================================================
   REQ 4: ENDPOINTS PARA PERFIS (PROFILES)
   ========================================================================== */

// 1. Rota para CADASTRAR um Perfil (POST)
app.post('/profiles', (req, res) => {
    const { name, bio, githubUrl, linkedinUrl } = req.body;

    // REQ 3: Validação simples (Garante que os campos obrigatórios não estão vazios)
    if (!name || !bio || !githubUrl || !linkedinUrl) {
        return res.status(400).json({ erro: "Todos os campos do perfil são obrigatórios!" });
    }

    // Cria o objeto do novo perfil com um ID único baseado no tamanho da lista
    const newProfile: Profile = {
        id: (profiles.length + 1).toString(),
        name,
        bio,
        githubUrl,
        linkedinUrl
    };

    profiles.push(newProfile); // Salva na nossa lista
    res.status(201).json(newProfile); // Retorna o perfil criado com sucesso
});

// 2. Rota para LISTAR todos os Perfis cadastrados (GET)
app.get('/profiles', (req, res) => {
    res.json(profiles);
});

/* ==========================================================================
   REQ 4: ENDPOINTS PARA TECNOLOGIAS (TECHNOLOGIES)
   ========================================================================== */

// 1. Rota para CADASTRAR uma Tecnologia (POST)
app.post('/technologies', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ erro: "O nome da tecnologia é obrigatório!" });
    }

    const newTech: Technology = {
        id: (technologies.length + 1).toString(),
        name
    };

    technologies.push(newTech);
    res.status(201).json(newTech);
});

// 2. Rota para LISTAR todas as Tecnologias (GET)
app.get('/technologies', (req, res) => {
    res.json(technologies);
});
/* ==========================================================================
   REQ 4: ENDPOINTS PARA PROJETOS (PROJECTS)
   ========================================================================== */

// 1. Rota para CADASTRAR um Projeto vinculado a um Perfil (POST)
app.post('/projects', (req, res) => {
    const { title, description, repositoryUrl, profileId } = req.body;

    // REQ 3: Validação (Garante que nenhum campo obrigatório do projeto está vazio)
    if (!title || !description || !repositoryUrl || !profileId) {
        return res.status(400).json({ erro: "Todos os campos do projeto são obrigatórios!" });
    }

    // REQ 2: Validação de Relacionamento (Garante que o perfil informado realmente existe no banco)
    const profileExists = profiles.find(p => p.id === profileId);
    if (!profileExists) {
        return res.status(404).json({ erro: "Não é possível criar o projeto. O Profile ID informado não existe!" });
    }

    const newProject: Project = {
        id: (projects.length + 1).toString(),
        title,
        description,
        repositoryUrl,
        profileId
    };

    projects.push(newProject);
    res.status(201).json(newProject);
});

// 2. Rota para LISTAR todos os Projetos (GET)
app.get('/projects', (req, res) => {
    res.json(projects);
});

// Liga o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
